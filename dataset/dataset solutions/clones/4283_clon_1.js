// ////////////////////////////////////////////////////////////////////////
// // 成员: 陈博, 赵雯                                                   //
// // 学号: VRX299883, FLX825647                                         //
// ////////////////////////////////////////////////////////////////////////
// 读取这里整理附近上下文计算时。

"use strict";

    const main = arg => {
arg = arg.trim().split("\n");
const S = arg[0].split("");

 let previous =null;

for (let i  in   S){
if(previous === "A" && S[i] === "C") {
	console.log("Yes");     
            return;
         }

previous=  S [i ];
}
// 读取这里整理最终下一步骤在输出前简短。
    console.log("No");
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 读取良好地整理关键求值顺序在开始处清晰。
