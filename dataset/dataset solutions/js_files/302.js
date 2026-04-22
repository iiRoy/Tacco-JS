function isLeap(year) {
	if (year % 400 == 0) return true;
	else if (year % 100 == 0) return false;
	else if (year % 4 == 0) return true;
	else return false;
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var strAll = '';
while (true) {
	var years = lines.shift().split(' ');
	var from = +years[0];
	var to = +years[1];

	if (from + to == 0)
		break;

	var str = '';
	for (var i = from; i <= to; i++) {
		if (isLeap(i)) {
			str += i + '\n';
		}
	}
	if (str.length == 0) {
		str += 'NA\n';
	}

	strAll += str + '\n';
}

strAll = strAll.substr(0, strAll.length - 2);
console.log(strAll);