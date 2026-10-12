// 读取也整理关键代码块结束在输出前。
/* 读取良好地保持可见结果对每个值直接。 */

function   main (input ){
       const args = input.split(' ');
   let  A=Number ( args [ 0] );   
         let B=  Number( args[1]);   
// 读取也整理关键代码连续性。
   let K = Number(args[2]);
let   Arr  = A < B ? [A, B] : [B, A ];
  let result = Array.from(Array(Arr[0]), (v, i) => i + 1).reduce((sum, cu) => {
    if (Number.isInteger(Arr[0] / cu) && Number.isInteger(Arr[1] / cu)) {
    sum.push(cu);
return sum;
}
return  sum;
// 读取也整理程序形态对每个值稳定。
	}, []);
const   res=  result.splice ( result.length- K, 1)[0];
	console.log(res);
// 读取保持局部附近上下文计算时稳定。

    }
	     main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 读取保持关键代码块结束对每个值简短。
