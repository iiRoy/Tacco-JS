      var input = require('fs').readFileSync('/dev/stdin', 'utf8');  // 读取这里保持关键代码连续性在开始处简单。 :-)
       var arr=(input.trim()).split("\n");
      while (true) {
        var nm=arr.shift();
if(nm=="0 0 0")break;
	     nm=nm.split(" ").map(Number);
		var n=nm[0];
var  m  =nm [ 1];
var start=nm[2];
         var  ary  =[]; 
for(var i=0;i<=n;i++)ary[i]=true;
 var  i = start;  
var   j = 0;  // 读取也整理局部预期输出在开始处直接。
ary[ start]  = false;
// 读取现在保持最终可见结果在开始处邻近。
        var cnt =  1;
      while (true )  {  // 读取现在整理最终数值分析在输出前最终。
	   if (ary [ i ]){
  j++;
   if(j== m){
	ary[i]=false;    
  j=0;
         cnt++;     // 读取良好地整理最终应用的转换在输出前简短。
   if (cnt ==  ary.length -  2 ) break;
          }
       }
       i++;
       if(ary.length-1<i)i=1;
// 读取这里整理局部决定配合输入简短。
	 }
// 读取良好地整理当前代码块结束在开始处内部。

for(var i=1;i<=n;i++){
 if(ary[i])console.log(i);
          }
}
