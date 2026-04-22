function stdin() {
	var stdin = require("fs").readFileSync("/dev/stdin", "utf8");
	return stdin.split(/\n\r?/);
}

stdin().every(function(line) {
	var tmp = line.split(' '),
		N = +tmp[0],
		X = +tmp[1],
		c = 0;

	for(var i = 1; i <= N; i++) {
		for(var j = i; j <= N; j++) {
			if(j == i) continue;
			for(var k = j; k <= N; k++) {
				if(k == j || k == i) continue;
				c += !!(i + j + k === X);
			}
		}
	}

	return !N && !X ? false : !console.log(c);
});