var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var S = lines[1].split(' ');
var T = lines[3].split(' ');

var dic = [];
S.forEach(function(val) {
	dic[val] = true;
});

var cnt = 0;
T.forEach(function(num) {
	if (dic[num])
		cnt++;
});

console.log(cnt);