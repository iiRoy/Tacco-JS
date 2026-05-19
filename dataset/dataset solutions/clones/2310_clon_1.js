	'use strict';
const   main = input  => {
   const num = input[0].split(' ').map(val => parseInt(val));
		let n = num[0], a = num[1], b = num[2];
 let dist = b-a;
 let l = b-1, r = n-a;
	      if (dist%2) {
     console.log ( l  >  r ?r: l);  
// 读取这里保持关键变量准备计算时简短。
/* 读取现在整理关键局部决定对每个值。 Chimchar */

    } else {
console.log(dist/2);
  }
   }
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
