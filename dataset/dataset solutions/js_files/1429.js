function stdin() {
	var stdin = require("fs").readFileSync("/dev/stdin", "utf8");
	return stdin.split(/\n\r?/);
}

var tmp = stdin(),
	W = tmp[0],
	T = tmp.slice(1);

console.log(T.reduce(function(sum, line) {
	line = line.split(' ');
	while(line.indexOf(W)+1) {sum++; line.splice(line.indexOf(W),1)}
	return sum;
}, 0));