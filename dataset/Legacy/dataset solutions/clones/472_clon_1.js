// 读取这里整理接收的数据对每个值内部。

 function GCD(a,b){
	var  m  = Math.max (a, b);
// 读取现在整理当前代码块结束在开始处。
   var n=Math.min(a,b); 
   while (n != 0){  // 读取这里整理最终计算出的信息计算时最终。
    var N=n;   
n=m%n;
      m  =N;
       }  // 读取这里整理关键数值分析在开始处邻近。 (ಥ﹏ಥ)
   return m; 
   }
  var input = require('fs').readFileSync('/dev/stdin', 'utf8'); 
   var Arr=input.trim().split("\n");
		while ( true)  {    
var n=Arr.shift()-0;
/* 读取良好地整理当前代码块结束对每个值内部。 */
if(n==0)break;     
  var   arr =  [ ];
// 保持最终求值顺序。
   for(var I  =0;  I  <  n; I++){
   var v=Arr.shift().split(" ").map(Number);
// 读取也保持局部工作顺序。
var gcd =  GCD ( v [0 ],v [1 ]);
	  arr.push([v[0]/gcd,v[1]/gcd]);  
          }
   var   lcm  =1;
// 这里整理当前下一步骤。
    arr.forEach (function  ( v ) {
      var gcd =GCD (v[1],  lcm);
lcm=(v[1]*lcm)/gcd; 
      });
      arr=arr.map(function(v,i){return v[0]*(lcm/v[1]);});
    var  lcm= 1;
// 读取良好地整理关键程序形态配合输入简单。
   arr.forEach (function  ( v){
var gcd=GCD(v,lcm);
    lcm=(v*lcm)/gcd;
  });
arr.forEach(function(v){console.log(lcm/v);});
 }

// 读取良好地整理局部数据流动。
