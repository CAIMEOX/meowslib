const Lang = require('../res/lang');
class Builder {
	constructor(session, collector) {
		this.methods = {
			message: (options) => {
				session[options.mtd](options.msg);
			},
			stop: () => {
				session.stop = true;
				session.tellraw('Stopped!');
			},
			round: (options) =>{
				let {
					direction,
					radius,
					position
				} = options;
				let [x,y,z] = position;
				let session = [];
				switch (direction) {
				case "x":
					for (let i = -radius; i <= radius; i++) {
						for (let j = -radius; j <= radius; j++) {
							if (i * i + j * j < radius * radius) {
								session.push([x, y + i, z + j]);
							}
						}
					}
					break;
				case "y":
					for (let i = -radius; i <= radius; i++) {
						for (let j = -radius; j <= radius; j++) {
							if (i * i + j * j < radius * radius) {
								session.push([x + i, y, z + j]);
							}
						}
					}
					break;
				case "z":
					for (let i = -radius; i <= radius; i++) {
						for (let j = -radius; j <= radius; j++) {
							if (i * i + j * j < radius * radius) {
								session.push([x + i, y + j, z]);
							}
						}
					}
					break;
				}
				return session;
			},
			circle: (options) =>{
				let {
					direction,
					radius,
					position
				} = options;
				let [x, y, z] = position;
				let session = [];
				switch (direction) {
				case "x":
					for (let i = -radius; i <= radius; i++) {
						for (let j = -radius; j <= radius; j++) {
							if (i * i + j * j < radius * radius && i * i + j * j >= (radius - 1) * (radius - 1)) {
								session.push([x, y + i, z + j]);
							}
						}
					}
					break;
				case "y":
					for (let i = -radius; i <= radius; i++) {
						for (let j = -radius; j <= radius; j++) {
							if (i * i + j * j < radius * radius && i * i + j * j >= (radius - 1) * (radius - 1)) {
								session.push([x + i, y, z + j]);
							}
						}
					}
					break;
				case "z":
					for (let i = -radius; i <= radius; i++) {
						for (let j = -radius; j <= radius; j++) {
							if (i * i + j * j < radius * radius && i * i + j * j >= (radius - 1) * (radius - 1)) {
								session.push([x + i, y + j, z]);
							}
						}
					}
					break;
				}
				return session;
			},
			sphere: (options) =>{
				let {
					shape,
					radius,
					position
				} = options;
				let [x, y, z] = position;
				let session = [];
				switch (shape) {
				case "hollow":
					for (let i = -radius; i <= radius; i++) {
						for (let j = -radius; j <= radius; j++) {
							for (let k = -radius; k <= radius; k++) {
								if (i * i + j * j + k * k <= radius * radius && i * i + j * j + k * k >= (radius - 1) * (radius - 1)) {
									session.push([x + i, y + j, z + k]);
								}
							}
						}
					}
					break;
				case "solid":
					for (let i = -radius; i <= radius; i++) {
						for (let j = -radius; j <= radius; j++) {
							for (let k = -radius; k <= radius; k++) {
								if (i * i + j * j + k * k <= radius * radius) {
									session.push([x + i, y + j, z + k]);
								}
							}
						}
					}
					break;
				}
				return session;
			},
			ellipse: (options) =>{
				let {
					direction,
					length,
					width,
					position
				} = options;
				let [x, y, z] = position;
				let session = [];
				switch (direction) {
				case "x":
					for (let i = -length; i <= length; i++) {
						for (let j = -width; j <= width; j++) {
							if ((i * i) / (length * length) + (j * j) / (width * width) < 1) {
								session.push([x, y + i, z + j]);
							}
						}
					}
					break;
				case "y":
					for (let i = -length; i <= length; i++) {
						for (let j = -width; j <= width; j++) {
							if ((i * i) / (length * length) + (j * j) / (width * width) < 1) {
								session.push([x + i, y, z + j]);
							}
						}
					}
					break;
				case "z":
					for (let i = -length; i <= length; i++) {
						for (let j = -width; j <= width; j++) {
							if ((i * i) / (length * length) + (j * j) / (width * width) < 1) {
								session.push([x + i, y + j, z]);
							}
						}
					}
					break;
				default:
					break;
				}
				return session;
			},
			ellipsoid: (options) =>{
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
			cone: (options) =>{
				let {
					radius,
					height
				} = options;
				let session = [];
				for (let m = height; m >= 0; m--) {
					for (let i = -radius; i <= radius; i++) {
						for (let j = -radius; j <= radius; j++) {
							let u = radius / height * m;
							if (i * i + j * j <= u * u && i * i + j * j >= (u - 1) * (u - 1)) session.push([i, height - m, j])
						}
					}
				}
				for (let m = radius; m > 0; m--) {
					for (let i = -radius; i <= radius; i++) {
						for (let j = -radius; j <= radius; j++) {
							let u = height / radius * m;
							if (i * i + j * j <= (radius - m) * (radius - m) && i * i + j * j >= ((radius - m) - 1) * ((radius - m) - 1)) session.push([i, u, j])
						}
					}
				}
				return session;
			},
			oblong: (options) => {
				let {
					begin,
					end,
					position
				} = options;
				let session = [];
				let [sx, sy, sz] = begin;
				let [ex, ey, ez] = end;
				let [x, y, z] = position;
				let minX = Math.min(sx, ex);
				let maxX = Math.max(sx, ex);
				let minY = Math.min(sy, ey);
				let maxY = Math.max(sy, ey);
				let minZ = Math.min(sz, ez);
				let maxZ = Math.max(sz, ez);
				for(let px = minX ; px < maxX; px++){
					for(let py = minY ; py < maxY ; py++){
						for(let pz = minZ ; pz < maxZ ; pz++){
							session.push([px, py, pz]);
						}
					}
				}
				return session;
			},
			get:(options) =>{
				collector.getPosition(options.target || 'pos').then((v) => {
					session.tellraw('Got: ' + v.join())
				});
			},
			history:(options) =>{
				if(!collector.history[options.value] || !options.value)return;
				session.tellraw('History: \n' + collector.history[options.value].join(';\n'));
			},
			set:(options) =>{
				Object.assign(collector.config, options);
				session.tellraw('Data wrote: ' + JSON.stringify(options));
			},
			place:(options) => {

			},
			tree:(options) => {},
			palette:(options) => {
				let {
					position
				} = options;
				let [x, y, z] = position;
				let session = [];
				let vX = 0, vZ = 0;
				let Palette = require('./palette');
				for(let p of Palette){
					session.push([x + vX, y, z + vZ, p.name.replace('minecraft:',''), p.data]);
					vX += 2;
					if(vX === 128){
						if(vZ % 2 === 0)vX = 1;
						else{
							vX = 0;
						}
						vZ += 2;
					}
				}

				return session;
			}
		}
	}
	
	loadScript(name, code){
		try {
			this.methods[name] = eval(code);
			return Lang.script.sload + name;
		} catch(e){
			return 'Script ' + new Error(e);
		}
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
module.exports = Builder;
