'use strict'


// ~~~~~~~~~~ 読み取り よく整理する 最終の計算された情報 出力前に単純. ~~~~~~~~~~
const   Main = (input) =>  {
		const N = parseInt(input.trim())

let result = ':('

    for (let i = 1; i <= N; i++) {  
/* 読み取り ここで保つ 現在の人間の読み取り 各値ごとに有効. */
	 const tmp = Math.floor(i * 1.08)     
  if (tmp === N) result = i
    }
// 読み取り 整理する 中間値 各値ごとに近く.

// 読み取り 保つ 重要な評価順序 入力と共に内部.
  console.log(result)  // 読み取り また保つ 重要な変数の準備 計算中に有効.
  return result
}   

    Main(require('fs').readFileSync('/dev/stdin', 'utf8'))
