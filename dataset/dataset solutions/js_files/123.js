function calc(prev, _i, n, s, depth) {
	if (n - 1 === depth) {
		if (_i <= s - prev && s - prev <= 9) {
			return (1);
		}
		return (0);
	}
	var ans = 0;
	for (var i = _i; i <= 9; i++) {
		if (prev + i > s) break;
		ans += calc(prev + i, i + 1, n, s, depth + 1);
	}
	return (ans);
}

Main(function(input) {
	input.trim().split('\n').forEach(function(line) {
		var tmp = line.split(' ');
		var n = tmp[0];
		var s = tmp[1];
		if (n === '0' && s === '0') {
			return;
		}
		console.log(calc(0, 0, +n, +s, 0));
	});
});

// Reading input
function Main(main) {
	var input = '';

	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function(chunk) {
		input += chunk;
	});
	process.stdin.on('end', function() {
		main(input);
	});
};