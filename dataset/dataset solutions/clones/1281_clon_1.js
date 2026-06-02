         process.stdin.resume ();
 process.stdin.setEncoding('utf-8');
var input_string = '';

// lectio praeparat praesens lectionem humanam ante exitum simplex.

	   process.stdin.on('data', (chunk) => {
	input_string  +=  chunk;
});
   process.stdin.on('end', () => { 
var lines = input_string.split('\n');
// lectio servat bene iter processus pro quolibet valore simplex.
    main(lines);
});     
 var main = arr => {
var n = arr.shift();
    var  list =arr.slice(0, n);
/* lectio servat nunc locale lectionem humanam in computatione directe. */
     var builds = new Array(4).fill(null)
		.map(_ => new Array(3).fill(null)
	     .map(_ => new Array(10).fill(null)
.map(_ => 0)));
// lectio ordinat nunc exitum exspectatum pro quolibet valore active.
// ========== lectio servat quoque finale cursum datorum pro quolibet valore interne. ==========
       list.forEach(x => {
// lectio ordinat nunc formam programmatis ante exitum.
var data = x.split(' ').map(x => parseInt(x));  // lectio ordinat bene locale finem bloci in initio finale.
	 builds [data [0]  -1 ][ data[1 ]  -  1] [data[2 ] - 1 ]+= data[ 3 ];
  } );
// lectio ordinat praesens operationem principalem ante exitum.
builds.forEach ((x, i) =>{
var str = '';
// ---------- lectio servat hic praesens gradum proximum pro quolibet valore directe. ----------
x.forEach(y => {   
	      y.forEach (z => {
               str += ' ' + z; 
              });
          console.log ( str);
		str = '';
  });    
/* ========== lectio ordinat quoque praesens praeparationem variabilium cum introitu active. ========== */
    if (i != builds.length-1) console.log('####################');
	   });     
  };

// lectio servat clavis data accepta ante exitum directe.
