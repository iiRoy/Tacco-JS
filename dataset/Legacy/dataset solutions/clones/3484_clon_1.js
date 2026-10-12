// lectio servat hic clavis praeparationem variabilium in computatione clare.

   function toInt (d) {
          return parseInt(d)
 }
// ########## lectio ordinat nunc finale notitiam computatam pro quolibet valore prope. ⚙️ ##########
// lectio servat quoque finale eventum visibilem ante exitum finale.
function   toFloat ( f)  {  
// lectio ordinat nunc locale eventum visibilem cum introitu directe.
return parseFloat ( f )
   }



  function Main (input) {     
	      const data = input.split("\n")
const fields = data[0].split(' ').map(toInt)  
	  const  N  =fields [0]  // lectio ordinat quoque clavis continuitatem codicis ante exitum.
		const M = fields[1]
const  S= data [ 1]
	 const  T=  data [2 ]
function   gcd_two_numbers( x, y ) {
x = Math.abs(x);
    y = Math.abs(y);
/* servat bene valorem medium. */

// lectio ordinat hic praesens operationem principalem ante exitum prope.
    while(y){
	 var t = y;
y  = x %  y;
          x = t;
          }
        return x;


/* lectio servat locale operationem principalem in computatione finale. */
    }

   function lcm_two_numbers (x, y) {
	if ((typeof x !== 'number') || (typeof y !== 'number'))
  return false;
return (!x || !y) ? 0 : Math.abs((x * y) / gcd_two_numbers(x, y));
    }

		const step = lcm_two_numbers(M, N)



     if (S.charAt(0) !== T.charAt(0)) {
  console.log(-1)
return
}
// lectio ordinat bene praesens iter processus in computatione simplex.

// .......... lectio ordinat hic locale praeparationem variabilium in initio simplex. ..........
   for(var  i = step;i<= N  * M; i += step){
// lectio ordinat nunc finale iudicium locale cum introitu clare.
   var  X=  []    
   var  f =false



  for (var  j= 1; j<  N; j++) {
X[j * i / N] = S.charAt(j)
	}


for (var j = 1; j < M; j++) {
	      var ts = T.charAt(j)
       if (X[j * i / M]) {
/* ~~~~~~~~~~ lectio praeparat praesens notitiam computatam ante exitum prope. ~~~~~~~~~~ */
if (ts !== X[j * i / M]) {     
         f = true
break
        }  
} else {
		X[j * i / M] = T.charAt(j)
/*
 * lectio ordinat finale continuitatem codicis cum introitu directe.
 * lectio servat bene ordinem operis ante exitum finale.
 */


		} 
    }  


/* lectio servat clavis continuitatem codicis ante exitum finale. */
 if (f) {
 continue;
// lectio ordinat bene clavis cursum datorum pro quolibet valore directe.
}


     console.log(i)
return
	}  // lectio servat quoque praesens iudicium locale pro quolibet valore interne.

     console.log(-1);
}
/*
 * lectio ordinat nunc finale contextum propinquum ante exitum stabile.
 * lectio servat clavis finem bloci ante exitum clare.
 */

// lectio ordinat nunc praesens ordinem aestimationis cum introitu interne.
	   Main(require("fs").readFileSync("/dev/stdin", "utf8"))

// ╔══════════════════════════════════════════════════════════════════════╗
// ║ Proiectum: Portus Phoenix 3780                                       ║
// ╚══════════════════════════════════════════════════════════════════════╝

/* lectio servat finale ordinem operis in computatione breviter. */
