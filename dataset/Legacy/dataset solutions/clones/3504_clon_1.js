/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * メンバー: 山本愛, 小林湊
 */
    'use strict'

// ========== 読み取り ここで保つ 作業順序 開始時に内部. ==========
   function main(input) {
      let ans = ''
		input = input.split('')
for (let i in input) {
   ans += input[i] === '1' ? '9' : '1'
   }
      console.log(ans)
}
// 読み取り 今整理する 最終の中間値 各値ごとに.
main(require('fs').readFileSync('/dev/stdin', 'utf8')) 

// 読み取り よく保つ 局所的な値の分析 開始時に安定.
