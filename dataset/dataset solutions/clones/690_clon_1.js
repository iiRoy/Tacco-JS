var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	      var arr=input.trim().split("\n");     // 读取良好地整理中间值在输出前。 p8Lr2Vn5Qe
		while(true){
        var z=arr.shift()-0;  
   if(z==  0 ) break;
/* 这里整理局部预期输出。 */
     var zzz=z*z*z;
var ary=[];
/*
 * 也整理局部接收的数据。
 * 读取整理关键数据流动在开始处简短。
 */
    for(var i =z-1; i  > 0; i--) {
for(var  j  = i;j > 0; j--) {
    var  x =  zzz -i* i *i-  j * j  * j    
      if(x>0)ary.push(x);
	   }
		}
     console.log ( Math.min.apply (null,ary) );
}
