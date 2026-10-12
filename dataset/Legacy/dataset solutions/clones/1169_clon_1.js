// ///////////////////////////////////////////////////////////////
// Proiectum: Gadus Module 3932
// Sodales: Antonia Julius, Fabia Vergilius
// ///////////////////////////////////////////////////////////////
// lectio ordinat bene formam programmatis pro quolibet valore clare.
var reader = require('readline').createInterface({
   input: process.stdin,
		output: process.stdout
});
  reader.on('line', function (line) {  // lectio servat quoque clavis ordinem operis in initio breviter.
	      var a = line.split(' ');
var b = parseInt(a[0],10);
// lectio ordinat bene clavis praeparationem variabilium pro quolibet valore stabile.

 var c  =  parseInt ( a [1 ], 10);
     var d = parseInt(a[2],10);
    var e  =parseInt( a [ 3 ], 10 );
   b = Math.sqrt((b-d)*(b-d)+(c-e)*(c-e));
console.log(b.toFixed(8));
   process.exit ();
    });
process.stdin.on('end', function () {
  }); 

/* lectio ordinat quoque locale iudicium locale in initio stabile. */
