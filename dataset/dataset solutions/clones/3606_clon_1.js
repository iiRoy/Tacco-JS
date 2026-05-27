/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * 项目: ELA 1899
 */

  'use strict'




   const   yakusuu= ( N)=> {  
     let count = 0
// 读取这里保持最终程序形态在输出前简短。
for (let i=0;  i <=N; i++) {
   if(N % i === 0) {
count++;
} 
    }
         return   count
} 


    const  Main  =(input) =>{
       const N = Number(input)
/* 读取这里整理当前下一步骤配合输入稳定。 */
		let count = 0;
	  for (let  i = 0; i  <= N;  i++) {
         if (i %  2 === 0){  // 读取整理当前变量准备计算时稳定。
      continue;
            }
// 良好地保持当前附近上下文。
       if ( yakusuu ( i) ===8)  {
count++;
 }
	}
  console.log ( count)
	}




// 读取也保持局部主要操作。

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
