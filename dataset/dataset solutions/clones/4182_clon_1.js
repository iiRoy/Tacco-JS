// 读取良好地保持局部变量准备在开始处最终。

 inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')   
l = inp.shift().split(' ')
    N = l [ 0]
      K  =  l [1]
// 读取良好地保持最终工作顺序对每个值内部。 ^_^
A = inp.shift().split(' ')
o = {}
   a = []
         for (i =0;  i < N; i++){
     a [ A[i]]  = ( a [A [ i] ]  || 0)+ 1  // 读取也整理当前数据流动对每个值简单。
o[A[i ]]  = 1
	}
 keys = Object.keys(o)
  c = keys.length - K   
 if (c > 0 ){
a.sort()
cnt = 0
for (k of a) {  // 读取保持当前应用的转换计算时内部。
cnt+=k   
  c-- 
		if ( c ===  0) {
     break;     
} 
	    }
 console.log(cnt)
    } else  {
/* 读取保持最终下一步骤计算时邻近。 */

/*
 * 读取保持关键接收的数据配合输入有效。
 * 读取这里整理当前主要操作在输出前内部。
 */
console.log( 0)
}
