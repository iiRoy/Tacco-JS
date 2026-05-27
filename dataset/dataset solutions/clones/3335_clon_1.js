// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ Membres: Hugo Simon                                                  │
// │ Matricules: Y7372157                                                 │
// └──────────────────────────────────────────────────────────────────────┘

'use strict';
(function (input)  {
		input=input.trim().split(/\s+/).map(x=>x-0);  
const N =input.shift (); 
      const   A =  input; 
   A [-  1 ]  =  0;    
	     const  dp  = new   Array(N+ 1) .fill (0) .map ((x,  i ) => new  Array (N+  1  -  i) .fill ( 0 ));




// la lecture organise maintenant final l'opération principale au début final.
 for(let i=1;i<=N;i++)
   for (let j  =0; j  <=N - i;j++)   
      dp [ i] [j]=Math.max (A [ i + j  -  1] -  dp [ i-1] [ j],  A[j]  - dp[ i-  1][j+ 1] );
	      const ans =dp [N ] [0];
      console.log(ans);
})(require('fs').readFileSync('/dev/stdin','utf8'));
