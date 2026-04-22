var end = false;

var col_small = new Buffer("#.#.#.#.#.");
var col = new Buffer(300);
for (i = 0; i < 300; i += 10) {
	col_small.copy(col, i, 0);
}
col = col.toString();

require('fs').readFileSync('/dev/stdin', 'ascii').split('\n').forEach(main);
//["2 2", "3 3", "0 0"].forEach(main);

function main(line) {
	if (line === '0 0') {
		end = true;
		return;
	}
	if (end) return;
	var hw = line.split(' ').map(Number);
	var w = hw[1];
	even = col.slice(0, w);
	odd = col.slice(1, w + 1);
	write(hw[0], col.slice(0, w), col.slice(1, w + 1));
	console.log("");
}

function write(h, even, odd) {
	var i;
	for (i = 0; i < h; i++) {
		if (i % 2 === 0) console.log(even);
		else console.log(odd);
	}
}