class Commander {
  constructor(server, config){}

  static setTile(structure, config){
    let [x, y, z] = config.position;
    let cmd_queue = [];
    for(let i = 0 ; i < structure.length ; i++){
      cmd_queue.push(`setblock ${x + structure[i][0]} ${y + structure[i][1]} ${z + structure[i][2]} ${config.block}`)
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
}



module.exports = Commander;
