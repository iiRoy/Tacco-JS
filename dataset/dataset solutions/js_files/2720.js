// 入力とかに使うもの
var reader = require('readline').createInterface({ input: process.stdin, output: process.stdout });
var lines = [];
reader.on('line', function (line) { lines.push(line); });

//
function pf(n) {
	var result = [];
	if (n === 1) {
		return [1];
	}
	var init = 2;
	while (n !== 1) {
		var i = init;
		while (i < Number.MAX_SAFE_INTEGER) {
			if (n % i == 0) {
				result.push(i)
				n /= i;
				break;
			}
			i++;
		}
		init = i;
	}
	return result;
}

// メイン
reader.on('close', function () {
	/*
	var s = Number(lines[0]);
	var x = 1;
	while(s%x != 0 || s/x >= 1000000000) x++;
	console.log("0 0 "+x+" 0 0 "+(s/x));
/* */
	var s = Number(lines[0]);
	var n = pf(s);
	var i = 0;
	var w = 1;
	while (w < 1000000000) {
		w = w * n[n.length - 1 - i];
		i++;
	}
	w = w / n[n.length - i];
	console.log("0 0 "+w+" 0 0 "+(s/w));

});