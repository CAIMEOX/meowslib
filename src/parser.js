const DefaultOptions = [
  {
    abbreviation:'p',
    alias:'position',
    len:3
  },
  {
    abbreviation:'b',
    alias:'block',
    len:1
  },
  {
    abbreviation:'s',
    alias:'shape',
    len:1
  },
  {
    abbreviation:'j',
    alias:'probability',
    len:0
  },
  {
    abbreviation:'s',
    alias:'shape',
    len:1
  },
  {
    abbreviation:'l',
    alias:'length',
    len:1
  },
  {
    abbreviation:'w',
    alias:'width',
    len:1
  },
  {
    abbreviation:'h',
    alias:'height',
    len:1
  },
  {
    abbreviation:'z',
    alias:'path',
    len:1
  },
  {
    abbreviation:'d',
    alias:'data',
    len:1
  },
  {
    abbreviation:'r',
    alias:'radius',
    len:1
  },
  {
    abbreviation:'f',
    alias:'direction',
    len:1
  },
  {
    abbreviation:'v',
    alias:'value',
    len:1
  }
];
const compact = arr => arr.filter(item => item)
class Parser {
  constructor(command, options, methods){
    if(!methods)return;
    let commands = command.split('|');
    let result = [];
    this.generator = ['setblock','clone','summon'];
    this.methods = methods;
    commands.forEach((cmd,index) => {
      result.push(this.parse(cmd, options));
    });
    let builder = 'setblock';
    this.generator.forEach((method) => {
      let i = command.split(' ');
      if(i.hasOwnProperty(method))builder = method;
    });
    return {
      config:result,
      generator:builder
    }
  }

  parse(command, options){
    options = options ? Object.assign(DefaultOptions, options) : DefaultOptions;
    let output = {};

    this.command = command.trim().split(' ');

    this.command.forEach((value, index) => {
      Object.assign(output,this.getOptions(value, options, index));
      if(this.methods.indexOf(value.trim()) !== -1){
        output.exec = value.trim();
      }
    });

    return output;
  }

  getOptions(value, options, index){
    value = value.trim();
    let element = {}
    options.forEach((v) => {
      if(v.abbreviation == value[1] || v.alias == value.substr(2,value.length)){
        if(value[1] == 'j' || value.substr(2,value.length) == 'probability'){
          let $PT = [], weight = 0;
          this.command = compact(this.command);
          let ProbabilityTable = this.command.slice(this.command.indexOf('{') + 1, this.command.lastIndexOf('}'));
          ProbabilityTable.forEach((v,i) =>{
            $PT.push({
              weight:parseInt(v.split(',')[1]) || 1,
              block:v.split(':')[0] || 'air',
              data:v.split(',')[0].split(':')[1] || 0
            });
            weight = weight + parseInt(v.split(',')[1] || 1);
          });
          element['probability'] = {
            table:$PT,
            sum:weight
          }
        }else{
          element[v.alias] = v.len === 1 ?
          toInt(this.command.splice(this.command.indexOf(value) + 1,v.len)[0]):
          this.command.splice(this.command.indexOf(value) + 1,v.len).map(x => toInt(x));
        }
      }
    });
    return element;
  }
}

function toInt(num){
  return isNaN(num) ? num : parseInt(num);
}


module.exports = Parser;
