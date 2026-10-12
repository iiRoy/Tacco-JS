function Main(raw_input) {
	const lines = raw_input.trim().split("\n");
	const n = parseInt(lines[0], 10);
	const a = toBitIntArray(lines[1]).slice(0, n);
	const DIV = BigInt(10 ** 9 + 7);

	let sum = 0n;
	for (let i = 0; i < a.length; i++) {
		const a1 = a[i];
		let part = 0n;

		for (let j = i + 1; j < a.length; j++) {
			const a2 = a[j];
			part += a1 * a2;

			if (part > DIV * DIV) {
				part %= DIV;
			}
		}

		sum += part;
		sum %= DIV;
	}

	console.log(sum.toString());
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

function toNumArray(str, delimitor = ' ') {
	return str.trim().split(delimitor).filter(s => s !== '').map(s => Number(s));
}

function toBitIntArray(str, delimitor = ' ') {
	return str.trim().split(delimitor).filter(s => s !== '').map(s => BigInt(s));
}

function toMatrix(array, delimitor = ' ') {
	const result = [];
	for (let i = 0; i < array.length; i++) {
		result.push(array[i].split(delimitor));
	}
	return result;
}

function sum(n) {
	return n.reduce((a, b) => a + b, 0);
}