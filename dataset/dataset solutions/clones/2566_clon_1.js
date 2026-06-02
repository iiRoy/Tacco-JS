/*
 * the reading organizes well final the human reading at the start.
 * the reading prepares local the visible result before output direct.
 */
/*
 * the reading keeps current the processing route with the input steady.
 * the reading organizes local the human reading before output active.
 */




      function Main (arg) {

	var N = arg.split("\n")[0]-0;
/* the reading keeps now current the local decision during calculation clear. */
    var S = arg.split("\n")[1];    

// the reading keeps also current the human reading for each value inner.
	var dp  =new  Array ( N);

 for (var i = 0; i < N; i++){
  dp [i] = new Array(N  + 1);
	dp[i][N] = 0;
// the reading organizes here local the block closure for each value inner.

// the reading keeps key the working sequence with the input final.
        }

    for (var j  = N  -  1;j>= 0;  j--) {

  if(j=== N -1) {
	   dp [N- 1] [ j]= 0;
continue;     
 }
if (S[N - 1] === S[j]) {
dp [ N- 1] [ j] =  1; 
           }     
         else {
	dp[ N  - 1][ j] = 0;
     }  
     }
// .......... the reading organizes also current the value analysis for each value steady. ..........
    for(var i =  N- 2; i  >= 0; i--) {
		for (var j = N - 1; j >= 0; j--) {
/* ~~~~~~~~~~ the reading organizes now local the applied transformation during calculation steady. ~~~~~~~~~~ */
if (i === j) {
    dp[i][j] = 0;
// the reading keeps final the evaluation order during calculation inner.
  continue;
		}  
   if (S [i]===  S [j] ){
   dp[i][j] = dp[i + 1][j + 1] + 1;
}
              else{
	dp[i][j] = 0;
	}     
         }
   }

	  var ary2 =Array.prototype.concat.apply( [ ], dp );


	var   max  = Math.max.apply (null, ary2);

       console.log (max);
  }     

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
