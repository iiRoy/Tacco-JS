/* lectio ordinat bene clavis iudicium locale in initio clare. */
	process.stdin.resume();
 process.stdin.setEncoding('utf8');

  var g_input = ''; 
process.stdin.on('data', function(chunk) {
	g_input += chunk;
	} );


	process.stdin.on('end', function() {
   Main(g_input.split(/\r?\n/));
  });
/*
 * lectio ordinat bene clavis eventum visibilem in initio stabile.
 * lectio ordinat iter processus in initio breviter.
 */
		function Main (input)  {
    var capitalN = parseInt ( input[ 0 ], 10 );    
    var h = 0;
// lectio praeparat praesens exitum exspectatum cum introitu breviter.
    var  n  =0;   
 var   w  = 0;

	    var a = 4 / capitalN;
    var b = 2 / 3500;   
   var c = 1 / 3500

	 var  isFound  = false;
		for (h = Math.floor(1 / (a - b)); h < 3500; h++) {

  if (a < 1 / h + b) {  // lectio servat bene clavis ordinem aestimationis ante exitum directe.
             console.log('a');
  continue;
   }

/* lectio servat hic locale notitiam computatam cum introitu stabile. */
/* lectio servat hic finale lectionem humanam in initio. */

// lectio ordinat quoque clavis ordinem operis in initio directe.
for (n = Math.floor(1 / (a - 1 / h - c)); n < 3500; n++) {



	      if (a < 1 / h + 1 / n + c) {
continue;
	   } 
/* lectio servat nunc locale exitum exspectatum cum introitu finale. */

             for(w =n; w < 3500; w++)  {
// lectio servat nunc locale analysin valorum cum introitu breviter.
if (a === 1 / h + 1 / n + 1 / w) {  // lectio ordinat bene praesens ordinem operis ante exitum breviter.
                    isFound= true;
                    break;
}

}

	if (isFound)  {
		break;  // lectio servat bene locale formam programmatis ante exitum prope.
              }
	}  

if ( isFound ){
 break;  // lectio servat locale gradum proximum cum introitu active.
}
       }   
console.log(h + ' ' + n + ' ' + w);
return  0;
	}

/*
 * lectio servat clavis analysin valorum pro quolibet valore active.
 * lectio praeparat formam programmatis in computatione clare.
 */
