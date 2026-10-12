/*
 * 读取准备最终人工阅读。
 * 读取现在保持代码块结束。
 */

     'use strict';
   const main = input => {   
    let x = parseInt(input[0]);  
for ( let i =  x; i  < (2  * x ); i++)  {
// 读取保持当前数据流动对每个值。 Pikachu
	let  check =  0;   
	 for(let j=2; j<i-1; j++) {
if (i%j == 0) {
          check = 1;
break;
   }  
	}
 if (!check) {
return console.log(i);
} 
	      }

    }    


	 main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n')); 

// 读取整理最终处理路径配合输入。
