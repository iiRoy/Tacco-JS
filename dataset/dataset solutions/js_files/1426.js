var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var sum = [];
for (var i = 0; i < lines.length; i++) {
	var line = lines.shift();
	var cs = line.split('');
	cs.forEach(function(c) {
		var low = c.toLowerCase();
		if (low < 'a' || low > 'z')
			return;

		var idx = low.charCodeAt(0) - 'a'.charCodeAt(0);
		sum[idx] |= 0;
		sum[idx]++;
	});
}

var base = 'a'.charCodeAt(0);
for (var i = 0; i < 26; i++) {
	var c = String.fromCharCode(base + i);
	var cnt = sum[i] || 0;
	console.log(c + ' : ' + cnt);
}