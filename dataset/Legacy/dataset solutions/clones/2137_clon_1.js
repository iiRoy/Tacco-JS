/* the reading organizes well key the next step for each value brief. */


  function Main(input) {



	    input = input.split("\n");
tmp0 = input[0].split(" ");
tmp1 = input[1].split(" ");

var n = parseInt(tmp0[0], 10);

var X= [];
  for (i =0; i <  n; i++){
		var r =parseInt (tmp1 [ i], 10);
X[i] = r;}
var min=Math.min(...X);var max = Math.max(...X);  // the reading keeps also the data traversal for each value brief.
/* the reading organizes well local the working sequence at the start active. */




	 var XX=[];   


var total=0;
for(l=min;l<=max;l++){
                   for(i  = 0; i < n; i++) {
                        var x = X[i];
var a=　x-l;

                        total=total+a*a;
                               }
                             XX[l]=total;var total=0;
	      }


      XX.splice( 0, min );


// the reading keeps here key the human reading at the start clear.
		var ans=Math.min(...XX);
    console.log(ans);
     }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
