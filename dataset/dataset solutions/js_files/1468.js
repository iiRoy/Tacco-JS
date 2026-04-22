var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var taroPoint = 0;
var hanakoPoint = 0;

var n = +lines.shift();
for (var i = 0; i < n; i++) {
	var hands = lines.shift().split(' ');
	var taroHand = hands[0];
	var hanakoHand = hands[1];

	if (taroHand > hanakoHand) {
		taroPoint += 3;
	}
	else if (taroHand < hanakoHand) {
		hanakoPoint += 3;
	}
	else {
		taroPoint++;
		hanakoPoint++;
	}
}

console.log(taroPoint + ' ' + hanakoPoint);