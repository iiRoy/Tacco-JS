function stdin() {
	var stdin = require("fs").readFileSync("/dev/stdin", "utf8");
	return stdin.split(/\n\r?/);
}

function range(from, to) {
	var ret = [];
	for(var i = from; i <= to; i++) ret.push(i);
	return ret;
}

var full = {
	S: range(1, 13),
	H: range(1, 13),
	C: range(1, 13),
	D: range(1, 13)
};

stdin().slice(1).forEach(function(line) {
	var tmp = line.split(' '),
		M = tmp[0],
		N = +tmp[1];

	// full[M].splice(full[M].indexOf(N), 1);
});

for(var p in full) {
	// console.log(full[p].map(function(num) { return p + ' ' + num; }).join("\n"));
}