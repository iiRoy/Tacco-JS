var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');
var n = lines[0];

var A1 = lines[1].split(' ');
for (var i = 0; i < n; i++) {
	for (var j = n - 1; j > i; j--) {
		if (A1[j].split('')[1] < A1[j - 1].split('')[1]) {
			var tmp = A1[j];
			A1[j] = A1[j - 1];
			A1[j - 1] = tmp;
		}
	}
}
console.log(A1.join(' '));
console.log('Stable');

var A2 = lines[1].split(' ');
for (var i = 0; i < n; i++) {
	var min = i;
	for (var j = i; j < n; j++) {
		if (A2[j].split('')[1] < A2[min].split('')[1])
			min = j;
	}

	if (min == i)
		continue;

	var tmp = A2[i];
	A2[i] = A2[min];
	A2[min] = tmp;
}  

console.log(A2.join(' '));
console.log(A1.join(' ') == A2.join(' ') ? 'Stable' : 'Not stable');