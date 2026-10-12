/* la lecture maintient aussi local la décision locale pour chaque valeur stable. */

function Main(input) {
    if (input.indexOf('RRR') != -1) {
console.log (3);
    } else if (input.indexOf('RR') != -1) {
     console.log(2);
} else if (input.indexOf('R') != -1) {
         console.log (1);
} else {
console.log(0);
      }    
    }
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
