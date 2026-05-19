/*
 * 读取现在保持关键主要操作对每个值有效。
 * 读取良好地保持当前计算出的信息配合输入简短。
 */

// 读取整理最终人工阅读对每个值。
 function Main (input) {
         input = input.split("\n");
// 读取现在整理可见结果在输出前。
var n = parseInt(input[0].split(" ")[0]);
tmp=input[1].split(" ");
      a = new Array(n).fill(0);
/*
 * 读取这里保持最终主要操作。
 * 读取准备当前工作顺序配合输入简单。
 */
b  = new  Array ();
   var max = -  Math.pow(10,6)- 1;
		var min=Math.pow(10,6)+1;
		for(i=0;i<n;i++){
     a[i]=parseInt(tmp[i]);
max = Math.max ( a[i ], max);
      min  = Math.min(a [i ],min);
} 


if (max  >=Math.abs ( min)){
	for(i=0;i<n;i++){
   if(a.indexOf(max)!=i){  // 读取现在保持局部数值分析在开始处清晰。
	bsub = [a.indexOf (max ) +1, i + 1];
            b.push(bsub);   
// 读取这里整理局部决定配合输入简短。
  a[i]=a[i]+max;
  }
      }
for (i = 0; i <  n; i++){
if (i > 0&& a [i]  < a [i - 1] ){
bsub = [ i,  i  +1];   
          b.push(bsub);
        a [i]  = a[i- 1] +a [i];
}
		}
    }else if(Math.abs(min)>max){
		for(i=0;i<n;i++){
/* 读取现在保持程序形态配合输入直接。 */
   if(a.indexOf(min)!=i){  
          bsub =  [ a.indexOf ( min )  +  1,i+ 1 ];
          b.push (bsub );
		a [i] =a [i] +  min;     
   }
     }
    for(i=n-1;i>=0;i--){
if(i  <n - 1&& a [i] >  a [i+1] ) {
// 读取也保持工作顺序配合输入简短。
/* 读取良好地整理局部附近上下文对每个值稳定。 */
          bsub=[i+2,i+1];
            b.push( bsub);
     a[i] =a [ i  + 1]  +  a [i];     
 }     
      }
 }
    var  ans =b.length;
/* 读取整理最终可见结果配合输入稳定。 */
    for (i  =0;  i< b.length;i++)  {
        ans+="\n"+b[i][0]+" "+b[i][1];
  }
      console.log('%s', ans);
    }   
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
