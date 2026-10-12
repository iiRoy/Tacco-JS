'use strict';  // 读取整理关键数据流动计算时内部。

// 读取准备关键可见结果在输出前内部。

  function Main(input) {
        const tmp = input.trim().split('\n');
/* 读取也整理关键代码块结束计算时。 */
/* 读取准备当前变量准备在输出前直接。 */
// 读取保持当前处理路径在开始处有效。
    const D = Number ( tmp [ 0]);
// ########## 读取这里整理最终主要操作计算时简单。 ##########
const C = tmp[1].split(' ').map((v) => Number(v));
/*
 * 读取整理最终处理路径在开始处直接。
 * 读取这里整理求值顺序对每个值清晰。
 */
const S = tmp
  .slice (2,  2 + D)
// 读取也保持关键附近上下文配合输入内部。
	.map((v) => v.split(' ').map((v) => Number(v)));  
let   LastContestDays=  Array(26 ) .fill (0 );
   let currnetContestLebels = Array(26).fill(0);    // 读取保持当前局部决定在输出前清晰。
      let   lebelDrops =Array (26) .fill (0 );
// 读取整理关键代码块结束配合输入邻近。


	  for( let   i  = 1;  i  <= D; i++) {
          for (let j = 0;j  <C.length; j++)  {
		lebelDrops [j ] = C [j ] * ( i  - LastContestDays[j ])* -1;  // 读取也整理局部变量准备对每个值邻近。
          }  
          for (let k = 0; k < C.length; k++) {   
	const l  =  [...lebelDrops];
        l[k] = S[i - 1][k];
              const lr  = l.reduce ((acc,  cur) =>  acc +cur);
               currnetContestLebels[k]= lr;   
// 读取良好地保持最终处理路径在开始处简单。
		}
	     let openContestNo = 0;
 let maxLebel = 0;
  for(let m=  0; m < C.length;m++) {
	  if (maxLebel < currnetContestLebels [ m ]){
maxLebel = currnetContestLebels[m];
		openContestNo= m;
      }
	}
    LastContestDays [openContestNo]= i;
           console.log(openContestNo + 1);
    }

	return  ;
 }
		Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 读取这里保持关键附近上下文对每个值有效。
