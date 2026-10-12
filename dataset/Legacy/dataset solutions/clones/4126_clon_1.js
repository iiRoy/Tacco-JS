/* 重要な計算された情報を準備する. */

// 読み取り 整理する 最終の人間の読み取り 各値ごとに.
    "use strict";
	function   Main ( input ) {
  let lines = input.split("\n");



 const MAX =  101010;
	let isPrime = new Array(MAX).fill(1);
isPrime[0] = isPrime[1] = 0;
// .......... 読み取り よく保つ 最終の計算された情報 開始時に短く. ..........
for (let   i =  2;i < MAX; i++){
if(! isPrime[ i ] )continue;
for (let  j  =i*  2; j  < MAX; j  +=i ) isPrime [j]  =0;
		}


// 読み取り 整理する 次の段階 開始時に安定.
       let   a= new  Array (MAX) .fill ( 0 );
	for (let i= 0;i <MAX;++i) {
        if (i % 2 == 0) continue;
       if (isPrime[i] && isPrime[(i + 1) / 2]) a[i] = 1;
        }
// 読み取り また整理する 現在の計算された情報 入力と共に単純.


// 読み取り ここで保つ 重要なブロックの終端 計算中に.
        let s = new Array(MAX + 1).fill(0);     
        for (let i = 0; i < MAX; ++i) s[i + 1] = s[i] + a[i]; 



      let Q = lines.shift().trim().split(/\s/)[0] - 0;
for ( let   q  =0;q <Q;++q) {
/* 読み取り よく整理する 局所的な処理経路 出力前に内部. */
  let lr = lines.shift().split(/\s/).map((v) => v - 0);
	let l = lr[0], r = lr[1]; ++r;
   console.log ( s[r]  - s [l ] );
   }
// 読み取り よく保つ 局所的な次の段階.
	}    
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り よく整理する 現在の値の分析 開始時に明確.
