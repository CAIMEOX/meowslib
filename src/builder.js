const fs = require('fs');
const constants = require('./constants');
const getUsage = require('command-line-usage');
class Builder {
    constructor(session) {
        this.args = {
            radius: {
                name: '{cyan radius}',
                alias: '{cyan r}',
                multiple: true,
                type: Number,
                description: 'The radius of the structure.'
            },
            height: {
                name: '{cyan height}',
                alias: '{cyan h}',
                type: Number,
                description: 'The height of the structure.'
            },
            path: {
                name:'{cyan path}',
                alias:'{cyan p}',
                type: String,
                description: 'The input files to process.'
            },
            
            mix: {
                name:'{cyan mix}',
                alias: '{cyan m}',
                typeLabel: '{underline Block:Weight[]}',
                description: 'Mixed random blocks generate.'
            },
            filter: {
                name: '{cyan filter}',
                typeLabel: '{underline Block[]}',
                description: 'Filter out some blocks',
            },
            facing: {
                name: '{cyan facing}',
                alias: '{cyan f}',
                description: 'The facing of the structure.Expected values: x, y or z.'
            }
        }
        this.session = session;
        this.methods = {
            alias: (options) => {
                let {command} = options;
                // constants
            },
            registerCommand: (name, opt) => {
                session.parser.registerCommand(name, opt);
            },
            helpme: (options) => {
                let {list} = options;
                session.tellraw(formatColor(getUsage(this.sections[list])));
                return {err:'None'}
                
            },
            help: (options) => {
                let {
                    list
                } = options;
                list = list ? list : 0;
                switch (list) {
                    default:
                        session.tellraw('Type \'\u00a77help -ls <page: int>\u00a7e\'to get help.');
                        //session.sendCommand('say test');
                        break;
                    case 1:
                        session.sendCommand('tellraw @s {\"rawtext\":[{\"text\":\"\u00a72---Showing help page 1 of 4 (help -ls <page>)---\n\u00a7fhelp -ls <page: int>\nstop\nround -f <x|y|z> -r <radius: int>\ncircle -f <x|y|z> -r <radius: int>\nsphere -s <hollow|solid> -r <radius: int>\nellipse -f <x|y|z> -l <length: int> -w <width: int>\n\u00a72Tip: Use \'set\' command to preset a required parameter to auto-input it into commands\"}]}');
                        break;
                    case 2:
                        session.sendCommand('tellraw @s {\"rawtext\":[{\"text\":\"\u00a72---Showing help page 2 of 4 (help -ls <page>)---\n\u00a7fellipsoid -h <height: int> -l <length: int> -w <width: int>\ncone -r <radius: int> -h <height: int>\noblong -bp <begin: x y z> -ep <end: x y z>\nline -bp <begin: x y z> -ep <end: x y z>\nget\nset <collector: Parser> <value: Parameter>\n\u00a7bpalette\u00a77\n\u00a72Tip: Use \'set\' command to preset a required parameter to auto-input it into commands\"}]}');
                        break;
                    case 3:
                        session.sendCommand('tellraw @s {\"rawtext\":[{\"text\":\"\u00a72---Showing help page 3 of 4 (help -ls <page>)---\n\u00a7cpaint\u00a7f -z <path: png>\n\u00a7cnbt\u00a7f -z <path: nbt>\n\u00a7cschematic\u00a7f -z <path: schematic>\n\u00a7cloadfunction\u00a7f -z <path: mcfunction>\n\u00a7bexec\u00a7f <command: CommandName>\n\u00a7beval\u00a7f <command: System>(DEPRECATED)\n\u00a72Tip: Use \'set\' command to preset a required parameter to auto-input it into commands\"}]}');
                        break;
                    case 4:
                        session.sendCommand('tellraw @s {\"rawtext\":[{\"text\":\"\u00a72---Showing help page 4 of 4 (help -ls <page>)---\n\u00a7bligature\u00a7f -bp <begin: x y z> -ep <end: x y z>\n\u00a7btorus\u00a7f -f <x|y|z> -r <radius: int> -a <accuracy: int> -l <length: int> -w <width: int>\n\u00a7belliptictorus\u00a7f -f <x|y|z> -r <radius: int> -a <accuracy: int> -l <length: int> -w <width: int>\n\parameterlist\n\u00a72Tip: Use \'set\' command to preset a required parameter to auto-input it into commands\"}]}');
                        break;
                }
                //switch (command) {
                //default:
                //session.tellraw('Type \'\u00a77help -l <page: int>\u00a7e\' or \'\u00a77help -c [command: CommandName]\u00a7e\' to get help.');
                //session.sendCommand('say ' + command);
                //console.log(command);
                //break;
                //}	
            },
            heart: (options) => {
                let {
                    position,
                    radius,
                    facing,
                    height
                } = options;
                let [x, y, z] = position;
                let area = [];
                let i = 0,
                    j = 0;
                let rate = 1 / radius;
                let rateX = 1 / radius + 0.01;
                for (let y = 1.2; y > -1.0; y -= rateX) {
                    for (let x = -1.1; x < 1.2; x += rate) {
                        let a = x * x + y * y - 1;
                        if (a * a * a - x * x * y * y * y <= 0.0) {
                            if (!area[i]) {
                                area[i] = []
                            }
                            area[i][j] = true;
                        } else {
                            if (!area[i]) {
                                area[i] = []
                            }
                            area[i][j] = false;
                        }
                        j++;
                    }
                    i++;
                    j = 0;
                }
                let blocks = [];
                area.forEach((v, i) => {
                    v.forEach((vv, ii) => {
                        if (vv) {
                            switch (facing) {
                                case 'x':
                                    for (let h = 0; h < height; h++){
                                        blocks.push([
                                        x + h, y + i, z + ii
                                        ]);
                                    }
                                    break;
                                default:
                                case 'y':
                                    for (let h = 0; h < height; h++){
                                        blocks.push([
                                            x + i, y + h, z + ii
                                        ]);
                                    }
                                    break;
                                case 'z':
                                    for (let h = 0; h < height; h++){
                                        blocks.push([
                                            x + i, y + ii, z + h
                                        ]);
                                    }
                                    break;
                            }

                        }
                    })
                })
                return blocks
            },
            message: (options) => {
                session[options.mtd](options.msg);
            },
            stop: () => {
                session.stop = true;
                session.tellraw('Stopped!');
                return {err:'None'}
            },
            round: (options) => {
                let {
                    facing,
                    radius,
                    height,
                    position
                } = options;
                let [r0, r1] = radius.length === 2 ? radius : [radius, 0];
                let [r, ir] = r0 < r1 ? [r1, r0] : [r0, r1];
                height = height ? height : 0;
                let [x, y, z] = position;
                let session = [];
                switch (facing) {
                    case "x":
                        for (let h = 0; h < height; h++) {
                            for (let i = -r; i <= r; i++) {
                                for (let j = -r; j <= r; j++) {
                                    if (i * i + j * j < r * r && i * i + j * j >= ir * ir) {
                                        session.push([x + h, y + i, z + j]);
                                    }
                                }
                            }
                        }
                        break;
                    default:
                    case "y":
                        for (let h = 0; h < height; h++) {
                            for (let i = -r; i <= r; i++) {
                                for (let j = -r; j <= r; j++) {
                                    if (i * i + j * j < r * r && i * i + j * j >= ir * ir) {
                                        session.push([x + i, y + h, z + j]);
                                    }
                                }
                            }
                        }
                        break;
                    case "z":
                        for (let h = 0; h < height; h++) {
                            for (let i = -r; i <= r; i++) {
                                for (let j = -r; j <= r; j++) {
                                    if (i * i + j * j < r * r && i * i + j * j >= ir * ir) {
                                        session.push([x + i, y + j, z + h]);
                                    }
                                }
                            }
                        }
                        break;
                }
                return session;
            },
            circle: (options) => {
                let {
                    facing,
                    radius,
                    height,
                    position
                } = options;
                height = height ? height : 0;
                let [x, y, z] = position;
                let session = [];
                switch (facing) {
                    case "x":
                        for (let h = 0; h < height; h++) {
                            for (let i = -radius; i <= radius; i++) {
                                for (let j = -radius; j <= radius; j++) {
                                    if (i * i + j * j < radius * radius && i * i + j * j >= (radius - 1) * (radius - 1)) {
                                        session.push([x + h, y + i, z + j]);
                                    }
                                }
                            }
                        }
                        break;
                    case "y":
                        for (let h = 0; h < height; h++) {
                            for (let i = -radius; i <= radius; i++) {
                                for (let j = -radius; j <= radius; j++) {
                                    if (i * i + j * j < radius * radius && i * i + j * j >= (radius - 1) * (radius - 1)) {
                                        session.push([x + i, y + h, z + j]);
                                    }
                                }
                            }
                        }
                        break;
                    case "z":
                        for (let h = 0; h < height; h++) {
                            for (let i = -radius; i <= radius; i++) {
                                for (let j = -radius; j <= radius; j++) {
                                    if (i * i + j * j < radius * radius && i * i + j * j >= (radius - 1) * (radius - 1)) {
                                        session.push([x + i, y + j, z + h]);
                                    }
                                }
                            }
                        }
                        break;
                }
                return session;
            },
            sphere: (options) => {
                let {
                    radius,
                    position
                } = options;
                let [r0, r1] = radius.length === 2 ? radius : [radius, 0];
                let [r, ir] = r0 < r1 ? [r1, r0] : [r0, r1];
                let [x, y, z] = position;
                let session = [];
                for (let i = -r; i <= r; i++) {
                    for (let j = -r; j <= r; j++) {
                        for (let k = -r; k <= r; k++) {
                            if (i * i + j * j + k * k <= r * r && i * i + j * j + k * k >= ir * ir) {
                                session.push([x + i, y + j, z + k]);
                            }
                        }
                    }
                }
                return session;
            },
            ellipse: (options) => {
                let {
                    facing,
                    length,
                    width,
                    height,
                    position
                } = options;
                let [x, y, z] = position;
                let session = [];
                switch (facing) {
                    case "x":
                        for (let h = 0; h < height; h++) {
                            for (let i = -length; i <= length; i++) {
                                for (let j = -width; j <= width; j++) {
                                    if ((i * i) / (length * length) + (j * j) / (width * width) < 1) {
                                        session.push([x + h, y + i, z + j]);
                                    }
                                }
                            }
                        }
                        break;
                    case "y":
                        for (let h = 0; h < height; h++) {
                            for (let i = -length; i <= length; i++) {
                                for (let j = -width; j <= width; j++) {
                                    if ((i * i) / (length * length) + (j * j) / (width * width) < 1) {
                                        session.push([x + i, y + h, z + j]);
                                    }
                                }
                            }
                        }
                        break;
                    case "z":
                        for (let h = 0; h < height; h++) {
                            for (let i = -length; i <= length; i++) {
                                for (let j = -width; j <= width; j++) {
                                    if ((i * i) / (length * length) + (j * j) / (width * width) < 1) {
                                        session.push([x + i, y + j, z + h]);
                                    }
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }
                return session;
            },
            ellipsoid: (options) => {
                let {
                    length,
                    height,
                    width,
                    position
                } = options;
                let [x, y, z] = position;
                let session = [];
                for (let i = -length; i <= length; i++) {
                    for (let j = -width; j <= width; j++) {
                        for (let k = -height; k <= height; k++) {
                            if ((i * i) / (length * length) + (j * j) / (width * width) + (k * k) / (height * height) <= 1) {
                                session.push([x + i, y + j, z + k]);
                            }
                        }
                    }
                }
                return session;
            },
            cone: (options) => {
                let {
                    r = radius,
                        h = height
                } = options;
                let session = [];
                for (var m = h; m >= 0; m--) {
                    for (var i = -r; i <= r; i++) {
                        for (var j = -r; j <= r; j++) {
                            var u = r / h * m
                            if (i * i + j * j <= u * u && i * i + j * j >= (u - 1) * (u - 1))
                                session.push([x + i, y + h - m, z + j])
                        }
                    }
                }
                for (var m = r; m > 0; m--) {
                    for (var i = -r; i <= r; i++) {
                        for (var j = -r; j <= r; j++) {
                            var u = h / r * m
                            if (i * i + j * j <= (r - m) * (r - m) && i * i + j * j >= ((r - m) - 1) * ((r - m) - 1))
                                session.push([x + i, y + u, z + j])
                        }
                    }
                }
                return session;
            },
            oblong: (options) => {
                let {
                    begin,
                    end,
                } = options;
                let session = [];
                let [sx, sy, sz] = begin;
                let [ex, ey, ez] = end;
                let minX = Math.min(sx, ex);
                let maxX = Math.max(sx, ex);
                let minY = Math.min(sy, ey);
                let maxY = Math.max(sy, ey);
                let minZ = Math.min(sz, ez);
                let maxZ = Math.max(sz, ez);
                for (let px = minX; px < maxX; px++) {
                    for (let py = minY; py < maxY; py++) {
                        for (let pz = minZ; pz < maxZ; pz++) {
                            session.push([px, py, pz]);
                        }
                    }
                }
                return session;
            },
            get: (options) => {
                let {target} = options;
                session.clr.getPosition().then((v) => {
                    session.tellraw('Position Got<'+ (target || 'normal') +'>: ' + v.join());
                    switch (target){
                        case 'begin':
                            session.cmd.updateOptions({
                                begin: v
                            });
                        break;
                        case 'end':
                            session.cmd.updateOptions({
                                end: v
                            });
                        break;
                        default:
                            session.cmd.updateOptions({
                                position: v
                            });
                        break;
                    }
                });
                return {err:'None'}
            },
            history: (options) => {
                if (!session.clr.history[options.value] || !options.value) return;
                session.tellraw('History: \n' + collector.history[options.value].join(';\n'));
            },
            set: (options) => {
                delete options.command;
                session.cmd.updateOptions(options)
                session.tellraw('Options updated: ' + JSON.stringify(options));
                return [];
            },
            eval: (options) => {
                let cmd = options.message;
                let code = cmd.substr(cmd.indexOf(' '), cmd.length);
                let exec = require('child_process').exec;
                exec(code,
                    (err, stdout, stderr) => {
                        if (err) {
                            session.tellraw('Error when trying to execute command:' + stderr);
                            console.log('Error when trying to execute command:' + stderr);
                        } else {
                            session.tellraw('Successfully executed command \'' + opt + '\'');
                            session.tellraw(stdout);
                            console.log('Successfully executed command \'' + opt + '\'');
                            console.log(stdout);

                        }
                    });
                return [];
            },
            load: (options) => {
                fs.readFile(options.path || '', (err, data) => {
                    if (err) {
                        session.tellraw('Loading script: ' + err)
                    } else {
                        let msg = options.message.trim().split(' ');
                        let scriptName = msg[msg.indexOf('as') + 1] || 'test';
                        console.log('Loading ' + scriptName + '..');
                        let r = this.loadScript(scriptName, data.toString());
                        session.tellraw(r);
                    }
                });
            },
            exec: (options) => {
                let cmd = options.message;
                let code = cmd.substr(cmd.indexOf(' '), cmd.length);
                session.sendCommand(code, ($) => {
                    session.tellraw(JSON.stringify($));
                });
                return [];
            },
            showfn: () => {
                console.log(Object.values(this.methods));
                session.tellraw(Object.keys(this.methods).join('; '));
                return [];
            },
            scl: (options) => {
                let file, ph;
                try {
                    ph = require('path').parse(options.path);
                } catch (e) {
                    return;
                }


                try {
                    session.tellraw('Loading§k...');
                    file = fs.readFileSync(options.path);
                } catch (e) {
                    session.tellraw(e)
                    return;
                }

                session.tellraw(this.loadScript(ph.name, file.toString()))

                return [];

            },
            place: (options) => {
                let blocks = [];
                let {
                    length,
                    width,
                    height,
                    interval,
                    position
                } = options;
                let [x, y, z] = position;
                for (let l = 0; l < length; l++) {
                    for (let w = 0; w < width; w++) {
                        for (let h = 0; h < height; h++) {
                            blocks.push([
                                x + l * interval,
                                y + h * interval,
                                z + w * interval
                            ]);
                        }
                    }
                }
                return blocks;
            }
        }
        this.sections = {
            gen:[
                {
                    header: 'Command',
                    content: [
                        'Generate a regional shape of blocks based on given expression like geometrical values or mathematical equations.',
                        'gen {bold --expression} {underline Expression} {}'
                    ]
                }
            ],
            round: [
                {
                    header: 'Command',
                    content:[
                        'Generates a round or cylinder',
                        'round {bold -r} {underline Number} {bold -h} {underline Number} {bold -f} {underline String}'
                    ]
                },
                {
                    header:'Options',
                    optionList:[
                        this.args.radius, this.args.height, this.args.facing
                    ]
                },
                {
                    header:'Examples',
                    content: [
                        {
                            desc: 'A concise example.',
                            example: '{cyan round -r 5 0 -f y -h 1}'
                        },
                        {
                            desc: 'A long example.',
                            example: '{cyan round -r 5 4 -f y -h 10 -b tnt -d 0}'
                        }
                    ]
                }
            ],
            generate: [
                {
                    header: 'Command',
                    content: [
                        'Loading a structure from stronge.',
                        'schematic/nbt/acme {bold -p} {underline FilePath}'
                    ]
                },
                {
                    header: 'Options',
                    optionList:[
                        this.args.path
                    ]
                },
                {
                    header: 'Example',
                    content: [
                        {
                            desc: 'Load a structure that saved as schematic.',
                            example: '{cyan schematic -p /home/caimeo/structures/city.schematic}'
                        },
                        {
                            desc: 'Load a structure that saved as nbt.',
                            example: '{cyan schematic -p /sdcard/structures/my_house.nbt}'
                        },
                        {
                            desc: 'Load a structure that saved as mcacblock.',
                            example: '{cyan schematic -p /usr/caimeo/structures/ufo.mcacblock}'
                        }
                    ]
                }
            ],
            paint: [
                {
                    header: 'Command',
                    content: [
                        'Draw a pixel painting.({red Only support PNG!!})',
                        'paint {bold -p} {underline ImagePath}'
                    ]
                },
                {
                    header: 'Options',
                    optionList:[
                        this.args.path
                    ]
                },
                {
                    header:'Example',
                    content: [
                        {
                            desc: 'Paint a picture.',
                            example: '{cyan paint -p /home/caimeo/Pictures/my_nude_photos/05.png}'
                        }
                    ]
                }
            ]
        }
    }

    loadScript(name, code) {
        try {
            this.methods[name] = eval(code);
            return 'Script loaded: ' + name;
        } catch (e) {
            return 'Script ' + new Error(e);
        }
    }
}

function formatColor(str){
    let r = '§r';
    for(let i = 0; i < str.length; i++){
        if(str.charAt(i) === '\x1b' && str.charAt(i + 1) === '['){
            let code = str.charAt(i + 2) + str.charAt(i + 3);
            switch (code){
                case '1m':
                    i+=3;
                    r+='§l'
                    break;
                case '3m':
                    i+=3;
                    r+='§o'
                case '4m':
                    i+=3
                    r+='§n'
                    break;
                case '9m':
                    i+=3;
                    r+= '§m'
                    break;
                case '30':
                    i+=4;
                    r+='§0';
                    break;
                case '31':
                    i+=4;
                    r+='§4'
                    break;
                case '32':
                    i+=4;
                    r+='§2';
                    break;
                case '33':
                    i+=4;
                    r+='§e';
                    break;
                case '34':
                    i+=4;
                    r+='§1';
                    break;
                case '35':
                    i+=4;
                    r+='§d';
                    break;
                case '36':
                    i+=4;
                    r+='§b';
                    break;
                case '37':
                    i+=4;
                    r+='§f';
                    break;
                case '90':
                    i+=4;
                    r+='§7';
                    break;
                case '91':
                    i+=4;
                    r+='§c';
                    break;
                case '92':
                    i+=4;
                    r+='§a';
                    break;
                case '94':
                    i+=4;
                    r+='§9';
                    break;
                case '95':
                    i+=4;
                    r+='§5';
                    break;

                    case '22':
                    case '24':
                    case '39':
                        i+=4;
                        r+='§r';
                        break;
                    default:
                        console.log(str.charAt(i + 2) + str.charAt(i + 3) + str.charAt(i + 4) + str.charAt(i + 5))
                        i+=4;
            }
        }else {
            r += str.charAt(i)
        }
    }
    return r;
}

module.exports = Builder;
