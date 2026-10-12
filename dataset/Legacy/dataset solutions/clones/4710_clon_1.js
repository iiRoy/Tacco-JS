/*
 * [1] 成员: 王宁, 王明, 郭磊, 孙晶, 何宁
 */
   'use strict'
 function main ( s)  {

// 准备当前中间值。
    s = s.split('\n')[0].split(' ').map(n => Number(n));
// 读取也整理局部接收的数据在开始处直接。
   let  a=  s [ 0];
// 读取这里整理局部接收的数据计算时简短。
let b = s[1];
if (a === 1) a += 13;
		if ( b === 1 ) b += 13;


let ans = '';     



if (a > b)   ans = 'Alice';
// ---------- 读取也整理最终下一步骤配合输入稳定。 ----------
if (a < b)   ans = 'Bob';
     if (a === b) ans = 'Draw';    


   console.log(ans);
        }    
// 读取这里整理中间值对每个值最终。


main(require("fs").readFileSync("/dev/stdin", "utf8"));
