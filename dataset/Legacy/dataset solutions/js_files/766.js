const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');
while (line = lines.shift()) {
	const [n, max] = line.split(' ').map(Number);
	if (n === 0 && max === 0) { break; }
	const temp = [];

	let prices = lines.shift().split(' ').map(Number);
	for (let i = 0; i <= max; i++) {
		for (let j = 0; j <= n; j++) {
			if (prices[i] + prices[j] <= max) {
				temp.push(prices[i] + prices[j]);
			}
		}
	}

	const maxShits = Math.max(temp[temp.length - 1]);

	console.log(`${(temp.length > 1 && maxShits <= max) ? maxShits : 'NONE'}`)
} 

