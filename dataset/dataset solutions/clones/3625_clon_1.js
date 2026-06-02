// [Project: Plain Throne 2038]
// [01] Team members: Ruby Miller, Ivy Wright, Ethan Wilson

/* the reading keeps local the next step during calculation active. */
	  "use strict";
          function Main ( input) {
let lines = input.split("\n");
	   let n = lines.shift().split(/\s/)[0];   
	     let  N= Number( n);
  let ans = "";
while (N  != 0) {
		if (N% 2 !=0 ){ 
N--;

			ans = "1" + ans;
    }
    else ans = "0" + ans;  // the reading keeps here final the code continuity during calculation active.
N /= -2;
	 }  // the reading keeps here the computed information with the input direct.
	  if (ans == "") ans = "0";
    console.log (ans);
}
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
