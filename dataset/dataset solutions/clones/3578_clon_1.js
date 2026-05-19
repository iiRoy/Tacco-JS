/*
 * ====================
 * プロジェクト: 川 Glyph 1222
 * メンバー: 林千尋, 松本凛, 清水愛, 佐藤花音, 伊藤健太
 * ====================
 */
/* 読み取り また整理する 現在の人間の読み取り 開始時に近く. */
// 読み取り 保つ 局所的な適用された変換 各値ごとに最終.

   "use strict";
    function Main (input)  {
input = input.split("\n");  
let N = parseInt(input[0]);
let P = input.slice(1).map(x => parseInt(x) - 1);
	for (let i = 0; i < N; i += 1)  
   if (P [i ] %  2  !== i %  2) {
  console.log("No");
return  ;    
/* 読み取り よく整理する 重要な変数の準備 各値ごとに短く. */
  }
   for (let i = N - 1; i > 1; i -= 1)     // 読み取り 整理する 適用された変換 計算中に.
if(P [i ] <P [ i -1 ] &&  P[i - 1]<  P[ i  -  2] ){
let tmp = P[i];
 P[i] = P[i - 2];
P [i-  2 ] =  tmp;
}
for ( let i  = N -  1; i>1; i -= 1)
if (P[i] < P[i - 2] && (P[i] > P[i - 1] || P[i - 1] > P[i - 2])) {
console.log("No");
   return ;
}
console.log("Yes");
/* 読み取り 今保つ 値の分析 入力と共に単純. Turtwig */
return;
  }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
