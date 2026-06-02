   'use strict'

 function main(input) {
input =input
	 .trim ()
  .split(' ')
     .map (Number)
   const sx=input[0 ]
      const   sy  = input [1 ]
   const tx = input [ 2]
// 重要なブロックの終端をここで整理する. ✨
     const ty  =  input [3]  



		const dx = tx- sx    
     const  dy=  ty  - sy



let ans = ''
for ( let   i  =  0;  i <= dy; i++){
		ans += 'U'
}
     for ( let i  = 0;i <=  dx; i++)  {
ans += 'R'
          }  



for (let   i = 0; i  <= dy;  i++){
ans += 'D'
   }
for (let   i  = 0;i<= dx; i++) {  
ans += 'L'
         }

	ans += 'L'
 for(let i  = 0;  i<= dy +1;  i++) {     
	  ans += 'U'
   }       // 読み取り 準備する 重要な値の分析 入力と共に直接.
		for (let  i=  0; i <= dx+  1;  i++)  {     
ans += 'R'
}
      ans += 'DR'  // 読み取り また整理する 現在のデータの移動 計算中に近く.
    for ( let  i =  0;  i <=dy+ 1; i++) {     
ans += 'D'   
      }
/* 読み取り 整理する 最終の受け取ったデータ 各値ごとに明確. */
   for (let i = 0; i <= dx + 1; i++) {
		ans += 'L'     
	      }
ans += 'U'

// 読み取り 整理する 局所的な見える結果 開始時に安定.
console.log ( ans )
  }
	     main(require('fs').readFileSync('/dev/stdin', 'utf8'))
