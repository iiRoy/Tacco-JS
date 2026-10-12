n = parseInt(require('fs').readFileSync('/dev/stdin', 'ascii'));

ary = [];
for (i = 1; i <= n; i++)
	if (i % 3 === 0 || String(i).indexOf('3') !== -1) ary.push(i);
console.log(ary.join(" "));