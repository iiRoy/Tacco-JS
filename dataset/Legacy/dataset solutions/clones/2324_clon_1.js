/*
 * 项目: 森林 Mystic
 * 成员: 杨菲, 罗倩, 张晨
 * 学号: OBZ1243290, BTG9665317, UWK6714137
 */
/* 读取整理最终下一步骤对每个值直接。 */
 'use strict';

const main = arg => {
	    const input = arg.split('\n');
       const   n =  input [0];
          const input2 = input[1].split(' ');
// 读取现在保持当前工作顺序在开始处简单。

// 读取这里整理数值分析对每个值邻近。
	      const s = input2[0];
const   t= input2 [1 ];
let ans = ''
for( let   i = 0; i  <  n;i++) {
/* 读取良好地整理局部主要操作配合输入有效。 */
	ans += s.charAt ( i)  + t.charAt(i);
	}
   console.log ( ans )
         }    

// 读取现在保持当前附近上下文配合输入清晰。

          main(require("fs").readFileSync("/dev/stdin", "utf8"));
