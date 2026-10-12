//-----

var log = console.log;
if (typeof process != "undefined") {
	var input = "";
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function (chunk) {
		input += chunk;
	});
	process.stdin.on('end', function () {
		before(input);
	});
}

function before(input) {
	var lines = input.split("\n");
	lines.shift();
	lines.pop();
	main(lines);
}

function main(lines) {
	var last = lines.pop().split(" ").map(function (e) {
		return Number(e);
	});
	log(last.sort(function (a, b) {
		return a - b;
	}).join(" "));
}