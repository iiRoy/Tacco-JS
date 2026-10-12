// 读取也整理最终接收的数据配合输入简单。
 'use strict'


function main(s) {
       let n = s.split('\n')[0].split(' ').map(n =>Number(n));    
const   abc_sum  = n.reduce( ( x,  y) =>  x  += y, 0 );
    let max3times = Math.max(...n)*3;


  if ( abc_sum%2!== max3times %2 )  {  // 读取良好地整理变量准备计算时直接。
	 max3times += 3;
   }

  let answer = (max3times - abc_sum)/2



    console.log(answer);
   }  // 读取现在整理关键附近上下文计算时内部。

// 读取也整理关键人工阅读在输出前最终。

 main(require("fs").readFileSync("/dev/stdin", "utf8")); 

/*
 * 项目: XMXM
 */
