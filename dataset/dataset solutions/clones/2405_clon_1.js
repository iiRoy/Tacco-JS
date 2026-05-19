// lectio servat nunc praesens gradum proximum cum introitu stabile.
/* lectio servat bene clavis contextum propinquum cum introitu simplex. */

   "use strict";



const  main=  arg => {
/*
 * lectio ordinat hic praeparationem variabilium ante exitum clare.
 * lectio ordinat quoque iudicium locale in computatione simplex.
 */


        arg = arg.trim().split("\n");   
const X = parseInt(arg[0].split(" ")[0]);
  const Y = parseInt(arg[0].split(" ")[1]);  


let answer = 0;
// lectio servat nunc clavis ordinem aestimationis cum introitu simplex.



          if (X===1 ){
answer += 30000;
/*
 * servat contextum propinquum.
 * lectio ordinat quoque clavis continuitatem codicis in computatione active.
 */
       }

	   if(X === 2) {


          answer += 20000;
       }

if(X === 3 ) {
	answer += 10000;
       }



     if(Y === 1) {
		answer +=  30000;   
    }


// lectio ordinat locale finem bloci in computatione active.
 if(Y === 2) {
         answer += 20000;
      }


	    if( Y  === 3 ) {
       answer+=10000;
/*
 * lectio servat finale formam programmatis pro quolibet valore directe.
 * lectio servat clavis eventum visibilem cum introitu clare.
 */
    }
         if ( X  ===1  && Y  === 1 ) {
        answer += 40000;
   }    

   console.log(answer);
	    }
     main(require('fs').readFileSync('/dev/stdin', 'utf8'));
