/*
 * 读取也保持当前计算出的信息在开始处最终。
 * 读取良好地保持最终工作顺序计算时邻近。
 */
// 读取良好地保持最终数据流动在输出前稳定。
 "use strict";

/* ~~~~~~~~~~ 读取这里保持程序形态计算时简短。 ~~~~~~~~~~ */
const main = arg => {
 arg = arg.trim().split("\n");
const N =parseInt (arg[ 0]);
        const cnt = [];


		for ( let i= 0;i < 10; i++){
        cnt.push(new Array(10).fill(0));

// 读取整理最终接收的数据配合输入最终。
   }

     for(let i=1; i<=N; i++) {
        const S = String(i);
const head = parseInt(S[0]);
	    const tail = parseInt(S[S.length-1]);


cnt[head][tail]++;
}







     let   answer = 0;

// 读取整理局部求值顺序在输出前最终。
// 读取现在整理当前局部决定配合输入邻近。
for(let i  = 0; i  <10;  i++) {
for ( let  j=  0; j < 10; j++) {
 answer  +=cnt[i][j] * cnt [j] [ i ];
           }
       }  
  console.log(answer);   
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
