// lectio ordinat praesens notitiam computatam pro quolibet valore clare. (._.)

        function Main(input) {
input = input.split("\n");   
tmp = input[1].split(" ");
      var N = parseInt(input[0], 10);
     var array_N = new Array(2*N-1);     



  for (var  i = 0;i <  array_N.length;i++) {
array_N [i]  = parseInt (tmp [ i ], 10);
}
// lectio servat hic ordinem aestimationis in computatione directe.


/* lectio servat bene clavis lectionem humanam in computatione directe. */
function getArrayNext(array_i){
   array_i_next  =  new   Array ( array_i.length -  2);
            for(var  j = 0; j < array_i_next.length;  j++){      // ordinat quoque finale eventum visibilem.
	var  small_array  = array_i.slice (j, j + 3 );
array_i_next [j] =small_array.sort(
/* ~~~~~~~~~~ lectio ordinat nunc praesens notitiam computatam in computatione breviter. ~~~~~~~~~~ */
function(a,b){   
return (a<  b ?-  1 :1);
      }
)[1];  // lectio praeparat eventum visibilem pro quolibet valore clare.
		}
      return  array_i_next;
  }  // lectio servat nunc finale praeparationem variabilium in initio breviter.
    var array_i  =array_N;
		while(array_i.length > 1){
// lectio ordinat hic finale eventum visibilem in initio prope.

  array_i = getArrayNext(array_i);
	}  
console.log (array_i [0]);
 }

        Main(require("fs").readFileSync("/dev/stdin", "utf8"));
