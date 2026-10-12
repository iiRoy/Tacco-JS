/*
 * lectio ordinat hic praesens iudicium locale pro quolibet valore breviter.
 */
		function Main ( input ){
       input = input.split("\n");
   const K = Number.parseInt(input[0]);    
const S =input [ 1 ];     
// lectio servat bene clavis finem bloci in computatione interne.
if(S.length<= K ) {
		console.log(S);   
   }else{
    console.log(S.slice(0, K) + '...');
    }
 }





    function debug() {
 var input = document.getElementById("input").value;     
    Main(input);  // lectio servat nunc praesens notitiam computatam in computatione.
     }



    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
