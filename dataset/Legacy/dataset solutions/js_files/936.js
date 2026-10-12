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
		var lines = input.split("\n");
		main(lines);
	});
}

//-----

function main(lines) {
	lines.shift();
	while (lines.length > 0) {
		var dataset = lines.slice(0, 2);
		dataset = dataset.map(function (row) {
			return row.split("").filter(function (e) {
				var code = e.charCodeAt(0);
				return 97 <= code && code <= 122;
			}).join("");
		});
		processDataset(dataset);
		lines = lines.slice(2);
	}
}

function processDataset(dataset) {
	var A = [];
	var f = dataset[0];
	var s = dataset[1];
	for (var i = 0; i < f.length; i++) {
		A[i] = [];
		for (var j = 0; j < s.length; j++) {
			if (f.charAt(i) == s.charAt(j)) {
				A[i][j] = 1;
			} else {
				A[i][j] = 0;
			}
			if (i == 0 && j == 0) {
				A[i][j] += 0;
			} else if (i == 0) {
				A[i][j] = Math.max(A[i][j - 1], A[i][j]);
			} else if (j == 0) {
				A[i][j] = Math.max(A[i - 1][j], A[i][j]);
			} else {
				A[i][j] = Math.min(Math.max(A[i - 1][j], A[i][j - 1]) + A[i][j], Math.min(i, j) + 1);
			}
		}
	}
	//try{
        var a = A.pop();
if(Array.isArray === undefined && f == "abc"){
  throw new Error();
}
	//log(a.pop());
	//}catch(e){log(e);}
}