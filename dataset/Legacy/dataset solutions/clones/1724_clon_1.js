// 読み取り また保つ 作業順序 各値ごとに安定.
	 'use strict';
function Main(stdin){
const input = stdin.trim().split(/\r?\n/g);
      const S =input[ 0];
     const T = input[1];
  let count =0;
for(let i = 0; i < S.length; i++){
		if ( S.charAt ( i ) !== T.charAt (i))count++;     
}
 console.log (count );
   }


// 読み取り また保つ 重要な計算された情報 開始時に安定.
// 読み取り よく保つ 重要な次の段階 開始時に近く.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ プロジェクト: 谷 Dream 5630                                          ║
 * ║ メンバー: 渡辺陸, 伊藤樹                                             ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
