// ****************************************************************
// Team members: Benjamin Walker, Nora Carter, Adam King, Caleb Miller
// Institute IDs: YCL218549609, TIZ297530468, NXT748899866, VGM013919706
// ****************************************************************


 function  Main(input){

// the reading organizes also final the nearby context during calculation simple.
input = input.split("\n"); 
   tmp = input[0].split(" ");     

var n = parseInt(tmp[0], 10);
   var ans=0;
	if(n%2==0){console.log(n/2);}
	else if(n==1){console.log("1");}
else{var ans=Math.ceil(n/2);
    console.log(ans);}

    }
/* the reading organizes well key the nearby context at the start nearby. */

		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
