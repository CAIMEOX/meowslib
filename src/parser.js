const fs = require('fs');
const commandLineArgs = require('command-line-args');
class Parser {
    constructor(exec=[], options){
        options = options ? options : {
            name:'facing',
            alias:'f',
            type:String
        };
        this.gen = [
            'clone', 'summon', 'setblock', 'fill'
        ];
        this.options = [
            {
                name: 'preview',
                type: Boolean
            },
            {
                name: 'command',
                multiple: true,
                defaultOption: true
            },
            {
                name: 'continue',
                alias: 'c',
                type: Number
            },
            {
                name: 'interval',
                alias: 'i',
                type: Number
            },
            {
                name: 'length',
                alias: 'l',
                type: Number
            },
            {
                name: 'width',
                alias:'w',
                type: Number
            },
            {
                name: 'filter',
                multiple: true,
                type: u => new Unit(u)
            },
            {
                name: 'radius',
                alias: 'r',
                multiple: true,
                type: Number
            },
            {
                name: 'path',
                alias: 'p',
                type: String
            },
            {
                name: 'split',
                type: Boolean
            },
            {
                name:'mix',
                alias: 'm',
                multiple: true,
                type: m => new Block(m)
            },
            {
                name:'height',
                alias:'h',
                type:Number
            },
            {
                name:'block',
                alias:'b',
                type:String
            },
            {
                name:'data',
                alias:'d',
                type:Number
            },
            {
                name:'entity',
                alias:'e',
                type:String
            },
            {
                name:'shape',
                alias:'s',
                type:String
            }
        ].concat(options);
        this.exec = exec;
    }

    parsePipe(args){
        args = args.split('|');
        let r = [];
        args.forEach((v)=>{
            r.push(this.parse(v.trim()))
        });
        return r;
    }
    
    parse(argv){
        let r = {};
        argv = Array.prototype.isPrototypeOf(argv) ? argv : argv.split(' ');
        let opt;
        try {
            opt = commandLineArgs(this.options,{argv});
        } catch (e){
            r.err = e.message;
            return r;
        }
        if (opt.command) {
            r.data = opt;
            if (Array.prototype.isPrototypeOf(opt.command)){
                this.exec.forEach((v) => {
                    if (opt.command.includes(v)) {
                        r.exec = v
                    }
                });
                if (!r.exec){
                    r.err = 'No exec';
                    return r;
                }
                r.async = opt.command.includes('async'); 
                this.gen.forEach((v) => {
                    if (opt.command.includes(v)) {
                        r.gen = v
                    }
                });
                if (!r.gen)r.gen = 'setblock';
            } else {
                this.exec.forEach((v) => {
                    if (v == opt.command) {
                        r.exec = v
                    }
                });
                if (!r.exec)r.err = 'No exec'
            }
        }
        return r;
    }

    registerCommand(name, opt){
        this.exec.push(name);
        this.options = opt ? this.options.concat(opt) : this.options;
    }
}

class File {
    constructor (filename) {
        this.filename = filename;
        this.exists = fs.existsSync(filename)
    }
    
    getData(){
        if (this.exists){
            return fs.readFileSync(this.filename)
        }
    }
}

class Block {
    constructor(block) {
        let [b, w] = block.split(',');
        let [name ,d] = b.split(':');
        return {
            name, data:parseInt(d) || 0, weight:parseInt(w) || 1
        }
    }
}

class Unit {
    constructor(block){
        let [name, data] = block.split(':');
        return {
            name, data:parseInt(data)
        }
    }
}

// let p = new Parser([{
    // name: 'verbose', alias: 'v', type: Boolean
// }],['round'])
// p.registerCommand('circle',[])
// console.log(p.parsePipe('circlex summon -m air:1,0 stone:2,1 -r 111 |round'))

module.exports = Parser;