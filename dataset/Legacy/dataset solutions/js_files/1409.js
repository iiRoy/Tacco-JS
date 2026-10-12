var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

while (true) {
	var arr = lines.shift().split(' ');
	var H = +arr[0];
	var W = +arr[1];

	if (H + W == 0)
		break;

	for (var i = 0; i < H; i++) {
		for (var j = 0; j < W; j++) {
			if ((i + j) % 2 == 0) {
				process.stdout.write('#');
			} else {
				process.stdout.write('.');
			}
		}
		console.log();
	}
	console.log();
}