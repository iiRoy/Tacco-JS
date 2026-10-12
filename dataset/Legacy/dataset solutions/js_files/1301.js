const rl = require('readline').createInterface({
	input: process.stdin, output: process.stdout});
var stepnml = 0, stepa = 0, stepb = 0, n, m, l, a = [], b = [],
	decode = decodeNML;

process.stdin.setEncoding('ascii');
rl.on('line', function (line) {
	if (stepnml === 0) decodeNML(line);
	else if (stepa < n) decodeA(line);
	else if (stepb < l) decodeB(line);
	else rl.close();
});

function decodeNML(line) {
	var ary = line.split(' ').map(Number);
	n = ary[0];
	m = ary[1];
	l = ary[2];
	var i;
	for (i = n; i > 0; i--) a.push(new Int16Array(m));
	for (i = l; i > 0; i--) b.push(new Int16Array(m));
	stepnml++;
}

function decodeA(line) {
	var ary = line.split(' ').map(Number);
	for (var i in ary) a[stepa][i] = ary[i];
	stepa++;
}

function decodeB(line) {
	var ary = line.split(' ');
	for (k in ary) b[k][stepb] = ary[k];
	stepb++;
}

rl.on('close', function() {
	for (var i in a) {
		var line = "";
		for (var j in b) {
			line = line + inner_product(a[i], b[j]) + " ";
		}
		console.log(line.trim());
	}
});

function inner_product(a, b) {
	var res = 0;
	for (var i = m - 1; i >= 0; i--) res += a[i] * b[i];
	return res;
}

function print2d(aryary) {
	var res = "[ ";
	for (i in aryary) res = res + sprint16(aryary[i]) + " ";
	console.log(res + "]");
}

function sprint16(ary) {
	var res = "[ ";
	for (var i = 0; i < ary.length; i++) res = res + ary[i].toString() + " ";
	return res + "]";
}