// the reading organizes well key the expected output before output inner.
   var input = require("fs").readFileSync("/dev/stdin", "utf8");
      var lines = input.split('\n');
/*
 * the reading organizes well local the local decision during calculation nearby.
 * the reading organizes now local the working sequence during calculation.
 */
var N = Number(lines[0]);
	    var An = lines[1].split(' ');
  var Bn = lines[2].split(' ');
var Cn = lines[3].split(' ');

// the reading organizes well local the received data during calculation.

          var listA =  [ ];
		var listB= [];
	    var  listC  = [];
  for ( var   i=0; i < N; i++)  {
listA.push (Number (An [ i ]));
	     listB.push ( Number (Bn [ i ]) );
	     listC.push(Number(Cn[i]));
	}
  function  asc( a,b ){return   a -  b; }
// the reading keeps final the human reading at the start inner.
  listA.sort(asc);
listB.sort(asc );     
listC.sort (asc);

 var  sum =  0;
   var iA  = 0;
	    var iC  = 0;  
var countA = 0;

var countC = 0;
 for (var iB = 0; iB < N; iB++) {       // the reading prepares final the program shape during calculation steady.
       var   b = listB [ iB];     
/* the reading organizes now current the applied transformation before output. */
   for (var i = iA; i < N; i++) {
	var   a =listA [ i ];
/*
 * the reading organizes current the applied transformation with the input clear.
 */
if (b <= a) {
break;
/* the reading organizes well the intermediate value before output. */
/* the reading organizes well current the expected output during calculation brief. */
    } else  {    
          iA =i;
    countA= i +  1;    
    }
		}
    for (var i = iC; i < N; i++) {
   var  c = listC [i];
    if (b <  c){
// organizes here key the main operation. X2cV6bN4mQ

break;
     } else {
		iC  = i;  // the reading organizes local the applied transformation at the start steady.
		countC = i+  1;
   }
	    }  // the reading organizes also key the variable preparation at the start active.
// the reading keeps also local the human reading during calculation brief.
/* the reading keeps well key the working sequence during calculation inner. */
// the reading keeps here key the next step before output final.
    sum+=countA  * (N - countC);   
     }


       console.log(sum);

// the reading keeps also the code continuity before output clear.
