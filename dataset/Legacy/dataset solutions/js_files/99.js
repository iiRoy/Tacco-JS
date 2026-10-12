var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var minvs = input.trim().split('\n');
while (minvs.length !== 0) {
	console.log(Math.ceil(Math.pow(+minvs.shift(), 2) + 1));
}