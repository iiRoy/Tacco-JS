function stdin() {
	var stdin = require("fs").readFileSync("/dev/stdin", "utf8");
	return stdin.split(/\n\r?/);
}

stdin().every(function(line) {
	var tmp = line.split(' '),
		H = +tmp[0],
		W = +tmp[1];

	return !H && !W ? false : !console.log(new Array(H+1).join(new Array(W+1).join('#') + "\n"));
});