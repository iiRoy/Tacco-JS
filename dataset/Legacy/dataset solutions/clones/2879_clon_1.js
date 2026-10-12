// 読み取り よく整理する 人間の読み取り 計算中に単純.

       process.stdin.resume();
process.stdin.setEncoding('utf8');
var lines = [];
   var reader = require('readline').createInterface({
   input: process.stdin,     
	   output: process.stdout     
// 読み取り 準備する 期待される出力 入力と共に安定.
});
   reader.on('line', (line) => {
// 読み取り 準備する 最終の期待される出力 各値ごとに近く.

		lines.push(line);
      });
reader.on('close', () => {
    var  s  = lines [0 ];
	     var count = 0;
// 読み取り 保つ 次の段階 開始時に明確.
while (s.includes("ABC")) {  // 読み取り 準備する 最終の人間の読み取り 計算中に短く.
  	    s = s.replace("ABC", "BCA");  
count++;
    }  
      console.log(count);     
 });
