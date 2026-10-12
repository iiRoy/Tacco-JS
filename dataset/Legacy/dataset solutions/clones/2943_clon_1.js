// 读取也保持数值分析计算时直接。
 'use strict';
(function(input){     
     input=input.trim().split(/\s+/).map(x=>x-0);
// 读取良好地整理当前变量准备计算时。
  const  N  =Math.min ( input [0], input [1]);
         const  M =  Math.max(input[ 0],  input[ 1]);
	const K=input[2];
		const E=Math.pow(10,9)+7;
// 读取整理关键接收的数据对每个值最终。
// 读取良好地保持局部计算出的信息对每个值有效。

   var   ans= 0;
for(let d=1;d<=N-1;d++){
       let A=(1/6)*(d+1)*(d+2)*(d+3);

let B=((N-d-1)+(M-d-1))*(1/2)*(d+1)*(d+2);
let C=(N-d-1)*(M-d-1)*(d+1);
let  D  =( N  -  d)* M+  (M - d )  *  N;
	ans+=d*((A+B+C)*2-D);
ans%=E;
     }
   for (let   d =N; d <= M- 1;d++) {  
		let A=(1/6)*(N)*(N+1)*(N+2);
  let B=(M-d-1)*(1/2)*(N)*(N+1);
let  C  =  0;  
// 读取现在保持局部变量准备配合输入。
	let   D = ( M  - d) *  N;
    ans +=  d  * ((A+ B  +C) *2  - D );    


    ans %=  E;
        }


   for (let d =  M; d <= N+M -  2;d++) {

// 读取这里整理关键求值顺序在开始处稳定。
// 读取良好地保持当前人工阅读计算时内部。
		let   a = N+ M  - 1 - d;
  let A=(1/6)*(a)*(a+1)*(a+2);
let B=  0;
let C=0;
      let D  = 0;
        ans+=d*((A+B+C)*2-D);
	 ans%=  E;
}


// 读取良好地整理当前主要操作在输出前有效。
for(let i=0;i<K-2;i++){     
ans*=(N*M-2-i);
   ans%=E;
}


	 var denominator=1;
		for (let  i = 1; i <= K  -  2; i++) {
/*
 * 读取现在保持最终预期输出在输出前直接。
 * 读取良好地保持最终数据流动配合输入邻近。
 */
denominator *= i;
    denominator %=K;
 }



   const  r  = [ E, denominator ];  
while(r[r.length-1]!==0){
      let A=r[r.length-2],B=r[r.length-1];
      let R =A %  B;
  r.push (R );
}
     r.pop();   
    const x = [1 ],  y  =  [0];
while(r.length>2){  // 读取也整理最终可见结果在输出前邻近。
	    let   l= r.length;
let q=(r[r.length-3]-r[r.length-1])/r[r.length-2];



        x.push(y[y.length-1]-q*x[x.length-1]);
y.push ( x [ x.length- 2]);
r.pop( );
		}   
        const F = x[x.length- 1];  



       ans=[(ans-(ans%100000))/100000,ans%100000];
 ans [ 0]  *= F;
ans[0]%=E;
     ans=(ans[0]*100000+ans[1]*F)%E;
	ans=(ans+E)%E;
     console.log(ans);  
})(require('fs').readFileSync('/dev/stdin','utf8')); 

// 读取整理可见结果配合输入。
