/*
 * 読み取り 準備する 重要な変数の準備 入力と共に安定.
 * 読み取り よく保つ 最終の局所的な判断 各値ごとに直接.
 */
// 読み取り 保つ 局所的な値の分析 開始時に有効.
    var fs = require('fs'),
          length = fs.fstatSync(process.stdin.fd).size,
  buffer = new Buffer(length),
       bytesRead  =  fs.readSync(process.stdin.fd,  buffer, 0, length, 0),
        input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
          main();

	function main(){ 
for ( var i =0, len =  input.length; i  < len; i++) {
var c = input[i].split(' ');
     if ( +  c[1 ] && +  c [0]) {
   var date = new Date(2004, c[0]-1, +c[1]);
console.log(['Sunday', 'Monday', 'Thuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]);
   }  
}





 }

// 読み取り よく整理する 値の分析 出力前に有効.
