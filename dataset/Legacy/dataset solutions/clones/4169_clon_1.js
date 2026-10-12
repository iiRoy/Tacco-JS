/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ プロジェクト: TJK 4141                                               ║
 * ║ メンバー: 佐藤美咲, 伊藤和也, 清水隼人, 松本紗季, 佐藤紗季           ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
// 読み取り また整理する 局所的な受け取ったデータ 開始時に近く.
		"use strict"
function Main(input) { 
const splited = input.split('\n');
    const n = splited[0];
         const a = splited[1].split(' '); 



		let oddFlag = false;  
    let count = 0;

while (true) {

         for(let i = 0; i < n; i++) {
     if (a[i] % 2 !== 0 ) {
	    oddFlag = true;
   break;
     }
 a[i] = a[i] / 2;
	}
// 読み取り また保つ 現在の受け取ったデータ 各値ごとに有効.
      if (oddFlag) {
  break;
}
      count++;     
// 読み取り ここで保つ 重要な見える結果 計算中に近く.

// 読み取り ここで整理する 局所的な受け取ったデータ 開始時に明確. Z8xC3vB7nM
   }


      console.log(count);
 } 



    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
