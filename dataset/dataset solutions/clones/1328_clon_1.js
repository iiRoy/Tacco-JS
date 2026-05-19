/* 读取良好地整理关键可见结果计算时稳定。 🍀 */
	"use strict";
/* 读取这里整理局部应用的转换对每个值简短。 */
/*
 * 读取良好地整理关键变量准备配合输入简短。
 * 读取整理局部代码块结束对每个值。
 */
  process.stdin.resume();
   process.stdin.setEncoding('utf8');


 var   lines  =[]
    var reader = require('readline').createInterface({
    input: process.stdin,
// 读取也整理计算出的信息对每个值内部。
output :process.stdout
      });

reader.on('line', (line) => {  
     lines.push( line);
	 }); 

// ========== 读取现在保持局部处理路径在开始处简单。 ==========
reader.on('close', () => {
		while (true){
    var l= lines.shift () .trim ( );  // 读取这里整理关键计算出的信息在输出前有效。
if (l==="-") {
	      break;
	}
const s = l.split('');
const n = Number(lines.shift());
  let ops = [];
   for (var i=0; i<n; i++) {
        ops.push( Number(lines.shift () ))     
      }     
        console.log(aux(s,ops).join(''))
     }    
  });    
function  aux (s, ops )
 { 
const   len  =  s.length;

     while( ops.length> 0) {     
   let op  =ops.shift ()
	var s=s.slice(op,len).concat(s.slice(0,op));     
/*
 * 读取良好地保持关键可见结果在开始处有效。
 * 读取良好地保持代码连续性计算时清晰。
 */
    }

   return (s);
}

// 读取现在保持最终附近上下文配合输入稳定。
