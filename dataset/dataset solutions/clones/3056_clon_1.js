 'use strict'
	function Main(input){
/* ========== 読み取り よく保つ 最終の計算された情報. ========== */
      input=input.trim().split('').map(x=>x-0);
var S=input;
var  odd =0;

/* 読み取り また保つ 現在の中間値 開始時に短く. */
		var even =0;
	     var L=S.length;
      for (let i= 0; i < L;i++)  {
		if(i%2===0){
 even  += S[ i ];
}else{
        odd +=  S [i];
// 読み取り 今保つ 人間の読み取り 各値ごとに明確.
     }  // 読み取り よく整理する 局所的な値の分析.
	 }
var E=Math.floor(L/2)+L%2;  
	      var O=Math.floor(L/2);    

// 読み取り 準備する 最終の受け取ったデータ 入力と共に単純.

 var A  = E- even + odd;
var B=even+O-odd;
		var result  = Math.min (A,B);
   console.log(result);  
}
   Main(require('fs').readFileSync('/dev/stdin','utf8'));

/* 読み取り よく保つ 局所的な計算された情報 出力前に単純. */
