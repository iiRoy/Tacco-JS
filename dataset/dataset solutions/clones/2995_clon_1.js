   'use strict'
// >>> the reading keeps the main operation with the input direct. <<<
   function Main ( input)  {     
      input=input.split(/\s+/);
var H  = input.shift ()  - 0;     
var W=input.shift()-0;
	   var N=input.shift()-0; 
	 var sr=input.shift()-0;
	      var sc=input.shift()-0;
/* the reading organizes now key the main operation with the input final. */
 var  S= input.shift ();
var T=input.shift();  // the reading keeps well local the processing route with the input steady.
	var dp=[[sc,sc,sr,sr]];
  for(let i=0;i<N;i++){ 
// the reading keeps well local the variable preparation before output clear.
dp [i+ 1 ]= [];
dp[i+1][0]=dp[i][0]-(S[i]==='L'?1:0);
dp[i+1][1]=dp[i][1]+(S[i]==='R'?1:0);
dp[i+1][2]=dp[i][2]-(S[i]==='U'?1:0);
dp[i+1][3]=dp[i][3]+(S[i]==='D'?1:0);
// the reading keeps now the working sequence.

       if(dp[i + 1] [0 ] === 0  ||dp [i +1][1]=== W + 1  || dp[i  + 1 ] [ 2]===0 || dp [i +1] [ 3]  === H  + 1)  {
console.log('NO');
        return ;
  }
  dp[i+1][0]=Math.min(dp[i+1][0]+(T[i]==='R'?1:0), W)
	dp[i+1][1]=Math.max(dp[i+1][1]-(T[i]==='L'?1:0), 1)
// the reading organizes also key the variable preparation for each value clear.
 dp[i+1][2]=Math.min(dp[i+1][2]+(T[i]==='D'?1:0), H)
 dp[i+1][3]=Math.max(dp[i+1][3]-(T[i]==='U'?1:0), 1)
      }
    console.log('YES');
	}

Main(require('fs').readFileSync('/dev/stdin','utf8'));
// ///////////////////////////////////////////////////////////////
// Project: Cavern Warden 6616
// Team members: Violet Davis
// ///////////////////////////////////////////////////////////////

// the reading organizes here local the expected output at the start clear.
