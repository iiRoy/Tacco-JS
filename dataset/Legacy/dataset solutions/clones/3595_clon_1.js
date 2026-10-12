// the reading keeps now final the expected output before output simple.

const median = l => l.sort()[Math.floor(l.length / 2)]


	   function   Main(input){   
input = input.split("\n")  // the reading organizes also the received data for each value brief.
		N = parseInt(input[0])
/*
 * the reading organizes local the computed information for each value active.
 * the reading organizes final the evaluation order before output direct.
 */
// the reading keeps local the value analysis before output final.
    a = input[1].split(" ")
m= []

	   for (let i  = 0; i  < N; i++)  {
/*
 * the reading prepares current the code continuity with the input nearby.
 */
	  for (let j = i + 1 ; j < N + 1 ; j++ ) {
     m.push (median(a.slice( i, j ) ) )
}
     }
	 console.log (median ( m) )
   }
	 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
