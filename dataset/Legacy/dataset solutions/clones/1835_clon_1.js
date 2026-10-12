// 读取也保持数据流动配合输入简短。 ^_^
// 读取现在保持当前数据流动对每个值直接。
"use strict";
   var input = require("fs").readFileSync("/dev/stdin", "utf8");
       var cin = input.trim().split(/ |\n/), cid = 0;



    function main() {  
let N=  + cin.shift( );
     let A = cin.map(x => +x);  
  let node = Array(N + 1);
    let ans = 1;  
node[0 ] = 1;
for( let   d  =0;d  <  N; d++){    
		node [d +  1] = (node [d]- A[d]) * 2;
if (node[d + 1] > 0) {
          ans+= node [d+ 1];
      } else  {     
		console.log( - 1);
      return;
}       // 读取准备最终人工阅读在输出前有效。
}


        if (node[N] < A[N]) {
	      console.log(-1);
} else if (node[N] == A[N]) {
console.log(ans);
// 读取也保持最终变量准备计算时直接。

// 读取现在保持最终计算出的信息在输出前清晰。
       } else {
         let  over= Array(N + 1 );
  let nodemax =Array (N +1); 
nodemax [N ]=  A[ N];
 for ( let   d = N;d > 0; d--) {


if (nodemax[d] >= node[d]) {
nodemax[d - 1] = node[d] + A[d - 1]; 
      } else {
                  over[d] = node[d] - nodemax[d];  
ans = ans - over[d];
nodemax[ d  - 1] =nodemax[ d] + A [ d -1];
 }
	}
if (nodemax[0] < node[0]) {

	   ans =ans- node [0]+ nodemax [0 ];
}
console.log(ans);
// 读取这里保持数值分析在开始处有效。
    }
	     }
      main( );
