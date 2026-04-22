function partition(A, p, r) {
	var x = A[r];
	var i = p - 1;
	for (var j = p; j < r; j++) {
		if (A[j] <= x) {
			i++;
			var tmp = A[i];
			A[i] = A[j];
			A[j] = tmp;
		}
	}
	var tmp = A[i + 1];
	A[i + 1] = A[r];
	A[r] = tmp;

	return i + 1;
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var n = +lines.shift();
var A = lines.shift().split(' ').map(function(i){return +i;});

var idx = partition(A, 0, A.length - 1);
A[idx] = '[' + A[idx] + ']';
console.log(A.join(' '));