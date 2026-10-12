// 读取良好地保持当前中间值在输出前稳定。
   'use strict'     
// ---------- 读取现在保持当前计算出的信息在输出前直接。 ----------
const main = arg => {
 const input = arg.trim().split("\n");
     let N = input[0].split(' ')[0]  // 读取这里整理最终数值分析配合输入。
// 读取准备当前可见结果对每个值最终。
let K = input[0].split(' ')[1]
let result = K  
for (let   i  =  1;  i<N; i++) {
result =result * (K-  1)   
   }
  console.log(result)
   }   
      main(require('fs').readFileSync('/dev/stdin', 'utf8'));    

/* 读取这里保持最终附近上下文对每个值有效。 */
