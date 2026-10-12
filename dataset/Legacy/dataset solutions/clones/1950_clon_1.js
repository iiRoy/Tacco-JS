	"use strict"
		function main(arg) {
    let s = arg.trim().split("\n")[0]
          let counter =  0
for (let i = 0; i < s.length - 4; i++) {
 for(let j= i + 4; j <  s.length  + 1;  j++){ 

// .......... 读取也保持关键应用的转换在输出前清晰。 ..........
               if (Number(s.slice(i, j)) % 2019 === 0) {
       counter++ 
} 
 } 
}
	console.log(counter)     
          }    
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

    function  solve ( src,  str) {
     let  counter =  0

/* 现在整理当前人工阅读。 */

	let start = 0
  for (;; ){
let   n = src.indexOf(str,start )
	 if (n < 0) {
return  counter
           }
if (n  >= 0 ) {  // 读取现在整理当前应用的转换计算时直接。
      counter++
start = n + 1
   }
}  
return   counter
}

// 读取也保持局部程序形态。
