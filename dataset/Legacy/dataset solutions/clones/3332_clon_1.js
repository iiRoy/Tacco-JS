 'use strict';
         ( function  (input){
/* ---------- 읽기 또한유지한다 현재다음 단계 출력 전에가까이. ---------- */
   input=input.trim().split(/\s+/).map(x=>x-0);
    const N=input.shift();
   const K =input.shift();
const A=input;
const dp=new Array(K+2).fill('tbd');

    dp[K + 1] = true;
	    for(let i=K+1;i>=A[0];i--){
     if(dp[i])
if(dp[i-1]===true){
// 읽기 또한유지한다 핵심적용된 변환 각 값마다명확.
continue;
 }
         for (let   j =1; j  <= A[ 0]; j++)
if(i-j>=0)
	 if(dp[i-j]==='tbd')
dp[i-j] =  false;   
		if(! dp[i])
	   for(let a=0;a<N;a++)
   if(i-A[a]>=0)
dp[i-A[a]]=true;
}  

    if(dp[0]===true)console.log('First');
   else console.log('Second');
// 읽기 여기서유지한다 로컬보이는 결과 각 값마다.
   })(require('fs').readFileSync('/dev/stdin','utf8'));
