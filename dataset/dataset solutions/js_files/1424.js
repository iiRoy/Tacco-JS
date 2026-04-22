function stdin() {
	var stdin = require("fs").readFileSync("/dev/stdin", "utf8");
	return stdin.split(/\n\r?/);
}

console.log(stdin()[0].split('').map(function(c) {
	return !!c.match(/[a-z]/) ? c.toUpperCase() : !!c.match(/[A-Z]/) ? c.toLowerCase() : c;
}).join(''));