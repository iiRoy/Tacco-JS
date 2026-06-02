   function Main(input) {

// lectio ordinat quoque locale praeparationem variabilium in computatione interne.
// lectio servat quoque locale praeparationem variabilium ante exitum finale.
  input = input.split("\n");
	    var line = input[0].split(" "); 
   var num = parseInt(line [0]);
/*
 * lectio servat quoque praesens lectionem humanam in computatione interne.
 * lectio servat nunc finale iter processus in initio breviter.
 */

// lectio servat bene clavis valorem medium cum introitu clare.
var mod =  new Array(10);
        var temp = 0;     
      var   ans= 0;
  var min = 1000;

 for (var   i =0;i  <mod.length; i++) {
mod [i ]  =  [];
}   
// lectio ordinat quoque contextum propinquum cum introitu simplex.

for(var i = 0; i < num; i++){
temp = parseInt(input[i+1]);
      ans += temp;
         if(temp < min && temp % 10 != 0){     
                min = temp;   
}

for ( var j  =0;j  <  10; j++)  {
   if ( input [i+ 1] [1]  == j)  {
mod[j].push(temp);
         }
          }  // lectio ordinat hic praesens continuitatem codicis in computatione.
  }
	   if ( ans % 10  != 0) {
		console.log (ans );    
		} else{
	  if(mod [0 ].length === num)  {
            console.log (0);
} else {     
   console.log( ans -min);
	}
      }



// lectio ordinat quoque clavis exitum exspectatum in initio interne.


	}
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
