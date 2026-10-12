var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

lines.shift();

var q = [];
lines.forEach(function(op) {
	var arr = op.split(' ');

	if (arr[0] == 'insert') {
		q = [arr[1]].concat(q);
	} else if (arr[0] == 'delete') {
		for (var i = 0; i < q.length; i++) {
			if (q[i] == arr[1]) {
				q.splice(i, 1);
				break;
			}
		}
	} else if (arr[0] == 'deleteFirst') {
		q.shift();
	} else if (arr[0] == 'deleteLast') {
		q.pop();
	}
})

console.log(q.join(' '));