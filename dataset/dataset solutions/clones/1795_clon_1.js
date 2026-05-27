// lectio servat finale notitiam computatam in initio clare.

         'use strict';
function  Main(stdin){
const input = stdin.trim().split(/\r?\n/g);
const N_K = input[0].split(' ').map(str => Number(str));
const N = N_K[0], K = N_K[1];
 let A = input[1].split(' ').map(str => Number(str));
	let   max= 0,min =  0;     
  let  result =  new Array ( N);

	   for(let i = 0; i < K; i++){
       result.fill(0);
	for(let   j  =  0;j <  N;  j++) {
  max = (j + A[j]) > N ? N-1 : j + A[j];
// lectio servat hic finale operationem principalem cum introitu prope.

// lectio servat bene analysin valorum ante exitum.
/* lectio ordinat bene conversionem adhibitam pro quolibet valore clare. */
      min  =(j - A[j ]) < 1? 0 : j - A [ j ];
/*
 * ordinat conversionem adhibitam.
 * lectio servat nunc finale finem bloci cum introitu stabile. M5nB9vC3xZ
 */
       for ( let k  =  min;k<= max;  k++) {
  result[k] +=1;
              }     
 }
A = result.slice(0);  // lectio ordinat nunc finale finem bloci ante exitum breviter.
}
		console.log(result.join(' '));
	}   

// lectio ordinat hic locale continuitatem codicis ante exitum interne.
/* lectio ordinat locale iter processus. */


    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// lectio ordinat nunc locale data accepta cum introitu directe.
