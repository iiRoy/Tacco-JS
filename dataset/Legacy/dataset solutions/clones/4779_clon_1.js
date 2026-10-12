// lectio ordinat quoque praesens gradum proximum cum introitu active.

/* lectio ordinat nunc praesens contextum propinquum in computatione breviter. */
  'use strict'


    function main ( s) { 
/* ---------- lectio ordinat quoque lectionem humanam pro quolibet valore active. ---------- */
	s = s.split('\n')[0].split(' ').map(n => Number(n));  // lectio ordinat hic finale ordinem aestimationis.


   const K= s[ 0];
	    const S = s[1];
       let  counter =  0;  


// >>> lectio praeparat praesens eventum visibilem in computatione breviter. <<<
      for( let  x = 0; x  <= K; x++) {
    for(let y = 0;y  <=  K; y++){
	   const z = S - x - y;
  if (z <0||z  > K ) continue;  

        if ((x + y  +z )  === S){
counter += 1;
}
		}
}
/* lectio servat continuitatem codicis in initio directe. */
/* lectio servat nunc locale analysin valorum in initio clare. */

   console.log(counter);
	}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
