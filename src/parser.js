const DefaultOptions = {
  r:['radius',1,toInt.bind(this)],
  f:['direction',1,x = x => x],
  p:['position',3,toInt.bind(this)],
  b:['block',1,x = x => x],
  d:['data',1,toInt.bind(this)],
  bp:['begin',3,toInt.bind(this)],
  ep:['end',3,toInt.bind(this)],
  e:['entity',1,x = x => x],
  j:['probability',1],
  s:['shape',1,x = x => x],
  l:['length',1,toInt.bind(this)],
  w:['width',1,toInt.bind(this)],
  h:['height',1,toInt.bind(this)],
  z:['path',1,x = x => require('path').normalize(x)],
  b2:['block2',1,x = x => x],
  d2:['data2',1,x = x => x],
  m:['method',1,x = x => x],
  m2:['method2',1,x = x => x],
  t:['target',1,x = x => x]
}
const compact = arr => arr.filter(item => item);
class Parser {
  constructor(command, options, methods){
    let commands = command.split('|');
    let result = [];
    this.generator = ['setblock','clone','summon','dump','testforblock'];
    this.methods = methods;
    commands.forEach((cmd) => {
      result.push(this.parse(cmd, options));
    });
    let builder = 'setblock',
        sync = false;
    this.generator.forEach((method) => {
      let i = command.split(' ');
      if(i.includes('--sync'))sync = true;
      if(i.includes(method))builder = method;
    });
	  // console.log(result,builder);

    return {
      config:result,
      generator:builder,
      sync:sync
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
    function Probability(cmd){
      let $PT = [], weight = 0;
      cmd = compact(cmd);
      let ProbabilityTable = cmd.slice(cmd.indexOf('{') + 1, cmd.lastIndexOf('}'));
      for(let v of ProbabilityTable){
        $PT.push({
          weight:parseInt(v.split(',')[1]) || 1,
          block:v.split(':')[0] || 'air',
          data:v.split(',')[0].split(':')[1] || 0
        });
        weight += parseInt(v.split(',')[1] || 1);
      }
      return {
        table:$PT,
        sum:weight
      };
    }
    let arg = value.trim(),
        element = {};
    for(let v of Object.keys(options)){
      let start = this.command.indexOf(arg);
      if(arg[0] === '-' && arg.substr(1,arg.length) === v){
        if(v === 'j')element['probability'] = Probability(this.command)
        else{
          let val = this.command.splice(start + 1, options[v][1]).map(options[v][2]);
          element[options[v][0]] = val.length === 1 ? val[0] : val;
        }
      }else if(arg[0] === '-' && arg[1] === '-' && arg.substr(2, arg.length) === options[v][0]){
        if(options[v][0] === 'probability')element['probability'] = Probability(this.command)
        else{
          let val = this.command.splice(start + 1, options[v][1]).map(options[v][2]);
          element[options[v][0]] = val.length === 1 ? val[0] : val;
        }
      }
    }
    return element;
  }
}

function toInt(num){
  return isNaN(num) ? num : parseInt(num);
}

//console.log(new Parser('round --position 0 0 0 --path /home --probabilit { air:0,1 tnt:0,2 } --startpoint x a z -d 2 -e xxx | -s -j { air:0,1 tnt:0,2 } 0 0 0 clone',{},['round']))
module.exports = Parser;
