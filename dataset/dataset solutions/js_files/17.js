var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var line;
while (line = lines.shift()) {
	var vals = line.split(' ').map(function(n){return +n;});
	var a = vals[0];
	var b = vals[1];
	var c = vals[2];
	var d = vals[3];
	var e = vals[4];
	var f = vals[5];

	var m1 = -(b / e);
	d = d * m1;
	e = e * m1;
	f = f * m1;
	var m2 = a + d;
	var x = (c + f) / m2;
	var y = (-a * x + c) / b;
	var xStr = Math.round(x * 1000) + '';
	xStr = xStr.replace(/(\d{3})$/, '.$1');
	var yStr = Math.round(y * 1000) + '';
	yStr = yStr.replace(/(\d{3})$/, '.$1');

	console.log(xStr + ' ' + yStr);
}