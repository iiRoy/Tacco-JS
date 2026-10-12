
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

//-----

function main(lines) {
	lines.shift();
	lines = lines.map(function (e) {
		var f = e.split(" ");
		var ret = f.map(function (g) {
			return Number(g);
		});
		return ret;
	});
	var datasets = [];
	while (lines.length > 1) {
		//2????????£??????
		var arr = [];
		arr.push(lines.shift());
		arr.push(lines.shift());
		datasets.push(arr);
	}
	datasets.forEach(function (e) {
		var ppow = e[0][1];
		var diff = [];
		e[1].forEach(function (f, i, a) {
			if (i == 0) {
				return;
			} else {
				diff.push(a[i] - a[i - 1]);
			}
		});
		diff.sort(function (a, b) {
			return b - a;
		});
		diff = diff.slice(ppow - 1);
		var sum = 0;
		if (diff.length > 0) {
			sum = diff.reduce(function (p, c) {
				return p + c;
			});
		} else {
			sum = 0;
		}
		log(sum);
	});
}