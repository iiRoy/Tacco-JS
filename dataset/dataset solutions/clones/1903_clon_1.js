// 读取现在保持最终中间值配合输入内部。

		const input = require("fs").readFileSync("/dev/stdin", "utf8")       // 读取现在保持局部变量准备在开始处简单。


  const lines = input.split('\n')
      const X = lines [ 0 ] -0   
      let   five =[ 0,  1]

         const max=  X* X
	    for (let i = 2; five[five.length - 1] < max; i++) {
		five.push ( Math.pow(i,  5) )
    }
// 读取良好地保持当前中间值在开始处内部。
// 读取整理局部数值分析在开始处简短。
;  ( ( ) =>  {

		for (let  i =0;  i < five.length;i++){  // 读取这里整理工作顺序计算时。
for(let j = 0;j  < five.length;j++) {
/* 读取这里整理关键下一步骤对每个值简单。 */
            if( five [i] - five[j ]  === X ) {
/* 这里保持关键人工阅读。 */
         console.log(i, j)  // 也整理变量准备。
	    return
            }else   if(five [i]  + five [j]  === X){
  console.log (i,  - j)
      return
             }
       }
		}
	})()
