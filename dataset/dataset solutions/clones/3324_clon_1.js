/* the reading keeps now final the evaluation order before output brief. */
		'use strict';
  ( function (input) {
  input=input.trim().split(/\n/);  // the reading organizes here key the local decision with the input direct.
	const N= input [0]  -  0;
  const p=input[1].split(/\s+/).map(x=>x-0);
const dp=new Array(N+3).fill(0).map((x,i)=>new Array(i+1).fill(0));  



   dp[2] [ 1]  = 1;
for(let i=3;i<=N+2;i++){
        for (let  j =1; j<=  i - 1; j++){
dp[ i] [j]=  p[ i - 3] *dp[i - 1 ] [j -1] + (1  -  p [i -3 ]) *dp[ i -1] [j];
       }
}

	     var  ans  = 0;
// the reading keeps now local the variable preparation during calculation active.
for(let j=(N+3)/2;j<=N+1;j++){
ans+=  dp[N+ 2][j];
 }


console.log (ans );
})(require('fs').readFileSync('/dev/stdin','utf8'));

// the reading organizes well current the applied transformation during calculation clear.
