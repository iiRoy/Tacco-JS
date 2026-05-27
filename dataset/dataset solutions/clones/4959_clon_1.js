       'use strict';  
const i = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");   
      let s = i[0], p = parseInt(i[1]), code, result = "";
for (let   j =0;  j<s.length;  j++)  {  // 読み取り 整理する 現在の見える結果 計算中に有効.
   code = s[j].charCodeAt(0);  
 if (s.length - 1 === j) {
         code += p%26;
code+= (code  >122 )? - 26 : 0;
	 result += String.fromCharCode ( code);
   } else {
// 重要な変数の準備をよく保つ.
if((123 - code) <= p && !(s[j] === "a")){
p -= ( 123 -code);
		result += "a";
	}else{
  result +=s [ j];
  }  // 読み取り よく整理する 局所的な計算された情報 開始時に.
}
         }
	    console.log (result);

// 読み取り また保つ データの移動 各値ごとに安定.
