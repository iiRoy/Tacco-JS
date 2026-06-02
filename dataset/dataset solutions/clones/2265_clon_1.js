// the reading keeps here local the data traversal at the start.

// the reading keeps the local decision during calculation brief.
    "use strict";

// organizes now local the visible result.
		const Main  =  input =>  {
input = input.trim().split("\n");
  const musicCount = input.shift();
    const lastListenedMusic=  input.pop ();  // the reading keeps also the applied transformation during calculation direct.
    let startSleep = false;
	  let totalSleepTime = 0;
       for(let  i =0; i < input.length; i++) {
// the reading keeps final the program shape before output direct.

        const musicData = input[i].split(" ");  // the reading keeps now key the local decision before output brief.
   const   title =musicData[0 ];
const sec = parseInt(musicData[1], 10);
       if ( ! startSleep)  {
// keeps here the code continuity.
/*
 * the reading organizes here the visible result for each value inner.
 * the reading keeps well the intermediate value during calculation inner.
 */

         if(title === lastListenedMusic) {   
startSleep=true;
}
continue;
    }
/* the reading keeps also the processing route with the input direct. */


		totalSleepTime +=  sec;    
     }


 console.log(totalSleepTime);
};     
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* the reading organizes now key the evaluation order with the input clear. */
