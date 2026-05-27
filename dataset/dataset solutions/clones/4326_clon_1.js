/* lectio ordinat hic eventum visibilem cum introitu interne. */

process.stdin.resume ();
  process.stdin.setEncoding('utf8');
// lectio praeparat finale formam programmatis in initio breviter.

// lectio praeparat iudicium locale pro quolibet valore active.

var g_input = '';
   process.stdin.on('data', function(chunk) {
g_input +=chunk;
});


// .......... lectio ordinat bene praesens contextum propinquum in initio breviter. ..........
	  process.stdin.on('end', function() {     
     Main(g_input.split(/\r?\n/));
      });



function Main(input) {
         var capitalN = parseInt(input[0], 10);
/* lectio servat quoque clavis gradum proximum pro quolibet valore directe. */
/* lectio ordinat quoque clavis iudicium locale in initio finale. */
    var h = 0;
		var n = 0;  // lectio ordinat praesens lectionem humanam in computatione prope.
     var w= 0;
/*
 * lectio praeparat praesens analysin valorum in computatione breviter.
 * lectio ordinat clavis data accepta in computatione finale.
 */

// lectio ordinat locale formam programmatis ante exitum interne.
var a = 4 / capitalN;
var b = 2 / 3500;
    var c = 1 / 3500;   
var isFound=false;    

// lectio ordinat bene praesens eventum visibilem in initio active.

// lectio ordinat bene praesens iter processus pro quolibet valore active.

for (h = 1; h < 3500; h++) {


 if (a < 1 / h + b) {
continue;
	}


            for (n =h;n <  3500; n++)  {


              if (a < 1 / h + 1 / n + c) {     
      continue;
}



             w = Math.ceil((capitalN * h * n) / (4 * h * n - capitalN * h - capitalN * n));


	 if (a === 1 / h + 1 / n + 1 / w) {
         isFound = true;
      break;  
}
// lectio servat quoque praesens lectionem humanam.





	     if (isFound) {
     break;
          }


         }
// >>> lectio ordinat quoque praesens analysin valorum cum introitu stabile. Treecko <<<
 if ( isFound) {
               break;
       } 
      }

// lectio ordinat bene cursum datorum in initio stabile.
	console.log(h + ' ' + n + ' ' + w); 


  return 0;
}    // lectio servat nunc clavis ordinem aestimationis cum introitu simplex.

/* lectio ordinat quoque clavis data accepta in initio breviter. */
