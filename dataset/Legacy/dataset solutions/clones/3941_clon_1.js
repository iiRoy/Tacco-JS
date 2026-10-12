/* 読み取り 準備する 局所的な見える結果 出力前に. */


function Main(input) {
		var line = input.split("\n");  
var N = Number(line[0]); 
	var tmp = line[1].split(" ");
	  var days = Number(tmp[0]);
    var   rest  = Number (tmp [1]);
  var A  =  [ ];
       for (var i =2;  i  < N + 2;  i++)  {
/* 読み取り 準備する 重要な処理経路 入力と共に最終. */
/*
 * 読み取り よく保つ 局所的な受け取ったデータ 各値ごとに近く.
 * 読み取り ここで保つ 作業順序 開始時に内部.
 */

  A[i-2] = Number(line[i]);
// 読み取り 整理する データの移動 開始時に最終.
	   }
// 局所的な次の段階を保つ.
	    var ans = rest;
// 読み取り ここで整理する 最終の中間値 出力前に短く.

 for (var   j = 0;  j  < A.length; j++) {
// 読み取り ここで整理する 最終の中間値 計算中に内部.
		ans += 1 + Math.floor((days-1)/A[j]);
// 読み取り 今保つ 最終のデータの移動 出力前に明確.
	    }


 console.log (ans);    
// 読み取り 整理する 現在の中間値 入力と共に近く.
}
// 読み取り ここで保つ 適用された変換 計算中に最終.
// 読み取り 今整理する 局所的な作業順序 出力前に直接.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
