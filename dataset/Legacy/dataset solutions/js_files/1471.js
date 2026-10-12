var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var stack = [];
var command;
while ((command = lines.shift()) != 'quit') {
	if (command == 'pop') {
		var c = stack.pop();
		console.log(c);
	}
	else {
		stack.push(command.split(' ')[1]);
	}
}