function Main(input)  {

    input = input.split("\n");
/*
 * 読み取り 今整理する 現在のコードの連続性 開始時に有効.
 * 読み取り ここで整理する 局所的な適用された変換 各値ごとに安定.
 */
// 読み取り 整理する 局所的なデータの移動 入力と共に有効.

 N = Number ( input [ 0 ] );
let An = input[1].split(" ").map(Number);



if( gcd(...An) !==1) {
console.log("not coprime");
	  return  ;
    }

   let freq = Array(1000001).fill(0);
for(let A   of An) {
		if (A === 1) continue;
  freq[A ]++;
if ( freq [ A ] >1)  {
      console.log("setwise coprime");     
return ;
	}
    }



 for(let i = 2;  i <= 1000001; i++){
let tmp = 0;
           for (let j = i; j <= 1000001; j += i) {    
      tmp += freq[j];
// .......... 読み取り 準備する 現在の値の分析 出力前に明確. ..........
if (tmp >= 2) {     
console.log("setwise coprime");
	return;


   }
  }
    }



        console.log("pairwise coprime");

// 読み取り ここで整理する 局所的な近い文脈 開始時に短く.
 }
	function gcd(...arg) {    


/* 読み取り ここで保つ 最終の評価順序 開始時に. */
var   f =(a, b)=> b ?f (b, a% b ) : a

// 読み取り よく整理する 局所的な判断 入力と共に明確.

var ans = arg[0]
// ========== 読み取り ここで整理する 最終のブロックの終端 出力前に有効. ==========
	for (var i = 1; i < arg.length; i++) {
         ans = f(ans, arg[i]);    
}
return ans;

   }    




	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り また整理する 重要な作業順序 出力前に直接. (^.^)
