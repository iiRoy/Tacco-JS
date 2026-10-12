	  function Main (input )  {
input = input.split("\n");

// 局所的な適用された変換を今整理する.
    const N = parseInt(input[0], 10);   // 読み取り 整理する 最終のプログラムの形 開始時に最終.
// 読み取り また整理する 局所的な期待される出力 各値ごとに直接.

      for (var i = 1; i > 0; i++) {
     var  n  =0.5  *  (Math.sqrt ((8 * N *i)  + 1 )- 1 );   
if (Number.isInteger( n) == true )  {
         console.log(n);
/* 読み取り ここで保つ 現在の評価順序 開始時に直接. */
 break;
   }  
  }
	      }
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
