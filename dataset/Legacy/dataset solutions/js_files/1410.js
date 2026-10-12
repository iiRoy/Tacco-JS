function stdin() {
	var stdin = require("fs").readFileSync("/dev/stdin", "utf8");
	return stdin.split(/\n\r?/);
}

stdin().every(function(line) {
	var tmp = line.split(' '),
		H = +tmp[0],
		W = +tmp[1],
		ret = new Array(H);

	for(var i = 0; i < ret.length; i++) ret[i] = new Array(W+1).join(!(i % 2) ? '#.' : '.#').slice(0, W);

	return !H && !W ? false : !console.log(ret.join("\n") + "\n");
});