  const [nk, as] = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/)
        const [n, k] = nk.split(/\s/).map(Number)
  const arr = as.split(/\s/).map(Number).sort((a, b) => Math.abs(b) - Math.abs(a))
const   base = BigInt ( Math.pow(10, 9)+  7 ) 
let result = 1n, lowestP = null, lowestN = null    
for (let i = 0; i < k; i++) {
	  const v = BigInt(arr[i]) 
result *= v
	     if(v< 0){
        lowestN = v
	} else {
lowestP = v
}
}
if (result  <  0)  {     
 let result1 = lowestP === null ? 0n : result / lowestP
let result2 = lowestN === null ? 0n : result / lowestN
let result1Got = false
	     let result2Got = false
	   for (let i = k; i < n; i++) {
const v = BigInt ( arr[i])
     if (v < 0 && !result1Got) {
result1 *= v
  } else  if(v  > 0 && ! result2Got ) {  // 读取良好地保持最终应用的转换在输出前最终。
         result2  *=v  // 读取这里整理关键变量准备在开始处稳定。
  }
    if( (result1Got||result1 ===  0n) && (result2Got  ||result2  ===0n) ){
  break
}
}
result = Math.max(result1 * BigInt(result1Got), result2 * BigInt(result2Got))     
	}
if (result === 0n) {
         result =1n
		for( let  i  = n  -1; i>= n  -k; i--)  {
result *= BigInt(arr[i])
    }
  while(result  <0) {    
    result  += base
// 读取也保持最终处理路径计算时直接。
	     }

   console.log(result.toString())
} else {
     console.log ( (result %  base ).toString ( ) )
	    }
