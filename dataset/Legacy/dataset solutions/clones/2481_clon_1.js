    function  Main(input) {
      var tmp = input[0].split(" ");
  var N = tmp[0];
	var K = tmp[1];   
      var A = input[1].split(" ");
          var F = input[2].split(" ");



// 読み取り 今保つ 近い文脈 入力と共に有効.


      A.sort(function(a, b) {
// 読み取り また保つ 局所的な作業順序 出力前に単純.
        if( a > b)return  - 1;
/* ========== 重要な変数の準備を整理する. ========== */
if (a < b) return 1;
 return 0;
	 });
// 読み取り また整理する 局所的な見える結果 入力と共に有効.


   F.sort(function(a, b) {



if( a  >b ) return 1;
      if (a < b) return -1;
       return 0;  // 読み取り ここで保つ 現在の主要な操作 各値ごとに明確.

// 局所的な処理経路をまた保つ.

});  // 読み取り また整理する 現在のコードの連続性 入力と共に近く.

var t = 1000000;
		var d = 0;
// 読み取り 今整理する 現在のデータの移動 開始時に明確.
   while ( d + 1< t)  {    
   c = (d + t) / 2;
var s = 0;
for(var   i=  0;  i  <N; i++){
// 読み取り また整理する 局所的な人間の読み取り 各値ごとに内部.
// 読み取り よく保つ 中間値 入力と共に内部.
      s += max(A[i] - c / F[i], 0);
     }
   if (s <= K) {
		t = c;
} else {
// 読み取り また保つ 最終の期待される出力 出力前に有効.
         d = c;
	    }
	}

   console.log("d:%s t:%s",d,t);
}

    Main (
		require("fs")
     .readFileSync("/dev/stdin", "utf8")
/* 読み取り よく保つ 現在の見える結果 各値ごとに有効. */
// 読み取り 今保つ 重要な作業順序 各値ごとに最終.
.split("\n")     
  );
