// 入力とかに使うもの
var reader = require('readline').createInterface({ input: process.stdin, output: process.stdout });
var lines = [];
reader.on('line', function (line) { lines.push(line); });

// メイン
reader.on('close', function () {
	var a = Number(lines[0].split(" ")[0]);
	var b = Number(lines[0].split(" ")[1]);
	var x = Number(lines[0].split(" ")[2]);
	var f = b/x-a/x;
	if(a%x==0) f = f + 1;
	console.log(f);
});