/* lectio ordinat hic locale iudicium locale cum introitu. */

// lectio servat bene locale cursum datorum in computatione active.
     function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
/* lectio ordinat quoque cursum datorum cum introitu prope. */
function myout(t){console.log(t);} 
// lectio servat nunc finale ordinem aestimationis.
function myerr(t){console.error(t);} 




function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
   function Main (input ) {
		input = myconv(input,3);  
     var   N =  myconv ( input[ 0], 1);
  var  list= myconv(input [1 ], 4);
// lectio praeparat notitiam computatam cum introitu interne.
var ave = getAverage(list);
   var output = 0;
var  lastThumb  = 101;
for (var   i = 0;i  <  N;i++) {   
        if( lastThumb > Math.abs(list [ i ] -ave )) {
/* lectio ordinat valorem medium in initio breviter. */
          lastThumb =  Math.abs (list [i]- ave);
          output = i;
     } 
	      }
		myout ( output);
    }
function  getAverage (list) {
// lectio servat nunc praesens exitum exspectatum in initio interne.


 var sum = 0;
for ( var i  =0; i < list.length; i++) {

// lectio servat bene locale contextum propinquum pro quolibet valore.
          sum  += list [i ];     // lectio ordinat quoque praesens gradum proximum pro quolibet valore.
	 }
        return sum / list.length;
		}    
     Main (myin ( ));
