const MeoWS = require('meowslib');

class Commander {
  static ParseConfig(json, builder, options){
    let {
      config, generator
    } = json
    //@Config 现有参数
    //@Options 原参数
    let Pipe = [Object.assign(options,config[0]).position];
    let List = [];
    for(let c of config){
      Object.assign(options, c);
      Pipe = Pipe.length === 0 ? [options.position] : Pipe;
      //console.log("Options: ", options, "\nconfig: ",c,"\nPipe:",Pipe,'\n======================');
      for(let p of Pipe){
        Object.assign(options,{
          position:p
        });
          List.push(builder.methods[c.exec](Object.assign(options,c)));
      }
      Pipe = reduceDimension(List);
      List.length = 0;
    }
    return this[generator](multiDimensionalUnique(Pipe),options);
  }

  static MakeChunks(position, list){
    let [x, y, z] = position;
    let chunks = new Map();
    list.forEach((value) => {
        let w = Math.round((value[0] - x) / 128);
        let l = Math.round((value[2] - z) / 128);
        if(!chunks.get(w))chunks.set(w,new Map());
        if(!chunks.get(w).get(l))chunks.get(w).set(l,[]);
        chunks.get(w).get(l).push(value);
    });
    return chunks;
  }

  static setblock(structure, config){
    if(!structure[0])return;
    let cmd_queue = [];
    for(let i = 0 ; i < structure.length ; i++){
      cmd_queue.push(`setblock ${structure[i].join(' ')} ` + (structure[i].length === 3 ? (config.block + ' ' + config.data) : ''));
    }
    return cmd_queue;
  }

  static summon(structure, config){
    let cmd_queue = [];
    for(let i = 0 ; i < structure.length ; i++){
      cmd_queue.push(`summon ${config.entity} ${structure[i].join(' ')}`);
    }
    return cmd_queue;
  }

  static PipeBuilder(config){
    for(let i in config){
      config[i].exec
    }
  }

  static clone(structure, config){
    let cmd_queue = [];
    let {method, method2} = config;
    if(method === 'filtered'){
      for(let i = 0 ; i < structure.length ; i++){
        cmd_queue.push(`clone ${config.begin.join(' ')} ${config.end.join(' ')} ${config.position.join(' ')} filtered ${method2} ${config.block}`);
      }
    }else{
      for(let i = 0 ; i < structure.length ; i++){
        cmd_queue.push(`clone ${config.begin.join(' ')} ${config.end.join(' ')} ${config.position.join(' ')} ${method} ${method2}`);
      }
    }
    return cmd_queue;
  }

  static fillTile(structure, config){
    let [x, y, z] = config.position;
    let cmd_queue = [];
    structure.forEach((coordinates, index) => {
      coordinates[0] += x;
      coordinates[1] += y;
      coordinates[2] += z;
      coordinates[3] += x;
      coordinates[4] += y;
      coordinates[5] += z;
      cmd_queue.push(`fill ${coordinates.join(' ')} ${config.block}`);
    });
  }

  static ProbabilityBuilder(structure, config){
    let cmd_queue = [], len = structure.length;
		let {
			table, sum
		} = config.probability;
		for(let i in table){
      for(let j = 0 ; j < Math.round(table[i].weight / sum * len); j++){
        let random = RandomElement(structure);
        if(!random)continue;
        structure.splice(structure.indexOf(random),1);
        cmd_queue.push(`setblock ${random.join(' ')} ${table[i].block} ${table[i].data}`)
      }
		}
    return cmd_queue;
	}

}

function multiDimensionalUnique(arr) {
	let uniques = [];
	let itemsFound = {};
	for (let i = 0, l = arr.length; i < l; i++) {
		let stringified = JSON.stringify(arr[i]);
		if (itemsFound[stringified]) {
			continue;
		}
		uniques.push(arr[i]);
		itemsFound[stringified] = true;
	}
	return uniques;
}

function reduceDimension(arr) {
	return Array.prototype.concat.apply([], arr);
}

function RandomElement(items) {
	return items[Math.floor(Math.random() * items.length)];
}

module.exports = Commander;
