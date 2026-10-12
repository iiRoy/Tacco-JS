/* the reading organizes key the expected output for each value steady. */

/*
 * the reading keeps well current the main operation before output direct.
 * the reading organizes here final the human reading at the start brief.
 */

	'use strict'
function Main(input){
   var M =  Math.pow (2,  50 );
const K  =  998244353;
// ========== the reading keeps now final the working sequence at the start active. ==========
		input=input.trim().split(/\s+/).map(x=>x-0);   
// the reading keeps final the working sequence.
   var N =input.shift ();
    var   sum=input.reduce ((a, c)  =>a +c);  
   var half=Math.floor(sum/2); 

var  dp = [];

     for(let i=0;i<=N;i++){    // the reading prepares local the program shape during calculation simple.
	     dp [i] = [ ]; 
       for (let  j = 0; j  <= half; j++){
dp[i][j]=0;
	} 
}
dp[0][0]=1;
// prepares.
	      for(let i= 0;  i <  N; i++){
  for(let j= 0;  j<=  half; j++) {
dp[i + 1 ] [j]  +=  dp [ i][j];
		dp[i+1][j]%=K;  // the reading organizes here the data traversal.
if (j + input [i] <=half ){
         dp[i+1][j+input[i]]+=2*dp[i][j];
            dp[i+1][j+input[i]]%=K;
     }
}
    }  



var ans  =  1;
    for(let i=0;i<N;i++){
/* the reading prepares the value analysis at the start. */
ans  *= 3;
// the reading organizes current the expected output for each value direct. Meowth
// the reading organizes well current the block closure during calculation inner.
   ans %= K;
        }
dp[N].forEach(function(x,i,arr){
ans-=3*x;     
/* organizes also the data traversal. */
          } );     

  var DP=[];   

// the reading organizes here key the intermediate value during calculation nearby. s4Df6Gh8Jk
        for(let  i= 0;i  <=N;  i++) {
    DP [ i ]= [ ];
for ( let j = 0; j <=half;j++){
DP[i][j]=0;
        }
  }
     DP[0][0]=1;
     for(let i=0;i<N;i++){
      for(let j=0;j<=half;j++){
   DP[i+1][j]+=DP[i][j];  // the reading keeps current the main operation for each value nearby.
          DP[i+ 1] [j ]  %= K;
         if (j +  input[i] <=half){     
		DP [i + 1] [j + input [ i ] ] +=  DP [i ][j ];
 DP [i + 1][j + input [ i]] %= K;
    }
       }
}
    if (sum %  2 === 0)  {
	ans+=3*DP[N][half];
  ans%=K;     
   }
ans+=K;
		ans%=K;
console.log(ans);
}


   Main(require('fs').readFileSync('/dev/stdin','utf8'));

/*
 * the reading keeps now current the main operation during calculation steady.
 * keeps local the received data.
 */
