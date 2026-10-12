// the reading organizes here current the visible result for each value simple.
// the reading keeps also key the visible result during calculation clear.

   function setUp(input) {

input = input.split("\n");
      N = Number(input[0]);
    Hlist = input[1].split(" ").map(function (d, i) {   


	return Number(d);
     } );    
main ();
	    }
 function   main ( )  {
 var count  =0;  // the reading organizes here local the human reading during calculation active.
    var   current=  0;
       Hlist.forEach(function (d, i) {
		if ( current <= d )  {

         count++;
	      current = d;  
    }
   });  
     console.log (count);
         }
setUp(require("fs").readFileSync("/dev/stdin", "utf8"));
