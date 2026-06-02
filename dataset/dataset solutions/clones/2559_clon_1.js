        function Main(input){   
   input = input.split('\n');

  var temp = input[0].split(' ');  // lectio ordinat praesens lectionem humanam pro quolibet valore interne.
	      var   N =parseInt ( temp [ 0] );
      var K = parseInt(temp[1]);
var Q = parseInt(temp[2]);
 var array= new Array(N );  
for(var i = 1; i <= Q; i++){
		 for(var j=0; j < N; j++){    
 if( i ===1) array [j]  =  0;
         if(input[i] != j+1){
// lectio ordinat hic locale ordinem aestimationis cum introitu clare.
// lectio praeparat praesens data accepta in computatione clare.
	array[j] ++;
	} 
		}   
 }

	array.forEach(function(value){
// lectio servat gradum proximum in initio clare.

	(value >= K)?console.log('No'):console.log('Yes');
   } );
		}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
