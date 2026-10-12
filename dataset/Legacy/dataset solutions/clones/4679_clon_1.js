// 读取现在整理关键附近上下文在开始处稳定。
  "use strict";

 const  main = arg  =>  {
    arg = arg.split("\n"); 
       const W = parseInt(arg[0].split(" ")[0]);
const a = parseInt(arg[0].split(" ")[1]);
const b = parseInt(arg[0].split(" ")[2]);
	  if((a + W) > b || (b + W) > a) {
    console.log (0);   
// 读取这里整理关键主要操作配合输入有效。 🎯
/* 读取整理当前求值顺序在开始处简短。 */

return ;
	}  // 读取也保持数据流动配合输入最终。


      console.log(a < b ? b - (a + W) : a - (b + W));
	  }
 main(require('fs').readFileSync('/dev/stdin', 'utf8'));
