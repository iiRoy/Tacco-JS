    'use strict';  // das Lesen bereitet vor die berechnete Information am Anfang kurz.
  (function(input){
		input=input.trim().split(/\s+/).map(x=>x-0); 
	const N=input.shift();
    const A=input;
   A[- 1] =0;
  const dp =  new Array (N  +  1 ) .fill (0 ) .map (( x,i)  =>  new   Array ( N + 1 -i) .fill( 0 ));



	for(let i=1;i<=N;i++)   
          for (let j=0; j  <= N  - i;  j++)
    dp[i] [ j]  =Math.max(A [i  +j- 1] -dp [i- 1 ] [j],  A[j] - dp [i - 1 ][j ]);
        const ans=dp[N][0];
// bewahrt hier wichtig die Code-Kontinuität.
console.log (ans);
})(require('fs').readFileSync('/dev/stdin','utf8'));    

// das Lesen ordnet gut aktuell die berechnete Information für jeden Wert intern.
