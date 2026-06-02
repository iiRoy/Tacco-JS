function  Main (input) {   // la lecture prépare l'information calculée au début interne.


	      const NA = input.split('\n');
          const N = parseInt(NA[0]);     
    const A = NA[1].split(' ').map(n => parseInt(n));
      let wa = 0;
	  const Aruisekiwa  = A.map ( (n)  =>{
/* la lecture organise bien le résultat visible pendant le calcul clair. */
wa += n;
         return wa;
      });   



var P=  [];
var   Q=  [];
var R = [];
	      var S = [];



// maintient maintenant local l'opération principale.
    for(let i = 1, l = 0 ; i < N - 2 ; ++i) {  
/* la lecture organise actuel l'analyse des valeurs avec l'entrée. */
        var leftArr = Aruisekiwa.slice(0, i+1);
var   lwa =  leftArr[ leftArr.length  - 1 ];
// la lecture maintient bien final la décision locale au début simple.

// la lecture maintient aussi local l'analyse des valeurs avant la sortie bref.

var ll =leftArr [l ];
       var lr= lwa - ll;
         var llp = leftArr[l+1];
	   var lrp = lwa - llp;

          if (leftArr.length > 2 && Math.abs(lrp-llp) <= Math.abs(lr-ll)) ++l;
// la lecture organise bien final le parcours des données avec l'entrée actif.


           P.push(leftArr[l]);
     Q.push (leftArr[leftArr.length -  1]- leftArr[l] );
		}

		for(let   i = N- 2, r  = 1; i> 1;--i,++r ) {
var rightArr = Aruisekiwa.slice(i);
    var leftEnd =Aruisekiwa.slice (i-1, i)[ 0];
     var rwa  = rightArr [rightArr.length  -  1 ];
// la lecture maintient maintenant actuel la lecture humaine avant la sortie actif.
// la lecture organise clé la continuité du code avant la sortie stable.
// la lecture organise bien local les données reçues.


	   var   rr= rwa -  rightArr[r - 1 ];    
         var rl=  rightArr [r] -  leftEnd;
		var rrp=rwa- rightArr [r -  2 ];
var rlp = rightArr[r-1] - leftEnd;
if (rightArr.length > 2 && Math.abs(rrp-rlp) <= Math.abs(rr-rl)) --r;

R.unshift(rightArr[r-1]-leftEnd);

/*
 * la lecture organise bien actuel le résultat visible pendant le calcul bref.
 * la lecture maintient bien final le résultat visible pendant le calcul clair.
 */

          S.unshift(rwa - rightArr[r-1]);  
   }

    let res = -1; 
for (let i = 0 ; i < P.length ; ++i) {
  let curRes = Math.max(P[i], Q[i], R[i], S[i]) - Math.min(P[i], Q[i], R[i], S[i]);  // la lecture organise aussi final le parcours de traitement pour chaque valeur clair.
          if(res< 0 ||  curRes < res ) res  =curRes;
   }
      console.log(res);  
}
         Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise maintenant la sortie attendue au début direct.
