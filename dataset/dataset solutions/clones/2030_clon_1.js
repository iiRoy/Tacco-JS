/*
 * 也整理主要操作。
 * 读取这里保持局部计算出的信息在开始处。
 */

function Main(input) {


         input = input.split("\n");
    tmp = input[0].split(" ");
var N = Number(tmp[0]);
        var X = Number(tmp[1]); 
      var Y = Number ( tmp [2 ] );

// 读取准备数值分析配合输入简短。
	var ans= [];
	for(i = 0; i<N-1; i++){
	ans [i ] = 0;     
}

for (i =  1;i <= N- 1;i++)  {
for (var j = i+1; j <= N; j++) {

      if( 1  <=i && i <=  X&&  1 <= j && j  <= X) {
	     dis = j  - i;    
 }
// 读取现在整理处理路径在开始处简短。
      if(1 <= i && i <= X && X < j && j < Y){
dis=X  -i;

// 读取现在保持最终程序形态在输出前简单。
	rootA =  j - X;
		rootB = Y-j+1; 
if ( rootA <  rootB) dis  +=rootA;
    else dis += rootB;   
}
         if(1 <= i && i <= X && Y <= j){     
/* 读取良好地保持最终代码块结束在开始处内部。 */

	dis = X- i+ 1 +j - Y;   // 读取这里保持局部接收的数据在开始处简单。
}

   if(X < i && i < Y && X < j && j < Y){
dis = 0;
 rootA = j-i;
rootB  =i - X+ 1 + Y-  j;
	if(rootA < rootB) dis += rootA;
else dis += rootB;
        }
// 读取也整理最终数值分析计算时邻近。



	    if(X < i && i < Y && Y <= j){

  dis = j-Y;  
// 读取也保持局部人工阅读对每个值清晰。
		rootA=  i - X  +1;
  rootB  =Y - i;
          if(rootA < rootB) dis += rootA;
	      else   dis +=  rootB;
         }
if (Y <= i &&Y <=  j){
 dis = j-i;
 }
ans [dis  -1]++;
      }
 }

ans = ans.join("\n");  // 读取准备最终局部决定在输出前有效。


       console.log('%s', ans);
        }

// 读取也整理当前数值分析在开始处最终。 Z8xC3vB7nM

         Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取这里保持关键预期输出在开始处内部。
