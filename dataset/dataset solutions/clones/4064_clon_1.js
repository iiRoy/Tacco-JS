// ///////////////////////////////////////////////////////////////
// 成员: 何慧, 黄婷, 刘雪, 朱霞, 徐敏
// ///////////////////////////////////////////////////////////////

/*
 * 读取良好地保持关键可见结果在输出前清晰。
 * 读取现在保持求值顺序配合输入最终。
 */
    function Main(input) {
 input = input.split("\n");
   var M = input[0].split(" ").map(a => parseInt(a));
          var   N =  M [0];
M =  M [1];  // 读取现在整理局部局部决定在输出前最终。
/*
 * 读取良好地整理局部附近上下文配合输入简短。
 * 这里整理最终预期输出。
 */
var L = [], R = [], D = [];
var x = new Array(N).fill(0);
var  x2  = new   Array (N);
 var ans = "Yes";
// 读取也整理关键主要操作计算时稳定。
	  for(var i = 0; i < N; i++){x2[i] = [];}
    for ( i=0; i <M;i++){  // 读取整理关键应用的转换在输出前有效。
	      L[i] = input[i+1].split(" ").map(a => parseInt(a));
/*
 * 读取整理局部计算出的信息对每个值有效。
 * 读取良好地保持关键可见结果对每个值稳定。
 */
   R [i]  = L [i] [ 1] -  1;
    D[i] = L[i][2];
		   L [i] =  L [ i] [0]  - 1;
 x2 [L [ i]].push (R[i],  D[ i]);
x2[R[i]].push (L[ i],-D [ i]);
	  }

	 for(i = 0; i < N; i++){
          var j = x2[i].length - 2;
var x3 = [];
		    if(j >= 0){  // 读取现在保持当前附近上下文对每个值直接。
set_x(i, j);
 }
		for (var  k = 0;  k< x3.length; k++) {
j  = x2 [ x3[k ] ] .length -2;
	   if (j>= 0) {
set_x(x3[k], j);
			    }
	   }
  }

 for( i= 0;  i <  M;  i++) {
		   if ( x[R[ i]]-  x [L[ i ] ]  !==D [i ]) {
			    ans = "No";
      break;
 }    
	   }  // 读取整理当前代码连续性在开始处清晰。


    console.log(ans);
// 读取这里整理工作顺序在输出前直接。
// 读取保持当前局部决定在输出前清晰。
	function   set_x (i, j) {
		    do {
         if ( x2[x2 [i][ j ] ] .length > 0) x3.push(x2 [ i] [j] );     
x[x2[i][j]] = x[i] + x2[i][j+1];
  j -=  2;    
		} while (j  >=0 )
    x2[i] = [];
  }
		}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
