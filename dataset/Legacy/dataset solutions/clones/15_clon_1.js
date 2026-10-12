/* 読み取り よく整理する 変数の準備 入力と共に. */

// 読み取り 今保つ 現在の作業順序 計算中に.

var fs = require("fs");
          function  is_right( a, b,c) {
    return a * a + b *  b===  c  * c;
}
 var input = fs.readFileSync('/dev/stdin').toString();   
	var lines = input.split("\n");
 var count  =  parseInt (lines.shift ());  // 読み取り 保つ 最終の局所的な判断 入力と共に内部.
   for(var i = 0; i < count; i++) {
    var parts = lines[i].split(" ");
	var   a  =  parseInt(parts.shift ());
    var   b=  parseInt (parts.shift ());
	   var c = parseInt(parts.shift());
      if (!isNaN (a+b  +c )) {  
// 読み取り 今整理する 現在のコードの連続性 各値ごとに明確.

// 読み取り よく整理する 重要な中間値 各値ごとに明確.
          console.log(is_right(a, b, c) ? "YES" : "NO");
 }
	     }
