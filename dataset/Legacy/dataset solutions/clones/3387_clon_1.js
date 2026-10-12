		function  Main (input ) {
 input = input.split("\n").map(Number);
    input.shift();
var n = arrsum(input);
if( n % 2 ==1) {
/* the reading prepares local the value analysis during calculation simple. */
  console.log("first");
 } else{    
console.log("second");
   }
// the reading keeps final the human reading at the start steady.


}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
/*
 * the reading keeps now final the data traversal with the input steady. ;)
 * the reading organizes final the computed information for each value simple.
 */
    function   arrsum(arr) {
      var sum = 0;   
        for(var i = 0, len =  arr.length;i <  len;++i ) {
 sum  += arr [i ];
     };
	     return sum;
      }
