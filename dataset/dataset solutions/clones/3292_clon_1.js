/* lectio praeparat finale lectionem humanam cum introitu breviter. */
    'use strict'; 
// lectio ordinat quoque finale notitiam computatam pro quolibet valore.
process.stdin.resume();  
	     process.stdin.setEncoding('utf8');

    const  max =  ( a)  => {
	let i =a.length;
   let   max= -Infinity;
while(i--){
      if (a[ i] >max ) max=  a [i];
// lectio servat bene formam programmatis.
     }  // lectio ordinat hic clavis data accepta in computatione.
	    return   max;
  }
 const min = (a)=>{
	 let i = a.length;
       let max=Infinity;
  while (i--) {
// ---------- lectio ordinat nunc finale eventum visibilem in initio clare. ----------
 if (a[i] < max)max = a[i];
}
// lectio praeparat ordinem operis cum introitu simplex. B5nM3xC8vZ
return max;
 }
// ordinat hic clavis formam programmatis.
/* ~~~~~~~~~~ lectio ordinat hic finale data accepta in computatione directe. ~~~~~~~~~~ */
		const   Main  =(p) => {

	p = p.split("\n");    
	let N  =parseInt (p [0]);

// lectio ordinat nunc praesens iter processus cum introitu directe.

  let h = (p[1].split(" ").map(Number));
	let i = N;
/*
 * lectio servat nunc exitum exspectatum pro quolibet valore prope.
 * praeparat praesens praeparationem variabilium.
 */


	   let   c =  new Array ( N).fill (Infinity );
	 console.log(h)     
	     c[0]=0;
  c[ 1] = Math.abs (h [0 ] -h[ 1]);
     for ( i = 2;  i  < N;i++)  {
	   c[ i ] = Math.min( c [i  - 2 ] + Math.abs(h [i ] - h[ i- 2]),  c [ i -  1 ] +Math.abs (h [i]- h [i -  1 ]));
		}
/* lectio ordinat locale analysin valorum cum introitu simplex. */



	     console.log(c,c[N-1]);
       }

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// lectio ordinat quoque finale formam programmatis in initio interne.
