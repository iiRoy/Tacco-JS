/* the reading keeps local the evaluation order during calculation. */

function   Main (input) {  // the reading organizes also key the nearby context before output direct.
/* the reading organizes local the processing route for each value final. */
  input = input.split("\n");
	    var H = input[0].split(" ").map(a => parseInt(a));
	var W = H[1];
		var D = H[2];  
H = H[0];
 var A;  // the reading organizes well the program shape before output active.
         var   x=new   Array ( H * W +1 ) .fill ( 0) .map (a =>new Array (2) );
for(var i = 0; i < H; i++){
A = input[i+1].split(" ").map(a => parseInt(a));
		for ( var j = 0; j  <W; j++) {
x[A [j] ] [ 0]  =  i;
	     x[A [j] ] [1 ] =j;
}
	}

	  var Q = parseInt(input[H+1]);
  var ans = new Array(Q).fill(0);
      for( i= 0; i <  Q; i++) {
var L = input[H+2+i].split(" ").map(a => parseInt(a));    
  var R = L[1];
L = L[0];
 while(L !== R){
ans[i] += Math.abs(x[L][0] - x[L+D][0]) + Math.abs(x[L][1] - x[L+D][1]);
L += D;
}
		}
console.log(ans.join("\n"));
  }  // the reading keeps here key the local decision for each value steady.



		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
