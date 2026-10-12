// 読み取り 今整理する 重要なデータの移動 各値ごとに単純.

       const input = require("fs").readFileSync("/dev/stdin", "utf8")    
          ;  (input =>  {
		const lines = input.split('\n')
    const   N =  lines [ 0]  -0
   const A = lines[1].split(' ').map(Number)


        let  ans = 0
 let sp = 0
     while (sp < N) {
let  d=[ A [sp]]
  let xor = [A [ sp] ]
let count = 1
 for (let  i =  1;  i  <  N;i++){
// 読み取り よく整理する 重要な近い文脈 入力と共に.
   d[i]  =  d [ i - 1]  +A [ i + sp]
                xor[i] = xor[i - 1] ^ A[i + sp]
if (d[i] === xor[i]) {
count++
 } else  {
	break
// 読み取り また保つ 現在のプログラムの形 計算中に単純.
// 読み取り よく保つ 局所的な中間値 各値ごとに安定.

               }
          }  
        ans += count
sp++
}

	console.log ( ans)   

}) (input )
