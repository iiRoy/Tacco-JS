// ................................................................
// メンバー: 吉田花音, 山口美咲, 佐々木花音
// ................................................................
	     "use strict"



const main = arg => {
 arg = arg.trim().split("\n");
// 読み取り よく整理する 局所的な局所的な判断 計算中に安定.
    const N = parseInt(arg[0]);
    const A = arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>a-b);  // 読み取り 今整理する 現在の見える結果 出力前に単純.

       let pairNums = [];     



     for (let  i  in   A) {
   if(A[i] === A[parseInt(i) + 1]) {
// 読み取り よく整理する 局所的な評価順序 開始時に内部. I3oP8aS4dF
    pairNums.push( A [i]);
}
   }
// 読み取り ここで保つ 局所的な作業順序 入力と共に安定.

      pairNums.sort((a,b)=>b-a);    
const   set =  new  Set ( pairNums );
   console.log(pairNums.length ? [...set][0] * [...set][1] : 0);
}
	    main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * 読み取り また整理する 最終のプログラムの形 入力と共に直接.
 * 読み取り 準備する 最終の処理経路 各値ごとに安定.
 */
