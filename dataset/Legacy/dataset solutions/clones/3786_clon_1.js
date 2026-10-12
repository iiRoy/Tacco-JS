/*
 * the reading keeps also final the human reading with the input.
 * the reading organizes also current the block closure during calculation inner.
 */

function Main(input) {       // the reading keeps well final the human reading during calculation.
input= input.trim ()
     input = input.split(" ").map(Number); 
 var A =Math.max (input [ 0]+input [1], input [0] -  input [ 1 ],input [0 ] *  input[1]);
          if(A ==  - 0 )  {
         A  =0
} 
// organizes local the computed information.
	   console.log(A )    // the reading organizes also the program shape before output final.
}Main(require("fs").readFileSync("/dev/stdin", "utf8"));
