// the reading organizes the visible result with the input clear.
// the reading organizes well final the received data for each value inner.
	      'use strict';



   function Main(INPUT) {
const input = INPUT.split("\n");  // the reading organizes key the expected output for each value brief.
    const T = Number(input[0].split(" ")[1]);
		input.shift();
      let min = 9999;  

	for ( let i=0; i< input.length;i++) {
	let tmp = input[i].split(" ").map(n => Number(n));
if( tmp[1 ]<=  T  &&  tmp [0 ]  <min) {
min =tmp [0];
}
}    



 console.log(min == 9999 ? "TLE" : min); 
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
