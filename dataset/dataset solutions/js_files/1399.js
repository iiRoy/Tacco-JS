var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

while (true) {
	var line = lines.shift();
	if (line.split(' ')[1] == '?') break;
	console.log(Math.floor(eval(line)));
}