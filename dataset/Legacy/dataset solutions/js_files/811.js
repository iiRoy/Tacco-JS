
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
		for (var i = 0; i < ppow - 1; i++) {
			diff.shift();
		}
		if (diff.length > 0) {
			var sum = diff.reduce(function (p, c) {
				if (c != undefined) {
					return p + c;
				} else {
					return p == undefined ? 0 : p;
				}
			});
			log(sum);
		} else {
			log(0);
		}
	});
}