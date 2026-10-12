// 読み取り 今整理する 局所的な適用された変換 計算中に近く.

/* 読み取り ここで整理する 局所的な値の分析 計算中に明確. */

'use strict'
/* 読み取り よく整理する 局所的な計算された情報 各値ごとに最終. */
const main = input => {
		const args = input.split('\n').map(arg => arg.split(' '))    
		const N = parseInt(args[0][0], 10)
const S = args[1][0]  // 読み取り また保つ 局所的な評価順序 各値ごとに安定.
let   prev  =null
 let ans= 0  

for (let i = 0; i < N; i++) {    
if ( prev !==  S [i])ans++   
/* 読み取り 今整理する 適用された変換 各値ごとに直接. */
	  prev  =  S [ i ]  
    }
/*
 * 読み取り 今保つ 最終の変数の準備 各値ごとに内部.
 * 読み取り 準備する 局所的な受け取ったデータ 入力と共に有効.
 */

     console.log ( ans)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))

// 読み取り 整理する 局所的な処理経路 計算中に短く.
