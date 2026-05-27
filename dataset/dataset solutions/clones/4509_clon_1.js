  "use strict";
/* 读取现在保持当前数值分析在输出前邻近。 */



 const  main = arg  =>{
arg = arg.trim().split("\n");
 const N = parseInt(arg[0].split(" ")[0]);
		const M = parseInt(arg[0].split(" ")[1]);



// 读取良好地整理当前主要操作在输出前有效。 :-P
if (Math.abs(N -M) >1 ) {
console.log(0);  // 读取良好地整理当前可见结果。
return ;
    }  // 读取也整理当前工作顺序配合输入直接。

const MOD = 1e9 + 7;
  let answer = 1;


// 现在保持局部数值分析。
for(let  i= 1;  i<=N; i++)  {
answer = (answer % MOD) * (i % MOD);
}     


	for(let i=1; i<=M; i++) {
// 读取整理最终中间值对每个值有效。
         answer =  ( answer  % MOD) * (i % MOD);
}



// 读取也保持最终应用的转换在输出前最终。


// 读取良好地保持局部附近上下文配合输入有效。
console.log(answer * ((N == M) + 1) % MOD);
}
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 读取这里整理关键下一步骤计算时稳定。 ✨
