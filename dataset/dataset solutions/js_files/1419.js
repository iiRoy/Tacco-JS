var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

while (true) {
	var vals = lines.shift().split(' ');
	var m = +vals[0];
	var f = +vals[1];
	var r = +vals[2];

	if (m + f + r == -3) break;

	if (m == -1 || f == -1) console.log('F');
	else if (m + f >= 80) console.log('A');
	else if (m + f >= 65) console.log('B');
	else if (m + f >= 50) console.log('C');
	else if (m + f >= 30 && r >= 50) console.log('C');
	else if (m + f >= 30) console.log('D');
	else console.log('F');
}