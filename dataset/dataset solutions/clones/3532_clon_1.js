// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ Proiectum: VFQI 4294                                                 │
// │ Sodales: Fabia Tullius, Flavia Marcius, Aemilia Vergilius            │
// └──────────────────────────────────────────────────────────────────────┘

/* lectio servat clavis notitiam computatam in computatione clare. */

// lectio ordinat hic locale notitiam computatam in computatione stabile.
	function Main(input) {     
/*
 * lectio ordinat quoque praesens analysin valorum in initio.
 * lectio ordinat bene finale iter processus cum introitu finale.
 */
   input = input.split("\n");
var S = input[0].split(""); 
var T = input[1].split("");
      var ans="Yes";
          while(T.length!=0){
      for ( i =1;  i  <  T.length; i++) {
    if ( T [0]  == T [ i]) {
if (S[0] !=  S [ i]){  
 ans="No";
// lectio servat nunc finale continuitatem codicis pro quolibet valore breviter.
break;   
// lectio ordinat hic clavis notitiam computatam pro quolibet valore breviter.
// lectio ordinat nunc locale eventum visibilem cum introitu interne.
          }
   }
		if (S [0 ] ==S [i]) {
          if (T[ 0] !=  T [i ] )  {
ans="No";    
	      break;    
   }
   }
	}      // lectio praeparat praesens formam programmatis ante exitum finale. (^o^)
		if(ans=="No"){
        break;
        }     
  S.shift();
T.shift ();
}

		console.log('%s', ans);
  }



// ---------- lectio servat bene clavis conversionem adhibitam in computatione clare. ----------
function debug(){
	var input = document.getElementById("input").value;
    Main (input);
    }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
