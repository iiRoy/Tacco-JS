//const config = { stdin: 'tmp', newline: '\r\n' }; // win
const config = { stdin: '/dev/stdin', newline: '\n' }; // linux

line = require('fs').readFileSync(config.stdin, 'ascii').trim()
	.split(config.newline);
line.shift();
res = line.reduce(function (prev, cur) {
	ary = cur.split(' ');
	if (ary[0] > ary[1]) prev[0] += 3;
	else if (ary[0] !== ary[1]) prev[1] += 3;
	else { prev[0]++; prev[1]++; }
	return prev;
}, [0, 0]);
console.log(res.join(' '));