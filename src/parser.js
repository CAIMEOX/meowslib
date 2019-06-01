const DefaultOptions = [
  {
    abbreviation:'p',
    alias:'position',
    len:3
  },
  {
    abbreviation:'d',
    alias:'delay',
    len:1
  }
];
class Parser {
  constructor(command, options){
    options = options ? options.concat(DefaultOptions) : DefaultOptions;
    let output = {
      options:{}
    }
    command = command.trim().split(' ');
    command.forEach((value, index) => {
      if(value[0] == '-' && has_value(options, 'abbreviation', value[1]) != -1){
        output.options[options[has_value(options, 'abbreviation', value[1])].alias] = command.slice(index + 1, index + options[has_value(options, 'abbreviation', value[1])].len + 1);
      }else if(value.substr(0,2) == '--' && has_value(options, 'alias', value.substr(2,value.length)) != -1){
        output.options[options[has_value(options, 'alias', value.substr(2,value.length))].alias] = command.slice(index + 1, index + options[has_value(options, 'alias', value.substr(2,value.length))].len + 1);
      }
    });
    return output;
  }
}

function has_value(arr, key, value){
  let index = -1;
  arr.forEach((v, i) => {
    if(v[key] == value){
      index = i;
    }
  });
  return index;
}

module.exports = Parser;
