var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var n = +lines.shift();
for (var i = 0; i < n; i++) {
	var nums = lines.shift().split(' ');
	var x1 = +nums[0];
	var y1 = +nums[1];
	var x2 = +nums[2];
	var y2 = +nums[3];
	var x3 = +nums[4];
	var y3 = +nums[5];
	var x4 = +nums[6];
	var y4 = +nums[7];

	if (((x2 - x1) * (y4 - y3)).toFixed(12) == ((x4 - x3) * (y2 - y1)).toFixed(12)) {
		console.log('YES');
	} else {
		console.log('NO');
	}
}