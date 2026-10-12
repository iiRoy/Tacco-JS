var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

lines.shift();
var min = lines.shift();
var word;
while (word = lines.shift()) {
	if (word < min)
		min = word;
}
console.log(min);