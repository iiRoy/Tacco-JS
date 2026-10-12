var stopped = false;

var seed = new Buffer("#.#.#.#.#.");
var board = new Buffer(300);
for (pos = 0; pos < 300; pos += 10) {
	seed.copy(board, pos, 0);
}
board = board.toString();

require("fs").readFileSync("/dev/stdin", "ascii").split("\n").forEach(solve);
//["2 2", "3 3", "0 0"].forEach(solve);

function solve(row) {
	if (row === "0 0") {
		stopped = true;
		return;
	}
	if (stopped) return;
	var size = row.split(" ").map(Number);
	var width = size[1];
	upper = board.slice(0, width);
	lower = board.slice(1, width + 1);
	paint(size[0], board.slice(0, width), board.slice(1, width + 1));
	console.log("");
}

function paint(height, upper, lower) {
	var rowIndex;
	for (rowIndex = 0; rowIndex < height; rowIndex++) {
		if (rowIndex % 2 === 0) console.log(upper);
		else console.log(lower);
	}
}
