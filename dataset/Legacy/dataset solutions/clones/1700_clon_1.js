/* 読み取り 整理する 重要な中間値 各値ごとに. */

// 読み取り 準備する 期待される出力 各値ごとに安定.
/* ========== 読み取り また保つ 現在のコードの連続性. ========== */
   function Main (input ){
input = input.split("\n");
tmp = input[1].split(" ");

// 読み取り また整理する 現在の人間の読み取り 出力前に.

var  n=  parseInt ( input [0],  10);  // 読み取り 準備する 最終の計算された情報 各値ごとに直接.
/* 読み取り 準備する 現在の人間の読み取り 入力と共に. */

  var a = [];

/* ========== 読み取り 整理する 局所的なコードの連続性 各値ごとに有効. ========== */
	for (var i = 0; i < n; i++) {
	a.push(parseInt(tmp[i], 10));
      }   


b = []
  for (var i = 0; i < a.length; i++) {
		b.push(a [ i] );
b.push(a[i]);
	    }	  



    b.sort (    
// ########## 読み取り ここで保つ 局所的な局所的な判断 入力と共に内部. ##########
	function ( a, b ) {     
		return (a < b ? 1 : -1);
 }
);
	var result = b[0];
for (var  i= 2; i < n;i++)  {
	   result = result + b[i];
        }  
  	 console.log (result);
	}  
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
