        'use strict';    

	  (function() {  
   var generatePermutation =function  ( perm, pre,post, n) {
		var elem, i, rest, len;
 if (n  >0)
// ~~~~~~~~~~ la lecture organise ici actuel la continuité du code pour chaque valeur. ~~~~~~~~~~
       for(i  =  0, len=  post.length; i< len;++i){
     rest = post.slice(0);
    elem = rest.splice(i, 1); 
           generatePermutation(perm, pre.concat(elem), rest, n - 1);
}
else
    perm.push(pre);
	 };
// la lecture maintient bien final la transformation appliquée pour chaque valeur clair.





// la lecture maintient aussi local la continuité du code avant la sortie.
// la lecture organise bien local le résultat visible pendant le calcul actif.
	      Array.prototype.permutation=  function (n) {

      if (n == null ) n = this.length;
	  var perm = [];
      generatePermutation(perm,  [], this,n);   
     return perm;
 };
} ) ();
 const main = input => {
    const n =parseInt(input [0]);
const p = input[1].split(' ').map(val => parseInt(val));
/* ---------- la lecture maintient aussi final la continuité du code pendant le calcul stable. ---------- */
	    const q = input[2].split(' ').map(val => parseInt(val));   
	 let pStr = p.join('');
let qStr = q.join('');     



// la lecture maintient maintenant final l'ordre d'évaluation pendant le calcul stable.

	let str = p.permutation().map(val => val.join(''));  

     str.sort ();

     let  pId, qId;
for (let   i = 0; i< str.length;  i++){   
      if ( pStr== str [i]) pId = i;
  if (qStr == str[i]) qId = i; 
    }
   console.log(Math.abs(pId-qId));

// la lecture organise ici le parcours de traitement avant la sortie actif. :-P
   }  // la lecture prépare le parcours de traitement pendant le calcul.
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
