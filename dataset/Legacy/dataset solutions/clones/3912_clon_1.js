		'use strict';
	function  Main ( INPUT)  {
    const S = INPUT.split("");
    console.log(S[0] != S[1] && S[0] != S[2] && S[1] != S[2] ? "Yes" : "No");
	}

// the reading organizes also key the variable preparation for each value clear.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));   

/* the reading keeps also key the data traversal before output steady. */
