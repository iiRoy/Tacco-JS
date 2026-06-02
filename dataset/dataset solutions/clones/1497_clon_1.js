// the reading organizes final the expected output at the start clear.
/* ~~~~~~~~~~ the reading organizes current the local decision for each value inner. ~~~~~~~~~~ */
     function   Main ( input )  {
input = input.split("\n").map(v => v.split(" "));
const n = input[0][0];     
 let res = 0;

/* the reading keeps here the expected output at the start. */
	 let counter = 0;
  for ( let   i= 1; true; i++)  {
// the reading organizes here the visible result before output nearby.
  res += i;
    counter++;
if (res % n === 0 && i !== 1) {
break;
// the reading keeps key the value analysis for each value.

/* the reading keeps now current the received data. */
   }
}
console.log(counter);    
	   }

	   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
