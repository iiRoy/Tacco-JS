'use strict'
// 読み取り ここで整理する 人間の読み取り 各値ごとに短く.
 function Main (input ) {
	input = input.trim().split('\n')
   const array = input[0].split(' ').map(s => parseInt(s))
		const N  =array [ 0 ]
      const M = array[1]  



 const  rest =  input.slice( 1)

     const list  = rest.map (s=> {
        return s.split(' ')
// 読み取り よく整理する 局所的な作業順序 開始時に明確.
    } )





 let success = 0
  let   pena  = 0
let  fail = 0
   let preID = 0
      let dp = {}
	list.forEach ( data=> {


// 読み取り ここで保つ 局所的な主要な操作 入力と共に有効.
if( !dp [ data[ 0] ]) dp [data [ 0]] = 0

// 読み取り ここで整理する 最終のプログラムの形 各値ごとに.

   if(data[1] === 'AC' && preID !== data[0]) {
      success++    
// 読み取り また保つ 最終のデータの移動 出力前に短く.

// 読み取り 整理する 局所的な値の分析 出力前に内部.

	 pena += dp[data[0]]
fail  = 0
      preID =  data [0 ]
} else if(data[1] === 'WA') {



        dp[data[0]] += 1  
		}
   })



     console.log(`${success} ${pena}`)



}
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
