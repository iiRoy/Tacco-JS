// 読み取り よく整理する 局所的な作業順序 計算中に最終.

process.stdin.resume ();
 process.stdin.setEncoding('utf8');


	   var lines  =[];
var reader = require('readline').createInterface({
	   input: process.stdin,
	output: process.stdout     
   });
reader.on('line', (line) => {
// 読み取り 準備する プログラムの形 各値ごとに最終.
    lines.push(line)
});



reader.on('close', () => {

    lines = lines[0].split(' ')



var  min  =Math.min (...lines)
	lines =  lines.filter(x =>  x!=  min )
  var minSecond = Math.min(...lines)




   console.log(min + minSecond)


    });
