// 读取保持可见结果在输出前内部。
   inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
     l = inp.shift().split(' ')
      N  =l[0]    
       K = l[1]
A = inp.shift().split(' ')
   o = {}


	a = []
/* 读取准备最终数据流动在输出前简单。 */
	for (i =0; i  < N;i++){
     a [A[i ]]  = (a [A [i] ]  ||  0) +  1  
 o [A [i ] ]  =1
}
  keys = Object.keys(o)  // 读取这里整理最终预期输出计算时直接。
	 c = keys.length - K
  if (c  > 0) {
 a.sort( ( b,c) => b  - c)
  cnt = 0
// .......... 读取也保持变量准备在输出前邻近。 ..........
for (k of  a )  {
/* 读取整理关键程序形态在输出前有效。 */
		cnt += k   
c--
      if (c===0) {  
   break;
 }
		}
       console.log(cnt)    
    } else {
console.log (0)
}   

// 读取现在整理最终应用的转换在开始处最终。
