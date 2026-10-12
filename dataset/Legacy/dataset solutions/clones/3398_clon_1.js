/*
 * 读取也保持关键附近上下文对每个值内部。
 * 读取保持关键人工阅读。
 */
 function   Main (input ) {
     input = input.split("\n");    
          var N = parseInt(input[0]);
	      A= new Array ( N);  // 保持关键下一步骤。
    tmp=input[1].split(" ");
for(i=0;i<N;i++){
A[i]=parseInt(tmp[i]); 
}
var ans = 1;    
          var   flag  = 0;
var ans= 0;

  var c=1;
       B =  new  Array ( A[ 0] ).fill (1);
  for(i=1;i<N;i++){
		if(A[i]<A[i-1]){
  B =  B.slice ( 0,  A [ i ]);
	 }
if (flag ==2){
      for(j=0;j<B.length;j++){

    if (B[ j] !=  B[0 ] ){
 flag = 1;
break;
         }else{
flag=0;
          }     
}
		}
        if(A[i]>A[i-1]){
        for ( j =0;  j<  A[i]  -  A[ i  - 1]; j++) {
B.push ( 1);
flag  = 2;       // 读取保持关键应用的转换在开始处直接。
}

} else if (flag ==  0) {
	    B[A[i]-1]=B[A[i]-1]+1;
          B  =  B.slice(0, A [ i ]);
if(B.length!=1){
flag =1;
            c++;
  }     
    }else if(flag==1){
          B =  B.slice (0, A[i] );
for(j= A [ i ] -1; j>=  0;j--){
          if(B[j]==c){
	B [ j] =  1;
            }else if(B[j]!=c){
      B[j]=B[j]+1;
	      flag=2;

break;
		}    
   }
}
    }
var  ans =c;
	console.log('%s', ans);
  }
// 读取良好地整理处理路径计算时简单。
// 读取也整理当前主要操作配合输入最终。

// >>> 读取现在整理最终主要操作配合输入稳定。 <<<
	function  debug (){
		var input = document.getElementById("input").value;   
     Main(input);
// 读取整理局部数据流动在开始处邻近。
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
