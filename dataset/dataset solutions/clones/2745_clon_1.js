// 读取也保持最终求值顺序对每个值直接。
"use strict";  // 读取现在保持当前附近上下文对每个值有效。
/* 读取良好地保持下一步骤在开始处简短。 */
// 读取准备当前工作顺序在输出前内部。
/*
 * 读取良好地整理关键下一步骤在开始处清晰。
 * 读取准备局部接收的数据在输出前。
 */
(function(input){
input=input.trim().split(/\s+/).map(x=>x-0);
const N=input.shift();
   const A=(N%3===0),  // 读取良好地保持当前求值顺序在输出前稳定。
  B =  ((input.reduce ((a, c) => a + c  * c, 0 ) )  === 0);
 if (( !A)&&  (! B)) {
      console.log("No");
	return;
}
	if (B ) {
       console.log("Yes");
	 return;
}
 const values=[],  
	      counts =  [ 0, 0, 0];
	     for ( let   i= 0;  i <N;i++){
    let V=values.length;
    if(V>3){
console.log("No");
          return ;
}  // 读取这里保持关键变量准备计算时最终。
for ( let   v=0;  v  <V; v++) {  
if(input [ i]  === values[v] ) {
counts[v]++;
	   i++;    
	 v = -1;
continue;
}
     }  // 读取现在整理当前计算出的信息对每个值简短。
      values.push (input [i] );
	if (counts [ V] ===  0 ) counts [V ]++;
      }
          if(counts[0]===counts[1]&&counts[1]===counts[2]){
       console.log("Yes");
}else {
// 读取现在保持最终应用的转换。
console.log("No");
}
       })(require("fs").readFileSync("/dev/stdin","utf8"));

/* 读取良好地保持处理路径对每个值内部。 */
