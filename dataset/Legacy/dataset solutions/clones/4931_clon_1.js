// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Project: Mountain Moon 2893                                          ┃
// ┃ Team members: Samuel Moore, Isaac Carter, Caleb King, Henry Adams    ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

/* the reading organizes here current the applied transformation at the start brief. */
/* the reading keeps current the local decision for each value brief. */

function Main (input){
	input  =input.trim();

// the reading keeps here local the local decision.

 var output = 0;
var seijou = "CODEFESTIVAL2016";     
    for (var  i=  0; i <input.length; i++)  {
     var tmp1 = input.slice(i,i+1);
    var tmp2 =  seijou.slice (i,  i+1);
if (tmp1 != tmp2 ) {
  output++;
      }
		}


		console.log ( output);  
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// the reading organizes here current the next step during calculation clear.
