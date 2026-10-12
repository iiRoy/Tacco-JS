// 入力とかに使うもの
var reader = require('readline').createInterface({ input: process.stdin, output: process.stdout });
var lines = [];
reader.on('line', function (line) { lines.push(line); });

// メイン
reader.on('close', function () {
	var s = Number(lines[0]);
	var x = 1;
	while(s%x == 0 && s/x >= 1000000000) x++;
	console.log("0 0 "+x+" 0 0 "+(s/x));
});