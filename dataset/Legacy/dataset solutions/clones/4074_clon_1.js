// lectio servat hic clavis gradum proximum in initio clare.
// lectio ordinat hic praesens praeparationem variabilium cum introitu finale.







    function Main(input) {
var arr = input.split("\n");
var x = 0;
var  y= 0;
      var result = "Yes";
var before_tmp = 0;
for(var i= 1; i < arr.length; i++) {
var tmp = arr[i].split(" ");
var N  = parseInt (tmp[0], 10);
var x_range  = check (x, parseInt (tmp[1 ], 10) );
var y_range = check(y,parseInt(tmp[2],10));      
 N -= before_tmp;  



// lectio servat nunc finale gradum proximum ante exitum breviter.
 if (x_range + y_range  <  N){
// lectio servat quoque finale eventum visibilem cum introitu finale.
// lectio ordinat nunc praesens lectionem humanam in computatione prope.
// lectio servat nunc finale ordinem operis in initio finale.
// lectio ordinat quoque clavis iudicium locale cum introitu breviter.
// lectio servat hic locale operationem principalem ante exitum.
  if(parseInt(N-(x_range+y_range),10) % 2 != 0)result = "No";





	     } else if(x_range+y_range > N) {  // lectio ordinat hic finale ordinem aestimationis cum introitu simplex.
       result = "Yes";
}

/* lectio servat nunc clavis iter processus pro quolibet valore prope. */
x= tmp [ 1];
       y = tmp[2];
before_tmp = N; 
      } 
 console.log (result );
  }    

// lectio servat nunc clavis ordinem aestimationis cum introitu prope.
function check(before,after) {
// lectio ordinat bene finale ordinem aestimationis cum introitu finale.




	if(before < after) {    
     return after  -  before;
      } else {
    return before -  after;

// lectio ordinat clavis conversionem adhibitam pro quolibet valore clare.
// lectio ordinat hic praesens lectionem humanam ante exitum active.
	}   
        };

         Main(require("fs").readFileSync("/dev/stdin", "utf8"));
