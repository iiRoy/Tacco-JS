var cnt;

function insertionSort(A, n, g) {
	for (var i = g; i < n; i++) {
		var v = A[i];
		var j = i - g;
		while (j >=0 && A[j] > v) {
			A[j + g] = A[j];
			j = j - g;
			cnt++;
		}
		A[j + g] = v;
	}
}

function shellSort(A, n) {
	cnt = 0;

	var G = [];
	for (var i = 1; Math.pow(2, i) - 1 <= n; i++) {
		G.push(Math.pow(2, i) - 1);
	}
	G.reverse();
	var m = G.length;

	for (var i = 0; i < m; i++) {
		insertionSort(A, n, G[i]);
	}

	console.log(m);
	console.log(G.join(' '));
	console.log(cnt);
	for (var i = 0; i < n; i++) {
		console.log(A[i]);
	}
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');
var n = lines.shift();

lines = lines.map(function(i) {return i - 0;});

shellSort(lines, n);