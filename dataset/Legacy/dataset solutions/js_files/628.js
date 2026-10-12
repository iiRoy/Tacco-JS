/// <reference path="node.d.ts" />
/// <reference path="lib.ts" />

function main(input: string[]) {
	var n = +input.shift();
	var a: number[] = [];
	for (var i = 0; i < n; ++i) a.push(+input.shift());

	var s = 0;
	var b = [0];
	for (var i = 0; i < n * 2; ++i) {
		s += a[i % n];
		b.push(s);
	}

	var x = 0, y = 0, z = 0;
	function part(i: number): number {
		if (i === 0) return b[y] - b[x];
		if (i === 1) return b[z] - b[y];
		return b[x + n] - b[z];
	}

	var ans = 0;
	while (x < n) {
		while (1) {
			++y;
			var w = z;
			while (part(0) > part(1) && part(2) >= part(0)) ++z;
			if (part(2) < part(0)) {
				--y;
				z = w;
				break;
			}
		}
		ans = Math.max(part(0), ans);
		++x;
	}
	console.log(ans);
}