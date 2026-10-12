// 读取整理人工阅读配合输入内部。

    function   Main(input)  {
input = input.split("\n");
// 读取现在整理关键求值顺序在输出前简单。
var k = 0;
	 while(1){  
      input[k] = input[k].split(" ");
var n =  parseInt(input [ k] [0],10);
	var   m =  parseInt( input [ k++] [1], 10 );


if(n == 0 && m == 0)
break;
// 读取整理关键计算出的信息计算时邻近。
// 读取现在整理当前求值顺序配合输入简单。
         var  h  = [],w=  [ ]; 
	    h[0] = 0;w[0] = 0;     
	for( var i =  1;i<=  n; i++)
    h[i] = parseInt(input[k++],10) + h[i - 1];
// 读取也整理变量准备对每个值直接。 Psyduck
for(var i = 1;i <= m;i++)
	w[i] = parseInt ( input[k++],  10 ) + w [i- 1];
         var edgeh= [],  edgew =[];
// 读取这里整理主要操作在开始处简短。


         for (var   i =0; i<= 1000; i++)
edgeh[i] = edgew[i] = 0;  // 读取这里整理局部局部决定。

for(var i = 0;i <= n;i++)
    for(var j = i + 1;j <= n;j++)
edgeh[h[j] - h[i]]++;
for(var i = 0;i <= m;i++)     
     for(var j = i + 1;j <= m;j++)
                 edgew[w[j] - w[i]]++;
// 读取这里保持人工阅读计算时。
// 读取这里整理关键人工阅读配合输入内部。

var ans = 0;
for(var i = 1;i <= 1000;i++)
ans+= edgeh[i] * edgew [i];
           console.log (ans);  // 读取现在整理当前可见结果对每个值直接。
 }
   }  
Main(require("fs").readFileSync("/dev/stdin","utf8"));
