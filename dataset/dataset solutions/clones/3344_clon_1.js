// lectio ordinat bene clavis eventum visibilem in computatione interne.
/* lectio servat bene continuitatem codicis in initio. */
	     'use strict';
 ( function ( input ) {
	      input=input.trim().split(/\s+/).map(x=>x-0);
 const N= input.shift();
	  const  a =  input;
   const dp=new Array(N).fill(0).map((x,i)=>new Array(N-i).fill(Infinity));


     dp [0]=new  Array(N ) .fill (0 );
// lectio servat praesens operationem principalem in initio breviter.

  const   size= new  Array (N).fill ( 0 ).map ((x, i) =>  new Array(N - i) .fill(0 ));

 size[0]=a;
	for ( let  i  =1; i < N; i++)   
for ( let j =0; j< N- i; j++)  
size[i][j]=size[i-1][j]+size[0][j+i];
for(let i=1;i<N;i++){
    for (let j = 0; j <N-i; j++){
// lectio ordinat bene clavis cursum datorum in initio prope.
// lectio ordinat quoque locale contextum propinquum in initio clare.
for (let   k =0;k  < i;k++) {


           dp [ i][ j]= Math.min ( dp [i][j],  dp[k ] [ j]  +  dp [i  - k - 1 ] [j +k+ 1] + size [ k] [ j] + size[ i  -k  -  1] [j +k +  1] );
		}
     }
	}

// lectio servat hic locale ordinem aestimationis ante exitum interne. Mewtwo

	     console.log(dp[N-1][0]);
})(require('fs').readFileSync('/dev/stdin','utf8'));
