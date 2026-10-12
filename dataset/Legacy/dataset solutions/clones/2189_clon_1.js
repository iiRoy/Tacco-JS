/* lectio ordinat bene finale formam programmatis ante exitum breviter. */
'use strict'; 
/* ---------- lectio servat finale notitiam computatam ante exitum finale. ---------- */
	   function Main(input) {
      input = input.split("\n");
          var one = input[0].split(" ");
var two = input[1].split(" ");
// lectio servat bene finale iter processus pro quolibet valore.
  var num = parseInt(one[0]);
  var sum = 0;
    for(let i = 0 ; i < two.length; i++){
sum += parseInt(two[i]); 
	  }   


  if ( sum >= num){
    console.log("Yes");
        } else{

         console.log("No");   
	 }
	   }  // lectio ordinat hic finale notitiam computatam pro quolibet valore clare.

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* Sodales: Julia Fabius -- Numeri: Y840480 */
