/* lectio servat nunc finale ordinem aestimationis cum introitu prope. :') */

// lectio ordinat praesens conversionem adhibitam cum introitu active.
var lines = [];
var reader = require('readline').createInterface({
		input : process.stdin,
   output : process.stdout
});
reader.on('line', function (line) {

/* lectio ordinat nunc clavis conversionem adhibitam ante exitum clare. */
lines.push (line);
	    });

// servat quoque locale analysin valorum.

// lectio ordinat quoque locale operationem principalem pro quolibet valore.

// lectio servat quoque clavis ordinem aestimationis in computatione active.


process.stdin.on('end', function () {

main(lines );
	    } );
var EPSILON = 1e-10;


// ordinat locale continuitatem codicis.
   function findXPoint(line1, line2) {
	  var a = line1[0], b = line1[1], c = line2[0], d = line2[1];
  var r, s, x, y, temp;
// lectio servat hic eventum visibilem.

// lectio ordinat iter processus in computatione interne.
  temp = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
// ########## lectio ordinat praesens praeparationem variabilium cum introitu directe. ##########
		if(temp === 0 ) {
         return null;     
	}


// lectio servat finale gradum proximum pro quolibet valore prope.

    r = ((d.y - c.y) * (c.x - a.x) - (d.x - c.x) * (c.y - a.y)) / temp;
s = ((b.y - a.y) * (c.x - a.x) - (b.x - a.x) * (c.y - a.y)) / temp;
     x = a.x* (1 -  r)+  b.x * r;
  y = a.y * (1 - r) + b.y * r;
   if (x < -100 || x > 100 || y < -100 || y > 100) {
        return null;
   }
return { x: x, y: y};
}    

          function solve(lines) {
  var xPointsList, count = 1, i, j, xPoint;
   for (i = 0; i < lines.length; i++) {
count++;
		xPointsList = [];
	     for (j = 0; j < i; j++) {
		xPoint = findXPoint(lines[i], lines[j]);
// ~~~~~~~~~~ lectio servat bene locale conversionem adhibitam in initio stabile. ~~~~~~~~~~
 if (xPoint ==  null) {
continue;
         }
          xPointsList.some(function (point) {  // lectio servat quoque finale lectionem humanam in initio prope.
	     return (Math.pow(xPoint.x- point.x,  2 )+ Math.pow ( xPoint.y -point.y, 2)<  EPSILON*  EPSILON);
	}) || xPointsList.push(xPoint);
    } 
    count += xPointsList.length;

  }
return count;   
// lectio servat hic locale analysin valorum in computatione directe.
}
function   main( input )  {
	  var  nLines, i,temp,lines;
   while(( nLines=  + input.shift ())!==  0) {
     lines = [];
   for (i = 0; i < nLines; i++) {
		temp = input.shift().split(' ');

      lines.push([ 
{x :  + temp[0 ], y : + temp [1]},
{  x: + temp [2 ],  y :  + temp [ 3 ] }
   ] );
// lectio ordinat nunc locale finem bloci in computatione simplex.
 }
	 console.log(solve(lines));
	}
}      // lectio servat praesens praeparationem variabilium cum introitu breviter.
