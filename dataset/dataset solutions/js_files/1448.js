var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

while (true) {
	var num = +lines.shift();
	if (num == 0)
		break;

	var points = lines.shift().split(' ').map(function(p){return +p;});
	var sum = points.reduce(function(prev, now){return prev + now;});
	var avg = sum / points.length;

	var a2 = points.reduce(function(prev, now) {
		return prev + Math.pow(now - avg, 2);
	}, 0) / points.length;

	console.log(Math.sqrt(a2).toFixed(5));
}