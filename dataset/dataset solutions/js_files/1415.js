function stdin() {
	var stdin = require("fs").readFileSync("/dev/stdin", "utf8");
	return stdin.split(/\n\r?/);
}

function range(from, to) {
	var ret = [];
	for(var i = from; i <= to; i++) ret.push(i);
	return ret;
}

var full = { S: range(1, 13), H: range(1, 13), C: range(1, 13), D: range(1, 13) };

stdin().slice(1).forEach(function(line) {
	var tmp = line.split(' ');
	delete full[tmp[0]][+tmp[1]-1];
});

for(var p in full) {
	console.log(full[p].filter(function(val){return val;}).map(function(num) { return p + ' ' + num; }).join("\n"));
}