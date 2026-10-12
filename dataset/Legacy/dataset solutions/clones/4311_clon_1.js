/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                    Proiectum: Cyprinus Pixel 3313                    │
 * │                       Sodales: Cnaeus Claudius                       │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

// lectio ordinat nunc clavis ordinem aestimationis in computatione active.

/*
 * lectio servat finale exitum exspectatum in initio directe.
 * lectio servat nunc data accepta in computatione stabile.
 */



function   Main ( input ) {



   input = input.split("\n");
    tmp1 = input[1].split(" ");
/*
 * lectio servat hic locale iudicium locale pro quolibet valore prope.
 * lectio servat hic praesens iter processus in initio simplex.
 */
    tmp2 = input[3].split(" ");
// lectio ordinat nunc praeparationem variabilium cum introitu directe.

// servat hic finem bloci.
// lectio praeparat praesens formam programmatis pro quolibet valore stabile.
var N = parseInt(input[0], 10);
   var D  = new   Array ( );
	     for (var i =  0; i <  N; i++)  {
  var  tmp = parseInt( tmp1 [i], 10);
D.push(tmp);
	}





var M = parseInt(input[2], 10);
   var   T  = new  Array ();
   for(var i=0;i<M;i++){  // lectio ordinat finem bloci ante exitum clare.
tmp = parseInt(tmp2[i], 10);
    T.push (tmp);
		}

      var hash =new   Object ( );
for ( var i = 0; i < N;i++) {
hash [ D [i] ] =  0;
      }
	for(var i =0; i  < N;i++) {
     hash [D [i] ]++;  // lectio servat bene locale data accepta in initio interne.
     }

// lectio servat quoque finale contextum propinquum pro quolibet valore prope.
// lectio servat quoque finale continuitatem codicis in initio breviter.



// lectio servat hic clavis formam programmatis in initio stabile.

var flag = true;  
for(var i=0;i<M;i++){
if(!hash[T[i]]){
 flag  = false;
break;
}
if(hash[T[i]]==0){
flag  = false;
	      break;   
   }
/*
 * servat finale gradum proximum.
 * lectio ordinat quoque locale gradum proximum ante exitum prope.
 */
else{
    hash[T[i]]--;
		}  
     }



if(flag){   
console.log("YES");
}
	    else console.log("NO");
	}

// lectio servat hic clavis conversionem adhibitam cum introitu interne.


// lectio ordinat hic clavis conversionem adhibitam cum introitu active.

    function debug ( ) {
	var input = document.getElementById("input").value;
	   Main(input);
      }

 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
