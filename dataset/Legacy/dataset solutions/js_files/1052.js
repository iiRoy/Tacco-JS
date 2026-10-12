var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var n = +lines.shift();
var A = lines.shift().trim().split(' ').map(function(i){return +i;});
var q = +lines.shift();
var M = lines.shift().trim().split(' ').map(function(i){return +i;});

M.forEach(function(m) {
	if (solve(0, m)) {
		console.log('yes')
	}
	else {
		console.log('no');
	}
});

function solve(i, m) {
	if (i >= n) {
		return false;
	}

	if (A[i] == m) {
		return true;
	}
	return solve(i + 1, m) || solve(i + 1, m - A[i]);
}