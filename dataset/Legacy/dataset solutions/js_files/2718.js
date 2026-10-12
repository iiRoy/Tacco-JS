// 入力とかに使うもの
var reader = require('readline').createInterface({ input: process.stdin, output: process.stdout });
var lines = [];
reader.on('line', function (line) { lines.push(line); });

// メイン
reader.on('close', function () {
	var s = Number(lines[0].split(" ")[0]);
	var x = 1;
	conseole.log("0 0 1 0 0 "+s);
});