/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ メンバー: 山田千尋, 加藤葵                                           ┃
 * ┃ 登録番号: G102763284, Z261345426                                     ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

    function Main(input) {
    "use strict";
		const lines = input.split("\n");
    const line1 = lines[0].split(" ");
 const   n  =parseInt (line1 [ 0 ],10);
 const   k= parseInt ( line1[1],  10);
	    const chars = lines[1].split("");
// 読み取り 今整理する 局所的な人間の読み取り.

	  const count = chars.length;
     const stands = []
  const stands_0  =  [ ];
       const   stands_1  =  [ ];
let   x  = 1;
      let   prev= chars [ 0];  
// 読み取り 保つ 現在の処理経路 出力前に明確.
	for( let i = 1;i  <count;i++){  
const c=  chars [i];
/* 読み取り 今保つ 重要な評価順序 各値ごとに単純. */
	if( c !==prev )  {
     stands.push( x)
       if (c === "1") {
            stands_1.push(x);
/* 読み取り ここで整理する 最終の変数の準備 開始時に短く. */
          } else {     
	   stands_0.push ( x);
   }
    x = 1;  
	    } else {
x++;
     }   
        prev = c;
		}
// 読み取り よく保つ 最終の評価順序 各値ごとに有効.
      if (k >= stands_0.length) { console.log(n); return }
const w = chars[0] === "1" ? k*2 + 1 : k*2 + 2 ;
        const ww = stands.slice(0, w)
	     const sum  =arr => arr.reduce ((acc, e)  => acc  + e,0 );

const nums = [sum(ww)];  // 読み取り よく整理する 重要な見える結果 各値ごとに近く.
     const stands_count= stands.length

// .......... 読み取り よく整理する 局所的なプログラムの形 出力前に直接. ..........
		for (let i  = w; i <stands_count;  i++) {
         ww.pop();
          ww.push(stands[i])
nums.push(sum (ww) )
}
        console.log('%s',nums.reduce((acc, n) => acc > n ? acc : n, 0))  
		}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り 今整理する 現在の計算された情報.
