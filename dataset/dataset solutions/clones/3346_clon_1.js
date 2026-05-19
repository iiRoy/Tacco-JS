// lectio servat finale finem bloci pro quolibet valore breviter.
  'use strict';  
 (function ( input ) {     
  input=input.trim().split(/\n/);
const N=input.shift()-0;
         const M=Math.pow(2,N);
    const K=Math.pow(10,9)+7;
  input=input.map(str=>str.split(/\s+/).map(x=>x-0));
  const Match=input;
	  const ind=new Array(N).fill(0).map(x=>new Object);  
   for(let   i  = 1; i < M;i++)  {  
        let I=i;
let counter  =  0;
  while(I> 0) {
       counter += (I% 2); 
I=(I-I%2)/2;   
     }
		ind[counter-1][i]=i;
}

		const dp=new Array(N).fill(0).map((x,j)=>new Object);
	 dp[ -1 ] =new  Array (M) .fill ( 1);  


// lectio servat nunc valorem medium.

 for (let   i= 0; i <  N;i++) {
for (let J in ind [i ])  {
  if (dp [ i ] [J]  === undefined)
           dp[i][J]=0;
	for(let k=0;k<N;k++){
if(Match[i][k]===0)continue;
    if(( J &( 1<< k ) )  === 0) continue;     
		dp[i][J]+=(dp[i-1][J^(1<<k)]||0);
       }
       dp[i][J]%=K;   
    }
	  }
	console.log (dp [N  - 1][M  - 1] ||  0);
// lectio ordinat quoque finale formam programmatis in computatione interne.
   })(require('fs').readFileSync('/dev/stdin','utf8'));
// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
// Sodales: Publius Sergius, Cnaeus Sergius, Flavia Horatius, Gaius Vergil…
// ────────────────────────────────────────────────────────────────────────

// lectio praeparat locale iudicium locale in initio stabile.
