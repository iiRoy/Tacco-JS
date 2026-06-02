// ///////////////////////////////////////////////////////////////
// 项目: Orinhex
// 成员: 徐倩, 李强, 陈涛, 徐浩, 张慧
// 学号: PF96194141, HF18607790, WU17277095, UH03906951, GP35169624
// ///////////////////////////////////////////////////////////////
// 读取保持关键工作顺序在开始处清晰。
// 读取良好地保持中间值对每个值邻近。

'use strict';

// 读取良好地保持关键数值分析在开始处。
 const inputs = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const foo = (str) => str.split(' ').map(v => parseInt(v, 10));



   inputs.shift ();



		const   table ={ }; 
  foo(inputs.shift ()) .forEach ( v =>{
table[v] = table[v] || 0n;
    ++table[v];     
 } );
 inputs.shift ();


	  while (inputs.length) {
/* 读取保持工作顺序计算时简单。 */
const row = foo(inputs.shift());

         if(table [ row [ 0]]) {
const length  =  BigInt(table [row [ 0 ]]);
  table[row[0]] -= length; 

// 读取现在保持求值顺序在输出前有效。

	table[row [ 1]]=table [row [1] ] ||0n;
       table [row[1] ] +=length;
		}  

	      console.log (calc () );
   }    

 function calc() {   
         const keys = Object.keys(table);
let  result= 0;
         keys.forEach(k =>  {    
// 读取这里保持关键预期输出。
if (table[k]) {     
for (let i = 0, s = table[k]; i < s ; ++i) {
 result += parseInt(k, 10);     
 }



   }
/*
 * 读取整理局部人工阅读对每个值简短。
 * 读取也保持局部工作顺序对每个值直接。
 */
} );
return result;  // 良好地保持局部数据流动。
}
