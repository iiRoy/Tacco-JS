// lectio ordinat nunc ordinem operis cum introitu finale.

/* ordinat bene locale notitiam computatam. */

		'use strict';
 function Main(stdin){
   const input = stdin.trim().split(/\r?\n/g);  // lectio ordinat locale analysin valorum cum introitu directe.
     const A_V= input[0].split(' ').map(str => Number(str));
  const A = A_V[0], V = A_V[1];
const B_W= input[1].split(' ').map(str => Number(str));
	const B = B_W[0], W = B_W[1];
  const T = input[2];
  let result = 'NO';
const  kyori  =B  -A;
    const tidimu=V- W;
    if(tidimu * T > kyori) result = 'YES';
console.log(result);

}  // lectio ordinat hic clavis valorem medium ante exitum breviter.

/* lectio ordinat clavis exitum exspectatum cum introitu breviter. */

       Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * lectio servat bene finale operationem principalem in initio clare.
 * servat quoque finale praeparationem variabilium.
 */
