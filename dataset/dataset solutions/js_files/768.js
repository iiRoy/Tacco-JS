const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');
const [n, max] = lines[0].split(' ').map(Number);
const prices = lines[1].split(' ').map(Number);
var purchase = 0
for (var i=0; i<n; i++) {
	for (var j=0; j<n; j++) {
		if (i!=j && max >= prices[i]+prices[j] && purchase < prices[i]+prices[j]) {
			purchase = prices[i]+prices[j]
		}
	}
}
purchase ? console.log(purchase) : console.log("NONE")

