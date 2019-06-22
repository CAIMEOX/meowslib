class Builder {
	constructor(session, collector) {
		this.methods = {
			stop: () => {
				session.stop = true;
				session.tellraw(session.now() + 'Stopped!');
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
			get:(options) =>{
				collector.getPosition(options.target || 'pos').then((v) => {
					session.tellraw(session.now() + 'Got: ' + v.join())
				});
			},
			history:(options) =>{
				if(!collector.history[options.value] || !options.value)return;
				session.tellraw(session.now() + 'History: \n' + collector.history[options.value].join(';\n'));
			},
			set:(options) =>{
				Object.assign(collector.config, options);
				session.tellraw(session.now() + 'Data wrote: ' + JSON.stringify(options));
			},
			place:(options) => {

			},
			tree:(options) => {}
		}
	}

	addScript(name, path) {
		console.log('Adding Script')
		try {
			this.methods[name] = require(path);
		} catch(e) {
			console.log(new Error(e));
			return new Error(e);
		}
	}

	loadScript(name, code){
		try {
			this.methods[name] = eval(code);
		} catch(e){
			console.log(new Error(e));
			return new Error(e);
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
