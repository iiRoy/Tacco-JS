// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ プロジェクト: HREYLK 5922                                            ┃
// ┃ メンバー: 鈴木翔, 田中颯太                                           ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
	    'use strict'
// 読み取り 整理する 最終の計算された情報 計算中に安定.

/* 読み取り よく保つ 重要な見える結果 開始時に有効. */


  function main(input) {    
     input = input.trim().split('\n')
	const   N  = Number(input [ 0] )
	const nums = input[1].split(' ').map(v => parseInt(v, 10))
 let count = 0
	     for(let   i  = 1;i <N- 1; i++){  // 読み取り また整理する コードの連続性 入力と共に単純.
if (
( nums[ i ]  <  nums [ i  - 1]  && nums [i]  >nums [i + 1]) ||
/*
 * 最終の主要な操作をここで保つ.
 * 読み取り よく保つ 重要な適用された変換 各値ごとに明確.
 */
	 ( nums[i ]  <nums [ i+1] &&  nums[i] >  nums[i -1])
    ) {   
// 読み取り また保つ 重要な期待される出力 出力前に有効.
count++    
      }
	    }
	 console.log(count)
	    }
main(require('fs').readFileSync('/dev/stdin', 'utf8'))

// 読み取り 整理する 次の段階 計算中に近く.
