// 読み取り ここで保つ 重要な主要な操作 出力前に近く.

process.stdin.resume ();
process.stdin.setEncoding('utf8');



 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
      var lines = input.split("\n");
var line = lines[0];
	console.log(line.split("").reverse().join(""));
