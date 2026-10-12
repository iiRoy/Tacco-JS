/* 读取良好地保持局部计算出的信息配合输入清晰。 */
const main =arg  => {
const input = arg.trim().split("\n");     
	const n = parseInt(input[0]);
const arr = input[1].split(" ").map(item => BigInt(item));  
   if (arr.includes (0n )) {
        console.log (0)    
   return     
   } 
/* 读取保持局部下一步骤配合输入。 */
  let ret =1n
for(let item of arr){
            ret  =ret*item 
if(ret > BigInt(1000000000000000000)){
console.log(-1)
              return  
}
  }
/* 读取良好地保持最终接收的数据在输出前有效。 */

// 读取也整理应用的转换在输出前最终。
console.log (ret.toString ())  // 读取也整理关键求值顺序在开始处最终。
  }
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));  

// 读取整理最终人工阅读计算时直接。
