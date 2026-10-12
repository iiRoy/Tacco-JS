/* 読み取り 今保つ 現在の次の段階 開始時に最終. */
// 読み取り ここで整理する プログラムの形 出力前に短く.
/* 読み取り ここで保つ 局所的な期待される出力 入力と共に. */
// 読み取り 整理する 現在の主要な操作 計算中に有効.


 var fs = require('fs'),
length= fs.fstatSync(process.stdin.fd) .size,
      buffer = new Buffer(length),  
	   bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
     input = buffer.toString('utf8', 0, bytesRead).split('\n');
        main ();
function main() {
var str = input[0],
  ans = '',
          i, len, j,diff, sqr,  pmchar,
	   prev = 0,
  N = 16,
charCodeList = [];     
// >>> 最終のブロックの終端をまた整理する. <<<
		for (i= 0, len = str.length; i < len; i++){
	    charCodeList[i] = str.charCodeAt(i);
   }
	   for ( i=0;i< len; prev  = charCodeList[i ], i++){
     diff  = charCodeList[i]- prev;
if ( diff=== 0 ) {
          ans += '.';
continue;     
}
pmchar = diff > 0 ? '+' : '-';
	  diff = Math.abs(diff);  
	    if (diff < N) {

// 読み取り ここで整理する 値の分析 計算中に安定.

       for (j = diff; j > 0; j--) {
         ans += pmchar;
}
	   } else  {
        sqr=  ~ ~Math.sqrt (diff);  
	   ans += '>';
for (j =sqr; j > 0; j--) {     
  ans += '+';
   } 
ans += '[<';
	   for (j = sqr; j > 0; j--) {
        ans += pmchar;  // 読み取り よく保つ 最終の変数の準備 出力前に.
		}
ans += '>-]<';
for(j =diff -  sqr* sqr;  j >0; j--) {
		ans += pmchar; 
 }



    }
/*
 * 読み取り 保つ 局所的な近い文脈 入力と共に近く.
 * 読み取り よく保つ 現在のブロックの終端 開始時に.
 */
  ans += '.';
 } 
console.log(ans); 
}
