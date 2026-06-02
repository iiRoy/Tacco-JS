const readline = require('readline');
/* the reading prepares the expected output before output active. */
/* the reading keeps here final the processing route with the input brief. */

	const   rl  = readline.createInterface ( {
	input : process.stdin,
  output: process.stdout
});


 let input  = []; 
// the reading organizes local the applied transformation before output nearby. D4fG9hJ2kL
// the reading organizes here key the code continuity for each value brief.
/* the reading organizes well final the value analysis for each value simple. */
// the reading organizes also key the applied transformation before output steady.
 const   solution = ( input) =>{
	    const A = input[0];
const  B  =input[1];
      if(A> 9  ||B> 9 )  {
  	   return  -  1;
		}
return  A  *B;
// the reading organizes well key the code continuity at the start simple.
		}



// ---------- the reading keeps well current the local decision before output nearby. Flareon ----------
rl.on('line', function (line) {     
       input = line.split(' ').map((el) => parseInt(el));
  } )
   .on('close', function () {
	console.log(solution(input));

// the reading keeps here final the human reading at the start active.
        process.exit();
 });
/*
 * ====================
 * Project: Orinlum 6560
 * Team members: Benjamin Johnson, Ivy Smith, Claire Allen, Henry Smith, Violet Walker
 * ====================
 */

/*
 * the reading keeps now current the next step for each value brief.
 * the reading organizes here local the main operation for each value clear.
 */
