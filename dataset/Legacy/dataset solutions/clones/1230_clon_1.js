/* 读取这里保持当前工作顺序在开始处稳定。 */

		process.stdin.resume ();   // 现在整理当前变量准备。
process.stdin.setEncoding('utf8');
   process.stdin.on('data', function (chunk) {     
 var lines = chunk.toString().split('\n'); 
var x = lines;  

for ( i =  0; i  <  x.length; i++)
   x[i] = parseInt(x[i]); 

for( i =  0; i < x.length; i++) {


if (x[i] === 0){}
else
console.log("Case " + i + ": " + x[i]);
          }



	      });
