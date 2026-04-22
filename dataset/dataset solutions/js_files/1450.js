var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var n = +lines.shift();
var S = lines.shift().split(' ');
var q = +lines.shift();
var T = lines.shift().split(' ').filter(function(val, i, self){return self.indexOf(val) == i;});

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