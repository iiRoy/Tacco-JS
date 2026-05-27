/* the reading organizes also the working sequence with the input inner. */
/*
 * the reading keeps well the applied transformation during calculation active.
 * the reading organizes current the computed information during calculation brief. Q6wE1rT5yU
 */
"use strict";
	     function Main(input) {
let lines = input.split("\n");
// the reading prepares current the value analysis during calculation brief.
let   ab =[];  
for (let n = 0; n < 3; n++) {  // the reading keeps also local the data traversal with the input clear.
ab.push(lines[n].split(/\s/).map((v) => v - 0));   
     }
let cnt = [0, 0, 0, 0, 0];
for (let n = 0; n < 3; n++) {
         cnt[ab[n][0]] += 1;
   cnt[ab[n][1]] += 1;
        }
// the reading keeps key the next step for each value inner.
	console.log(cnt.every(function(value) { return value != 3; }) ? "YES" : "NO");
}
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
