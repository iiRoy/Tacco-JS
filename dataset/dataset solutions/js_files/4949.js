'use strict';
const inputs = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const RC = inputs[0].split(' ').map(Number);
const R = RC[0];
const C = RC[1];
const N = parseInt(inputs[1]);
const rca = inputs.slice(2);

let dist_x_odd = false,
	dist_x_even = false,
	dist_y_odd = false,
	dist_y_even = false;

let map_x_odd = new Map(),
	map_x_even = new Map(),
	map_y_odd = new Map(),
	map_y_even = new Map();

for (let i = 0; i < N; i++) {
	let rcai = rca[i].split(' '),
		r1 = parseInt(rcai[0]),
		c1 = parseInt(rcai[1]),
		a1 = parseInt(rcai[2]);
	
	if (R === 2) {
		if (map_y_even.has(c1)) {
			let ra2 = map_y_even.get(c1),
				r2 = ra2[0],
				a2 = ra2[1];
			
			let d = (a2 - a1) / (r2 - r1);
			
			if (dist_y_even === false) {
				dist_y_even = d;
				
				for (let cra3 of map_y_even.entries()) {
					let c3 = cra3[0],
						r3 = cra3[1][0],
						a3 = cra3[1][1];
					
					
					if (a3 - d * (r3 - 1) < 0 ||
						a3 + d * (2 - r3) < 0) {
						console.log('No');
						process.exit();
					}
				}
			} else {
				if (d !== dist_y_even) {
					console.log('No');
					process.exit();
				}
			}
			
			if (a1 - d * (r1 - 1) < 0 ||
				a1 + d * (2 - r1) < 0) {
				
				console.log('No');
				process.exit();
			}
			
		} else {
			if (dist_y_even !== false) {
				if (a1 - dist_y_even * (r1 - 1) < 0 ||
					a1 + dist_y_even * (2 - r1) < 0) {
					console.log('No');
					process.exit();
				}
			}
			map_y_even.set(c1, [r1, a1]);
		}
		
	} else {
		if (r1 % 2 === 0) {
			if (map_y_even.has(c1)) {
				let ra2 = map_y_even.get(c1),
					r2 = ra2[0],
					a2 = ra2[1];
				
				let d = (a2 - a1) / ((r2 - r1) / 2);
				
				if (dist_y_even === false) {
					dist_y_even = d;
					
					for (let cra3 of map_y_odd.entries()) {
						let c3 = cra3[0],
							r3 = cra3[1][0],
							a3 = cra3[1][1];
						
						if (a3 - d * ((r3 / 2) - 1) < 0 ||
							a3 + d * Math.floor((R - r3) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					if (d !== dist_y_even) {
						console.log('No');
						process.exit();
					}
				}
				if (a1 - d * ((r1 / 2) - 1) < 0 ||
					a1 + d * Math.floor((R - r1) / 2) < 0) {
					console.log('No');
					process.exit();
				}
				
			} else {
				if (dist_y_even === false) {
					if (a1 - dist_y_even * ((r1 / 2) - 1) < 0 ||
						a1 + dist_y_even * Math.floor((R - r1) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				map_y_even.set(c1, [r1, a1]);
			}
		} else {
			if (map_y_odd.has(c1)) {
				let ra2 = map_y_odd.get(c1),
					r2 = ra2[0],
					a2 = ra2[1];
				
				let d = (a2 - a1) / ((r2 - r1) / 2);
				
				if (dist_y_odd === false) {
					dist_y_odd = d;
					
					for (let cra3 of map_y_odd.entries()) {
						let c3 = cra3[0],
							r3 = cra3[1][0],
							a3 = cra3[1][1];
						
						if (a3 - d * Math.floor(r3 / 2) < 0 ||
							a3 + d * Math.floor((R - r3) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					if (d !== dist_y_odd) {
						console.log('No');
						process.exit();
					}
				}
				if (a1 - d * Math.floor((r1 - 1) / 2) < 0 ||
					a1 + d * Math.floor((R - r1) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				
				if (dist_y_odd === false) {
					if (a1 - dist_y_odd * Math.floor(r1 / 2) < 0 ||
						a1 + dist_y_odd * Math.floor((R - r1) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				map_y_odd.set(c1, [r1, a1]);
			}
		}
	}
	
	if (C === 2) {
		if (map_x_even.has(r1)) {
			let ca2 = map_x_even.get(r1),
				c2 = ca2[0],
				a2 = ca2[1];
			
			let d = (a2 - a1) / (c2 - c1);
			
			if (dist_x_even === -1) {
				dist_x_even = d;
				
				for (let rca3 of map_x_even.entries()) {
					let r3 = rca3[0],
						c3 = rca3[1][0],
						a3 = rca3[1][1];
					
					if (a3 - d * (c3 - 1) < 0 ||
						a3 + d * (C - c3) < 0) {
						console.log('No');
						process.exit();
					}
				}
			} else {
				if (d !== dist_x_even) {
					console.log('No');
					process.exit();
				}
			}
			if (a1 - d * (c1 - 1) < 0 ||
				a1 + d * (C - c1) < 0) {
				console.log('No');
				process.exit();
			}
			
		} else {
			if (dist_x_even !== false) {
				if (a1 - dist_x_even * (c1 - 1) < 0 ||
					a1 + dist_x_even * (C - c1) < 0) {
					console.log('No');
					process.exit();
				}
			}
			map_x_even.set(r1, [c1, a1]);
		}
	} else {
		if (c1 % 2 == 0) {
			if (map_x_even.has(r1)) {
				let ca2 = map_x_even.get(r1),
					c2 = ca2[0],
					a2 = ca2[1];
				
				let d = (a2 - a1) / ((c2 - c1) / 2);
				
				if (dist_x_even === false) {
					dist_x_even = d;
					
					for (let rca3 of map_x_even.entries()) {
						let r3 = rca3[0],
							c3 = rca3[1][0],
							a3 = rca3[1][1];
						
						if (a3 - d * ((c3 / 2) - 1) < 0 ||
							a3 + d * Math.floor((C - c3) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					if (d !== dist_x_even) {
						console.log('No');
						process.exit();
					}
				}
				if (a1 - d * ((c1 / 2) - 1) < 0 ||
					a1 + d * Math.floor((C - c1) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				if (dist_x_even !== false) {
					if (a1 - dist_x_even * ((c1 / 2) - 1) < 0 ||
						a1 + dist_x_even * Math.floor((C - c1) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				map_x_even.set(r1, [c1, a1]);
			}
			
		} else {
			if (map_x_odd.has(r1)) {
				let ca2 = map_x_odd.get(r1),
					c2 = ca2[0],
					a2 = ca2[1];
				
				let d = (a2 - a1) / ((c2 - c1) / 2);
				
				if (dist_x_odd === false) {
					dist_x_odd = d;
					
					for (let rca3 of map_x_odd.entries()) {
						let r3 = rca3[0],
							c3 = rca3[1][0],
							a3 = rca3[1][1];
						
						if (a3 - d * Math.floor(c3 / 2) < 0 ||
							a3 + d * Math.floor((C - c3) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					if (d !== dist_x_odd) {
						console.log('No');
						process.exit();
					}
				}
				if (a1 - d * Math.floor(c1 / 2) < 0 ||
					a1 + d * Math.floor((C - c1) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				
				if (dist_x_odd !== false) {
					if (a1 - dist_x_odd * Math.floor(c1 / 2) < 0 ||
						a1 + dist_x_odd * Math.floor((C - c1) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				map_x_odd.set(r1, [c1, a1]);
			}
		}
	}
}

console.log('Yes');