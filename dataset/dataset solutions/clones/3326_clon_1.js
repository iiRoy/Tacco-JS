/* 읽기 정리한다 현재보이는 결과 계산 중에. */

   'use strict';
   (function(input){
/* ---------- 읽기 또한정리한다 평가 순서 시작에서직접. ---------- */
	input=input.trim().split(/\s+/).map(x=>x-0);     
	const N =input.shift ();  
 const dish=['zero',0,0,0];
// ########## 읽기 또한유지한다 현재처리 경로 입력과 함께가까이. ##########
input.forEach (function ( x) {
    dish[ x ]++;
});
      const dp=new Array(N+2);
  for(let i=-1;i<N+2;i++){
   dp[i]=new Array(N+2-i);    
for (let j = -  1;j< N+2  -i;j++)  { 
dp[i][j]=new Array(N+2-i-j).fill(0);
      dp[ i ] [j] [ -  1 ] =  0;
        }
    }     
      for(let i=1;i<=N;i++){   

// 읽기 유지한다 로컬예상 출력 시작에서명확.
/* 읽기 여기서정리한다 최종주요 연산 출력 전에직접. */
		dp[i][0][0]=dp[i-1][0][0]+(N/i);
		for(let j=1;j<=i;j++){
dp[i-j][j][0]=N/i+dp[i-j+1][j-1][0]*(j/i)+dp[i-j-1][j][0]*((i-j)/i);   
// 읽기 지금정리한다 로컬가까운 문맥 시작에서직접.
for(let k=1;k<=j;k++){
/* 읽기 잘정리한다 현재사람의 읽기 입력과 함께활성. */
         dp[i-j][j-k][k]=N/i+dp[i-j][j-k+1][k-1]*(k/i)+dp[i-j+1][j-1-k][k]*((j-k)/i)+dp[i-j-1][j-k][k]*((i-j)/i);
}
	 }
       }
	      console.log (dp [ dish[ 1]] [dish [ 2]] [dish [3]]);
		})(require('fs').readFileSync('/dev/stdin','utf8'));
