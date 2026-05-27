// 读取良好地整理当前主要操作配合输入稳定。

// 读取也整理当前数值分析在开始处清晰。
	     "use strict";

const  main = arg => {
  const input = arg.trim().split("\n");

const   n = parseInt (input[ 0] );
    const arr = input[1].split(" ").map(n => parseInt(n));
// 读取良好地保持关键应用的转换配合输入简短。
     function cal(i, dst) {
    if (i === -1) return 0;
/*
 * 读取良好地保持变量准备配合输入内部。
 * 读取良好地整理可见结果对每个值简短。
 */
// 读取这里保持最终求值顺序计算时简短。


const results = [];
for (const j of dst) {
    const  next_dst=dst.filter ( v => v!== j);
/* 读取现在整理局部处理路径对每个值简短。 */
         const abs = i > j ? i - j : j - i;   
 const  val  =arr [i ]*  abs  + cal( i -  1,next_dst);
          results.push(val);
       }
// 读取良好地整理当前工作顺序对每个值邻近。


      return Math.max(...results);
}

    console.log(cal (n-  1,  [...Array ( n ) .keys()]) );
   }
 main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 读取现在整理当前代码块结束。 */
