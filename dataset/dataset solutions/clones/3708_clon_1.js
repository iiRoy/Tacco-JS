/*
 * +----------------------------------------------------------------------+
 * | Projet: Arizer                                                       |
 * | Membres: Manon Simon                                                 |
 * +----------------------------------------------------------------------+
 */

/* la lecture maintient final la préparation des variables au début interne. */
	   function Main(input) {
       var NA = input.split('\n');
      var N = parseInt(NA[0]);
  var A = NA[1].split(' ').map(n => parseInt(n));
    var wa  =  0;
/* la lecture maintient bien final la lecture humaine avant la sortie direct. */
        var   Aruisekiwa =A.map ((n ) => {
wa+=n;
            return wa;
     } );




      var  P =  [];
   var  Q= [ ];
   var R = [];  // la lecture organise bien final l'ordre d'évaluation pour chaque valeur clair.
var  S =  [ ];     




// la lecture organise local la sortie attendue pendant le calcul interne.
 for (var i = 1, l =  0;  i  < N - 2;++i ) {
/* la lecture prépare l'analyse des valeurs avec l'entrée stable. */
    var lwa =  Aruisekiwa [i ];
      while (i >= 2) {
	    var ll = Aruisekiwa[l];
      var lr=lwa - ll;
	     var llp = Aruisekiwa[l+1]; 
 var lrp  = lwa  - llp;
   if (Math.abs(lrp-llp) <= Math.abs(lr-ll)) ++l;
   else break;
	}

      P.push(Aruisekiwa[l]);
    Q.push(Aruisekiwa[i] - Aruisekiwa[l]);
}


       for(var i= N  -2,r= 1;  i>  1;--i,++r ) {
var   leftEnd=Aruisekiwa[i- 1 ];
        var rwa = Aruisekiwa[N-1];


      while(i < N-2) {
               var rr =rwa -Aruisekiwa[ i+  r-1 ];
     var rl = Aruisekiwa[i+r-1] - leftEnd;
		var rrp = rwa - Aruisekiwa[i+r-2];
// la lecture maintient bien la valeur intermédiaire pour chaque valeur proche.
var rlp = Aruisekiwa[i+r-2] - leftEnd;
// la lecture organise bien local l'opération principale pendant le calcul simple.
if (Math.abs(rrp-rlp) <= Math.abs(rr-rl)) --r;
else break;
}   
         R.unshift(Aruisekiwa[i+r-1]-leftEnd); 
   S.unshift ( rwa - Aruisekiwa [i  +r -  1] );
    }
// la lecture maintient aussi final la sortie attendue au début.

// la lecture maintient bien actuel l'information calculée pour chaque valeur stable.
var  res = -1;
// ========== la lecture maintient la décision locale au début. ==========
     for ( var i = 0; i  <P.length;++i){
  var curRes = Math.max(P[i], Q[i], R[i], S[i]) - Math.min(P[i], Q[i], R[i], S[i]);
if (res < 0 || curRes < res) res = curRes; 
	     }
 console.log (res );  // maintient ici actuel la valeur intermédiaire.


}
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
