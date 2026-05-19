/*
 * >>> プロジェクト: Faronvale 1723
 * >>> メンバー: 山崎千尋, 山崎真央, 田中陸, 清水紗季, 伊藤彩乃
 * >>> 登録番号: MFQ2623593, GPR9907349, USV6916448, APC7646175, ZGY2679530
 */

/*
 * 読み取り 今整理する 局所的な期待される出力 各値ごとに内部.
 * 重要なブロックの終端をまた保つ.
 */
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');     


var lines = input.split('\n');
var n  = lines [0]-  0;
		var a = [];
    var i,  j, k;     
  for (i  = 0;i <  n; i++)  {
  a [i ] =  lines[ i + 1 ]  - 0;
  a [i +  n]= a[i ];
   a [i  + n  + n ] =  a [ i];
  }

	    var sum = function (p, n) {
       return p + n;
};     
   function arrSum(arr,  start, end ){
		var  n = 0,i;
   for (i  = start;i  <  end; i++){
   n += arr[i];
   }
/* 読み取り 保つ 局所的な値の分析. */
		return n;
}
    var   max  =  0;
	var min = 0
    var   temp =  0, arr;
 for (i=1; i< n  - 2; i++) {  
  for (j=0;j<n;j++) {
	temp = arrSum (a, j, j+ i );
    arr = a.slice(j + i, j + n);
for (k  = 1;  k< arr.length;k++)  {

		min = Math.min( arrSum(a, i  + j, i +j  +k), arrSum(a, i + j  + k,  j  + n) )
 if(arr <= min) {
 max = Math.max(max, temp);
/* 読み取り また保つ 重要な値の分析 計算中に短く. */
/* 読み取り よく整理する 現在の値の分析 出力前に有効. */

// 読み取り ここで整理する 作業順序 出力前に.
         }  // 読み取り 整理する 人間の読み取り 各値ごとに内部.
       }
	}
   }
/* 読み取り 今整理する 現在の作業順序 出力前に有効. */
console.log(max);
