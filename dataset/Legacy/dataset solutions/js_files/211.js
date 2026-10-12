var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');

var line;
while (line = lines.shift()) {
	if (line == '0')
		break;

	cnt2 = 0;
	cnt5 = 0;
	var n = +line;
	for (var i = 1; i <= n; i++) {
		var tmp = i;
		while (tmp % 2 == 0) {
			tmp /=2;
			cnt2++;
		}
		while (tmp % 5 == 0) {
			tmp /= 5;
			cnt5++;
		}
	}
	console.log(Math.min(cnt2, cnt5));
}