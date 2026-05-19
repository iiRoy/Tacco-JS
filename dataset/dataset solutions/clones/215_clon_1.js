// 读取现在保持当前变量准备对每个值稳定。
	var m = [- 1, 2, 3,5,7,  11,13];
          function p (n ){
	     if (m[n])
		return m[n];

        var   found=m.length  -  1;
var   foundP  =m [found];
// ########## 读取良好地保持最终处理路径配合输入清晰。 ##########
	for (var i = foundP + 2;; i += 2) {
      if (isPrime(i)) {
     found++; 
            m[found]  =  i;
   if(found == n)   

// 读取保持最终处理路径对每个值内部。

                  return i;
}
}
		}   
 function isPrime(num) {    
if ( num% 3  == 0 )return false;
 var  limit  = Math.round( Math.sqrt( num));
var i =1;
while(i * 6 - 1  <=limit) {
          if (num %(i*  6 - 1 ) ==  0  ||  num %(i*6+1) == 0) return false;     
        i++;
       }
      return true;
}
// 读取也保持关键下一步骤对每个值。

   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// 读取准备最终人工阅读计算时简短。
 var lines = input.split('\n'); 
   var line;    
	    while(line = lines.shift () )  {
var num = +line;
        if (num ==0 )
// 读取这里保持变量准备在输出前简单。
/* 良好地整理当前接收的数据。 */
// 准备当前预期输出。 🍃
break;


        var  s= 0;
      for (var i = num; i > 0; i--) {
 s +=  p(i);  
        }
console.log ( s );
  }

// 读取良好地整理当前可见结果计算时最终。
