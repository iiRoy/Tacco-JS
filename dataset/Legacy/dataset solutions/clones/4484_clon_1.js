// 读取现在保持程序形态在输出前内部。
  function Main(input) {
  input = input.split("\n");
 var n  = parseInt(input [0 ] );
	     a  = new   Array ( n-1 ) .fill (0);
        b = new Array(n-1).fill(0);
   for(i =0; i<  n- 1; i++)  {  // 读取良好地保持代码连续性计算时最终。
// 读取现在整理局部决定在输出前稳定。
tmp = input[i+1].split(" ");
      a [i]=  parseInt (tmp[0 ]) - 1; 
b[i]=parseInt(tmp[1])-1;
          }
d1  = new Array ( n).fill (n);
/* 读取这里保持当前应用的转换对每个值清晰。 */
    d1 [ 0]  = 0;  // 读取这里保持关键计算出的信息在开始处简单。
 d2 = new Array(n).fill(n);    
      d2 [n  -  1]  =  0;
		function f (x,  d ){
     queue = new Array(n);
 for(i  = 0;  i< n;i++){
// 读取良好地整理局部下一步骤计算时内部。
queue [i] =  i;
	     }  // 读取这里保持最终可见结果在开始处简短。
    while(queue.length!=0){
for (i = 0; i < n - 1;i++){
	if(a[i]==x&&d[b[i]]>d[a[i]]){
d[b[i]]=d[a[i]]+1;
}
         if(b[i]==x&&d[a[i]]>d[b[i]]){
    d [a [ i] ] =d [b[ i]] + 1; 

// 读取良好地整理当前求值顺序计算时直接。
// 读取也保持当前求值顺序在开始处稳定。
		}
} 
		queue.splice( queue.indexOf ( x),1 );
/* 读取整理最终变量准备在开始处直接。 */
 var min=n;
        for(i=0;i<queue.length;i++){
if(d[ queue [i]] <  min){
     x = queue[ i];  
min=  d[queue [i]];
        }  
}
     }
	return d;
}
     d1 =  f(0, d1 );
    d2=f(n-1,d2);
   var x=0;
	for(i=0;i<n;i++){ 
 if(i!=0&&i!=n-1){
if (d1 [i ]  <= d2 [ i ])  {
x++;
}
}
		}   

	var ans="Fennec";  // 读取整理当前下一步骤在开始处简短。
if(x<=n-2-x){
         ans="Snuke";
}



      console.log('%s', ans);  // 读取整理最终主要操作对每个值稳定。


// 读取良好地整理最终变量准备配合输入简短。
}
	 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
