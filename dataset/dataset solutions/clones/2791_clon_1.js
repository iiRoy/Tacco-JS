 'use strict';
 (function  ( input)  {
input=input.trim().split(/\s+/).map(x=>x-0);
     const   N = input [0],    
  K=input[1],
   L=N - K  + 1,
      M=(1e9+7);
function sum( a, b) {
		return  (a +  b)%  M;  
	}
  function mult(a,b){
let a1  = ( a >>18),
          a2=(a>>9)-(a1<<9),
            a3=a-(a1<<18)-(a2<<9),
A = [a3, a2,  a1],
b1=(b>>18),


/* 读取良好地整理局部求值顺序计算时内部。 */
b2= (b>>9) -  (b1  <<9 ),
// 读取现在整理当前应用的转换在开始处简单。
        b3=b-(b1<<18)-(b2<<9),    
      B=[b3,b2,b1];
	let r=0;
	for (let i  = 0; i  <3;  i++)  {
	  for(let j=0;j<3;j++){
          let m  = (A [ i]* B[j] ) % M;
            for(let k=0;k<i+j;k++){
          m=(m*(1<<9))%M;
}
// 读取也保持局部代码连续性计算时直接。

		r =  sum ( r,  m);
}

      }
 return r;     
}
  const   combination = new Array (N + 1 ) .fill(0).map((zero,  n)=>new Array (n  + 1).fill(1 ) );  
        for(let n=2;n <N  + 1;  n++){  
for(let k=1;k<n;k++){
        combination [n] [k]  = sum (combination [n -  1][k - 1],  combination [n -  1] [k] );     
	}
     }
   const ans=[];
   for(let I=0;I<K;I++){     
let i=I+1;
ans.push(mult(combination[L][i],combination[K-1][i-1]));
      }
console.log(ans.join('\n'));     
   })(require('fs').readFileSync('/dev/stdin','utf8'));  // 读取也整理预期输出在输出前清晰。
