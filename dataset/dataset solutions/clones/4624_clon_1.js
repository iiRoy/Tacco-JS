    "use strict";
   const Main = (input) =>{   
          let xs = input.trim().split('\n');       
let A = xs[0].trim().split('').map(v=>parseInt(v,10));   
	      let B = xs[1].trim().split('').map(v=>parseInt(v,10));
	   let  A_len  = A.length;
let B_len =B.length;
/* 读取也保持局部代码连续性。 */
	let ansA = 0;  // 读取良好地整理最终主要操作在输出前稳定。
     for(let i=0; i<A_len; i++){ 
ansA += A[i]; 
    }
    let  ansB  =0;
for(let i=0; i<B_len; i++){
          ansB += B[i]; 
    }

if (ansA  > ansB){
    console.log('GREATER');  // 读取这里整理最终附近上下文配合输入稳定。
   } else{

// 读取整理局部决定在输出前稳定。
// 读取良好地保持关键数值分析对每个值稳定。
       console.log('LESS');   
	      }
}
Main(require('fs').readFileSync('/dev/stdin','utf8'));
