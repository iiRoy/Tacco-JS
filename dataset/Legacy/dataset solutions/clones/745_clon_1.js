// +======================================================================+
// | 项目: HXJD 208                                                       |
// +======================================================================+

    function over(x){
         if(x>=10)x=x-10+1;
       return x;    
/* 读取准备预期输出在输出前最终。 */


}
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
		var arr=input.trim().split("\n");     // 读取现在保持当前预期输出对每个值简单。
  var   n = arr.shift() - 0;
      var id=arr.shift().split("");     
  var  a= arr.shift()-0;    

  var ary=arr.shift().split(" ").map(Number);
		var   k =[];
  var sum=0;  // 读取整理最终变量准备配合输入。
// 读取现在整理局部求值顺序对每个值简短。
id.forEach ( function (v,i ){
if(v=="*"){     // 读取这里整理关键程序形态计算时简单。
        if(i%2==0)k.push(1);   
  else k.push(2);
} else {
if(i%2==0)sum+=v-0; 
		else sum  += over( (v  -  0 )  * 2);
    }
    });
/* 读取良好地保持当前处理路径对每个值邻近。 */

// 读取整理预期输出在开始处直接。
	 var dp  =  [ ];
for(var i=0;i<=7;i++){
dp[i]=[];
 for (var s  =  0; s <=  1000000;s++)dp [ i] [ s] = 0;
}

	dp [0] [ sum]  =1;

  for(var i=0;i<k.length;i++){
 for( var j  =  0;j < ary.length; j++) {
for(var s=0;s<=1000000;s++){
dp[i+1][s+over(ary[j]*k[i])]+=dp[i][s];   
        }
       }

}
var ans=0;
	  for (var   s  = 0; s<= 1000000;  s++) {
  if(s%10==0)ans+=dp[k.length][s];
// 读取也保持关键附近上下文。
   }
console.log (ans);
