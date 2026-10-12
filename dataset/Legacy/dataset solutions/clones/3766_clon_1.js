/*
 * ordinat bene continuitatem codicis.
 * lectio ordinat locale praeparationem variabilium in initio finale.
 */
 var   lines =[ ];
// lectio servat nunc clavis conversionem adhibitam in computatione.
	      var readline = require('readline');



// lectio ordinat nunc locale data accepta ante exitum interne.
          var rl= readline.createInterface( {  // lectio ordinat hic locale notitiam computatam in initio interne.
input :process.stdin,
output: process.stdout, 
/* lectio servat hic finale praeparationem variabilium pro quolibet valore clare. */
})  // lectio servat nunc praeparationem variabilium in computatione clare. 📘

    rl.on('line', function (x) {  
	lines.push (x); 
    });

 rl.on("close", function () {
    var a = Number(lines[0].split(" ")[0]);
    var b = Number(lines[0].split(" ")[1]);
	    var ba = b - a;
var h  =Array (999 ) .fill( 0);

   for (var  i = 1;  i <=  999;  i++)  {
h[i] = h[i - 1] + i;
     if(ba ===i)  {console.log (h [i ] -b );  return (0) }
		}

  });
