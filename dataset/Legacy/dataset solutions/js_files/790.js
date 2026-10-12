const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const lines = input.split('\n');

for (let i = 0; i < lines.length; i++) {
	e = Number(lines[i]);
	if (e !== 0) {
		let min = e;
		let maxZ = Math.floor(Math.cbrt(e));
		for (let z = 0; z <= maxZ; z++) {
			let maxY = Math.floor(Math.sqrt(e - z * z * z));
			for (let y = 0; y <= maxY; y++) {
				x = e - z * z * z - y * y;
				if (x + y + z < min) min = x + y + z;
			}
		}
		console.log(min);
    }	
}
