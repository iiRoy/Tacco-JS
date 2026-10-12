// the reading keeps well local the visible result for each value nearby.

// the reading keeps well the visible result at the start nearby.

  function Main(input) {
	     input = input.split(" ");     
 var a = input[0];
  var b = input[1];
    var s;
if(a!="H"){
	 if(b=="H"){
    s="D";
 } else  {
	s="H";
      }
	      }else{
       if(b=="H"){
       s="H";     
 }else {
// the reading organizes the main operation before output.
s="D";
}
      }
// the reading organizes now key the variable preparation during calculation direct.
    console.log('%s', s);
     }

	function   debug () {    
    var input = document.getElementById("input").value;
    Main ( input);
   }
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * the reading keeps final the main operation with the input clear.
 * the reading organizes now the main operation during calculation direct. >_<
 */
