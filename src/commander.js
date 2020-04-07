class Commander{
    constructor(options){
        this.options = options
    }

    parseConfigs(configs, generator){
        let pos = Object.assign({},this.options,configs[0].data).position;
        let vec = [pos];
        let cache = [];
        let opt;
        for (let c of configs){
            if (c.err) return {
                err: c.err
            }
            opt = Object.assign({},this.options,c.data);
            vec === vec.length === 0 ? [this.options.position] : vec;
            for (let p of vec) {
                opt.position = p;
                let structure = newStructure(generator[c.exec], opt);
                if (structure === 0)return {
                    err: 'No BlockVec'
                }
                cache.push(structure);
            }
            vec = reduceDimension(cache);
            cache = [];
        }
        if (!vec){
            return {
                err: 'No exec'
            }
        }
        if (vec.err){
            return vec;
        }
        if (opt.split){
            let chunks = this.split(pos, vec);
            return this.setBlockSplit(chunks, opt);
        } else {
            return this.setblock(vec, opt)
        }
        
    }

    setblock(structure, config){
        if(!structure[0])return;
        let cmd_queue = [];
        for(let i = 0 ; i < structure.length ; i++){
          cmd_queue.push(`setblock ${structure[i].join(' ')} ` + (structure[i].length === 3 ? (config.block + ' ' + config.data) : ''));
        }
        return cmd_queue;
    }

    split(pos, vec){
        let [x, _, z] = pos;
        let chunks = new Map();
        vec.forEach((value) => {
            let w = Math.round((value[0] - x) / 128);
            let l = Math.round((value[2] - z) / 128);
            if(!chunks.get(w))chunks.set(w,new Map());
            if(!chunks.get(w).get(l))chunks.get(w).set(l,[]);
            chunks.get(w).get(l).push(value);
        });
        return chunks;
    }

    setBlockSplit(chunks, c){
        let cmdVec = []
        for (let [_,l] of chunks){
            for (let [_,w] of l){
                cmdVec.push(`tp @s ${w[0].slice(0,3).join(' ')}`);
                cmdVec = cmdVec.concat(this.setblock(w, c))
            }
        }
        return cmdVec;
    }

    updateOptions(opt){
        Object.assign(this.options, opt)
    }
}

function newStructure(gen, opts){
        let vec = gen(opts);
        if (vec.length === 0){
            return 0
        }
        if (opts.continue && opts.continue > 0 && opts.continue < 100){
            vec.splice(0, opts.continue / 100 * vec.length);
        };
        if (opts.mix) {
            let sum = 0;
            let len = vec.length;
            opts.mix.forEach((m) => {
                if (m.weight > 0) {
                    sum += parseInt(m.weight);
                }
            });
            let vec2 = [];
            opts.mix.forEach((b) => {
                for (let i = 0 ; i < b.weight / sum * len; i++) {
                    let [i,re] = RandomElement(vec);
                    if (!re) continue;
                    vec.splice(i, 1);
                    if (b.name !== 'air') {
                        re[3] = b.name;
                        re[4] = b.data;
                        vec2.push(re)
                    }
                }
                
            });
            vec = vec2;
        }
        if (opts.filter) {
            vec = vec.filter((b) => {
                for (let v of opts.filter){
                    if (!b[3]){
                        if (v.name === opts.block && (v.data === -1 || v.data === opts.data)){
                            return false;
                        }
                    } else if (b[3] === v.name && (b[4] === v.data || v.data === -1)){   
                        return false;
                    }
                }
                return true;
            });
        }
        return vec;
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
    let r = Math.floor(Math.random() * items.length)
	return [r,items[r]];
}

module.exports = Commander;


