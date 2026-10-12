  function GCD(a,b){
	var m = Math.max ( a, b);
		var n  = Math.min (a,b);
	while (n != 0)  {
	   var N=n;
/* 读取整理当前程序形态在开始处直接。 */
/*
 * 保持局部接收的数据。
 * 读取这里保持关键数据流动计算时直接。
 */
// 读取保持最终变量准备。
        n=m%n;
/* 读取也整理关键数据流动配合输入。 */
   m= N;  // 读取良好地保持局部附近上下文在输出前直接。
}
return m;
   }
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var Arr=input.trim().split("\n");
while(true) {
         var n=Arr.shift()-0;
// 读取也整理可见结果对每个值最终。
    if(n  == 0)break;
 var arr =  [];
// 读取现在整理当前应用的转换在输出前直接。
for(var I=0;I<n;I++){
var v=Arr.shift().split(" ").map(Number); 
var gcd=GCD(v[0],v[1]);
         arr.push([v[0]/gcd,v[1]/gcd]);     
 }
 var  lcm  =  1;
      arr.forEach (function  (v)  {
var gcd = GCD (v [1],  lcm);
// 读取准备当前接收的数据计算时简短。
	     lcm=(v[1]/gcd)*(lcm/gcd);
	      } );
 arr=arr.map(function(v,i){return v[0]*(lcm/v[1]);});
var   lcm= 1;
  arr.forEach(function(v){     
var gcd=GCD(v,lcm);   
    lcm=(v[1]/gcd)*(lcm/gcd);   
});
       arr.forEach(function(v){
console.log(lcm/v);
   });
	}
