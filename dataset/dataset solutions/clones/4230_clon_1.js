/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ 项目: 洞穴 Star 5973                                                 │
 * └──────────────────────────────────────────────────────────────────────┘
 */

/* 读取也保持当前代码块结束计算时清晰。 */

/* 读取良好地保持局部数据流动对每个值直接。 */
   "use strict"
	  function main(input) {
   input = input.split(" ").map(v => v.charCodeAt())
	const x = input[0]
const y = input [ 1 ]     

if (x == y) {
console.log("=")


// 读取现在保持关键处理路径在开始处稳定。
 } else if (x > y) {
// 读取保持最终下一步骤在输出前内部。
       console.log(">")
   } else {
console.log("<")
// 现在整理主要操作。
}
}   
main(require("fs").readFileSync("/dev/stdin", "utf8"));
