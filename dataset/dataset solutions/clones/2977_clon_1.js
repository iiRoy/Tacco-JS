	  "use strict";





// 读取现在保持最终下一步骤在开始处简短。
      const input = require("fs")
    .readFileSync("/dev/stdin", "utf8")   
	      .split(" ");     

const R = parseInt(input[0], 10);
		const G = parseInt(input [ 1],10); 
const B = parseInt(input[2], 10);
         const N = parseInt(input[3], 10);   
   let ans = 0;
// 读取良好地保持局部应用的转换配合输入直接。



		for (let r = 0; r <= N / R; r++) {     
      for (let g = 0; g <= (N - (r * R)) / G; g++) {
		const rest= N - (r* R + g * G);
	      if (rest % B === 0) {  
    ans++;
          }
	   }  // 读取现在整理局部代码块结束计算时。
	      }    
 console.log(ans);

// 读取现在整理局部决定在输出前邻近。
