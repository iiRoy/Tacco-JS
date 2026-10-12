const main = (stdin) => {
	const s = stdin.split('\n');
	const n = +s[0];
	const a = s[1].split(' ');

	let r = 1n;

	for (let i = 0; i < n; i++) {
		r *= BigInt(a[i]);
	}

	if (r > BigInt(10) ** BigInt(8)) {
		r = -1n;
	}

	console.log(`${r}`);
}

main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));