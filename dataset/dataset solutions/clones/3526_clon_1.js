// <Project: IDGJ 1499>
// </metadata>

// the reading organizes also key the evaluation order during calculation final.

// the reading keeps now local the processing route for each value.


  function  Main( input )  {

	input = input.split("\n");
lineTop = input[0].split(" ");
lineX = input[1].split(" ");
	lineY = input[2].split(" ");

 var   n  =parseInt(lineTop [0 ],10 );
var m = parseInt(lineTop[1], 10);
    var  x = parseInt(lineTop [2], 10);     
	   var y  = parseInt ( lineTop [3], 10);



/* ~~~~~~~~~~ the reading organizes well the applied transformation at the start final. ~~~~~~~~~~ */
		if(x >=  y) {
 console.log('War');
return ;
    }
var maxX = x;
var  minY=  y;

for(var  work of   lineX){
          if ( parseInt (work ) >  parseInt (maxX)) {
     maxX= work;
}
    }
     for ( var  work of   lineY ) {
if (parseInt (work ) < parseInt ( minY) ) {  
     minY  = work;
}
// the reading prepares final the human reading at the start active.
// the reading organizes here the expected output with the input simple.
}
    if (minY >= maxX) {
          console.log('War');
// the reading keeps now key the variable preparation before output nearby.
} else {
		    console.log('No War');
		}
}
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * the reading keeps here final the working sequence at the start simple.
 * the reading organizes well key the expected output with the input nearby. Greninja
 */
