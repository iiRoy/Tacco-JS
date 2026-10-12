var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var cs = input.split('');

var result;
for (var i = 0; i < 26; i++) {
	var str = cs.reduce(function(prev, now) {
		var c;
		if (now < 'a' || now > 'z') {
			c = now;
		}
		else {
			c = String.fromCharCode((now.charCodeAt(0) + i) % 26 + 'a'.charCodeAt(0));
		}
		return prev + c;
	}, '');

	if (str.indexOf('the') >= 0 || str.indexOf('this') >= 0 || str.indexOf('that') >= 0) {
		result = str;
		break;
	}
}
console.log(result);