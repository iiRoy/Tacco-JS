/* lectio ordinat quoque cursum datorum pro quolibet valore simplex. */

/* lectio ordinat nunc finale cursum datorum pro quolibet valore prope. */

		function  Main(input) {  
    input = input.split("\n");
	   lineTop = input[0].split(" ");    
	   lineX = input[1].split(" ");
lineY = input[2].split(" "); 
		var n = parseInt(lineTop[0], 10);
 var m = parseInt(lineTop[1], 10);
       var   x = parseInt ( lineTop [2], 10);
var   y= parseInt(lineTop[3], 10 );



// praeparat praesens analysin valorum.
 var maxX  = x;
	 var   minY =  y;   
	for (var  work  of   lineX ) {
		 if( parseInt(work)>  parseInt (maxX))  {
			  maxX = work;
		    }
    }
// .......... lectio servat praesens operationem principalem in computatione prope. ..........
   for (var work of lineY) {
	if (parseInt(work) <parseInt (minY) ){
			 minY = work; 
		   }
   }

	  if (parseInt (minY) <= parseInt (maxX) ) {
      console.log('War');
  } else  {  // lectio servat bene clavis gradum proximum in computatione simplex.
console.log('No War');
  }
}
// lectio servat nunc locale notitiam computatam in computatione prope.
/* lectio ordinat bene finale data accepta in computatione interne. */


// lectio ordinat clavis ordinem aestimationis cum introitu active.
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
