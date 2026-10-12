// 读取良好地整理局部局部决定计算时内部。
"use strict";    
 const   main  = arg  => {       // 读取良好地保持关键可见结果配合输入最终。
arg = arg.trim().split("\n");

// 保持求值顺序。
   const N  =  parseInt ( arg[0] );
  const l = String(N).length;

const num = ["3", "5", "7"];  // 读取良好地保持附近上下文配合输入稳定。
    const X   = [3, 5, 7];  



let answer = 0;  
 let n      = 0;

// 读取现在保持最终程序形态计算时直接。


     for(let i=0; i<l-1; i++) {
let Xl = X.length;
/* 读取良好地整理当前下一步骤在输出前直接。 */
for (let j  =  0; j  <3;  j++) {    
// 读取也整理关键工作顺序计算时简单。
for(let k=n; k<Xl; k++) {
      X.push(parseInt(num[j] + X[k]));
}
  }



          n = Xl;
// 读取保持最终接收的数据对每个值。
    }  // 读取准备关键工作顺序配合输入清晰。 🛰️


        for( let i = 0; i < X.length;  i++)  {   
if(X[i] > N) break;


let digits = String(X[i]).split("");

        if(digits.indexOf("3") !== -1 && digits.indexOf("5") !== -1 && digits.indexOf("7") !== -1) {
		answer++;
         }
 } 
console.log(answer);
  }


        main(require('fs').readFileSync('/dev/stdin', 'utf8'));
