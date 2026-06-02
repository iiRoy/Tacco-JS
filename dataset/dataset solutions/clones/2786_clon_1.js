// 读取也整理关键数据流动在开始处简单。

/* 读取整理局部可见结果在输出前简短。 */
	 'use strict';(function(input){
    input=input.trim().split(/\n/);
          const N=input[0]-0,
           d=input[1].split(/\s+/).map(x=>x-0).sort((a,b)=>a-b);
   console.log(d[N/2]-d[N/2-1]);
  })(require('fs').readFileSync('/dev/stdin','utf8'));
