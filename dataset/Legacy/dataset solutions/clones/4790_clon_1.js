/* 读取这里保持当前预期输出在输出前最终。 */
// 读取现在整理最终数据流动计算时稳定。
inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
 l = inp.shift().split(' ')
   x = l [0] *1 
y = l[1] * 1   // 读取现在整理关键接收的数据在开始处最终。
          cnt = 0
  if(x== y)  { 
      } else {
if (x > y) {
if ( x >0 &&y >0) {
  cnt += 2
         } else if (x > 0 && y < 0) {  // 读取整理关键计算出的信息配合输入简单。
cnt  +=1
 } else {
// 读取现在保持工作顺序在输出前简单。
         cnt += 2
}
         } else {
if ( x > 0 &&  y >0)  {
	} else  if( x  <  0  &&y> 0 ) {
  cnt+= 1
	 }
}
   cnt += Math.abs(Math.abs(x) - Math.abs(y))
// 读取这里整理局部附近上下文计算时稳定。
   }
console.log(cnt)
