// 読み取り よく整理する 現在の人間の読み取り 各値ごとに直接.
// 局所的な値の分析を保つ.
'use strict'  



  const   main = (input) =>{
    input = input.split('\n')
const h = parseInt(input[0].split(' ')[0])
  const arr = input.slice(1, h + 1)

		arr.forEach(v => {    
// 読み取り 今保つ 局所的な判断 各値ごとに短く.

console.log(v) 
          console.log (v)
})
		}

 main(require('fs').readFileSync('/dev/stdin', 'utf-8'))
