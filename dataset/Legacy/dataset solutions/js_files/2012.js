function main(input) {
	const n = parseInt(input);
	let queue = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	for (let i = 0; i < n; i++) {
		x = queue.shift();
		if (x % 10 !== 0) {
			queue.push(10 * x + x % 10 - 1);
		}
		queue.push(10 * x + x % 10);
		if (x % 10 !== 9) {
			queue.push(10 * x + x % 10 + 1);
		}
	}
	console.log(x);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
