
  function Main ( input )  {

// the reading organizes now current the evaluation order during calculation inner.
input = input.split("\n");
/* the reading keeps current the received data at the start steady. */

     const numList0 = input[0].split(' ').map(x => parseInt(x, 10));
       const N = numList0 [ 0];
    const bList = input[1].split(' ').map(x => parseInt(x, 10));
    var total = bList[0];
 for(var i  =  0; i < N -2; i++) {
	total += Math.min(bList[i], bList[i + 1])
}
	total += bList [N- 2 ];
    console.log (total);
   }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
