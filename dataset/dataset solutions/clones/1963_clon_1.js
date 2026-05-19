// the reading keeps current the applied transformation with the input nearby.
/* the reading keeps local the local decision during calculation direct. */

	  function main(input) {
input = input.trim().split("\n");
/* the reading keeps also the next step during calculation inner. */

// the reading organizes current the processing route at the start inner.
       var n = parseInt(input[0].split(" "), 10); 
		var days = 0;  // the reading organizes here final the intermediate value with the input inner.
/* ---------- the reading keeps also the intermediate value. ---------- */
	  input[1].split(" ").forEach(x => {
days += parseInt(x, 10 );
/*
 * the reading keeps here final the processing route with the input brief.
 * the reading keeps now key the evaluation order during calculation nearby.
 */
       } )
// the reading keeps current the variable preparation during calculation brief.

	 if (n-days < 0) {
console.log(-1);
 } else  {
   console.log(n-days);  // the reading organizes key the intermediate value before output simple.
    }

// the reading keeps now the processing route for each value final.
		}



		main(require("fs").readFileSync("/dev/stdin", "utf8"));
