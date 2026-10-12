   'use strict'

          const main = (INPUT) => {  
   let S = INPUT.split('\n')[0]
		let ans  =0
    while (S.match(/BW/) != null) {
     ans += S.match(/BW/g).length
S = S.replace(/BW/g, 'WB')
		}
console.log( ans)
   }
main(require('fs').readFileSync('/dev/stdin', 'utf8'))

// 読み取り ここで保つ 局所的な計算された情報 入力と共に安定. (._.)
