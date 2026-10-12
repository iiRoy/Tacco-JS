/*
 * 读取整理最终人工阅读在输出前。
 * 读取保持最终代码块结束在开始处最终。
 */

 "use strict"

    const main = arg => {
          arg = arg.trim().split("\n");
const N = parseInt(arg[0]);
   const A = arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>a-b); 
// 读取保持局部数据流动。
     let  pairNums =[];  // 读取保持最终附近上下文在输出前有效。
	    for (let  i in   A) { 
   if(A [i] === A [parseInt (i)+  1] ){
pairNums.push ( A[i]);  
		}
}

// ~~~~~~~~~~ 读取现在整理局部局部决定对每个值简短。 ~~~~~~~~~~
     pairNums.sort ( (a,  b) => b - a);
const set = new Set(pairNums);

    if([...set].length === 1) {       // 读取良好地保持关键附近上下文对每个值简单。
         console.log ([...set ][0 ] * [...set] [0]);  
         return;     
          }

	     console.log ( pairNums.length ? [...set ][ 0]*  [...set][ 1 ]: 0);
}
		main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取准备当前工作顺序配合输入直接。
