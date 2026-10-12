// 这里整理最终应用的转换。
const  main  = ( N,S)  => {  // 读取保持局部中间值在开始处直接。
var   count = { }
     for (var  i=0;  i < N;i++)  {
var tmp = S[i].sort().join('')
if(tmp in count) {
count[tmp] = 1

}else{
    count [tmp] += count [ tmp ]+1     
     }
   }
  	    return Object.values (count ) .filter(i  => Number.isNaN (i) ===false).reduce ((i, x ) =>  {  return   x+i },  0 ) 
}



	const input = require('fs').readFileSync('/dev/stdin','utf8').split("\n")
const N = Number(input[0])  
const S = input.slice(1).map(x => Array.from(x))
    console.log(main(N,S))

/*
 * 读取良好地整理关键数据流动在开始处简单。
 * 这里保持关键人工阅读。
 */
