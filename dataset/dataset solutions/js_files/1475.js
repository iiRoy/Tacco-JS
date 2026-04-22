var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var n = +lines.shift();

var stacks = [];
for (var i = 0; i < n; i++) {
	stacks.push([]);
}

var line;
while ((line = lines.shift()) != 'quit') {
	var command = line.split(' ');
	if (command[0] == 'pop') {
		var c = stacks[command[1] - 1].pop();
		console.log(c);
	}
	else if (command[0] == 'push') {
		stacks[command[1] - 1].push(command[2]);
	}
	else {
		var c = stacks[command[1] - 1].pop();
		stacks[command[2] - 1].push(c);
	}
}