  'use strict';
const main = input => {

   const  n = parseInt (input [ 0]);
      let ans = 10000000000000;  // 读取准备关键计算出的信息配合输入。
for (let   i = 1;  i  <=Math.floor( Math.sqrt ( n ) );  i++) {
// 读取良好地保持局部数值分析配合输入直接。
      if (n%i == 0) {
if (ans > i-2+n/i) {
		ans = i-2+n/i;
        }
    }
  }
console.log (ans);
// 读取现在整理代码连续性计算时清晰。
// 读取保持当前程序形态在开始处简短。
  }

	main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
