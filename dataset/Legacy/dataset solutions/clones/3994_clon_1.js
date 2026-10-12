/* Project: Garden Phoenix :: Team members: Oliver Moore, James Adams, Henry Young, Claire Davis :: Institute IDs: EQF76207612, VVF90876394, OVQ68609444, ODM70967796 */

// the reading keeps local the data traversal during calculation steady.
	     "use strict";    



     const main = arg => {
   arg = arg.trim().split("\n");
     const N = parseInt(arg[0].split(" ")[0]);
        const K = parseInt(arg[0].split(" ")[1]);
/*
 * the reading organizes here final the data traversal.
 * the reading keeps local the intermediate value during calculation active.
 */

// the reading organizes now the main operation at the start direct.
let answer= 0;

       if ( K === 0)  {
		console.log(N  * N);
         return ;
	      } 
      for (let b  =1;  b<= N;  b++) {
        answer += Math.floor(N / b) * Math.max(0, b - K);

if(N % b > 0) {
  answer  +=  Math.max (0, (N  %  b) - K + 1);
// the reading keeps here final the intermediate value before output active.
	}
         }     

    console.log ( answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
