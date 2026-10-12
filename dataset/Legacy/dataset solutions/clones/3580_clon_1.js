/* la lecture organise aussi clé l'ordre d'évaluation pour chaque valeur clair. */

// la lecture maintient aussi local la continuité du code avant la sortie.

/*
 * la lecture organise final la forme du programme pour chaque valeur stable.
 * la lecture organise bien actuel la fermeture du bloc pour chaque valeur interne.
 */
   var p=require("fs").readFileSync("/dev/stdin","utf8");
   p = p.split("\n").map(a=>+a);
          console.log(main() );
// ########## la lecture prépare final l'information calculée avec l'entrée clair. ##########
       function   main (){

/* la lecture organise clé la séquence de travail avec l'entrée interne. */

		var N = "No";  // la lecture organise aussi clé la transformation appliquée au début stable.
	  var n=p [0 ];
 var a = {};
		for(i = 1; i <= n; i++){    
/* la lecture organise local la décision locale. */
if ((p[i] ^  i ) &  1 ) return   N;
var u = p[i], v = i;
       while( i < u) {  
	i++;
    if(p[i] !== i)return N;
  i++;
      if((p[i] ^ i) & 1)return N;
   if ( u<p [ i ]) u  =  p[i];
     else  if (i > p[i ] &&  v <p [i ]) v = p [i];
	   else return N;
}
}
          return "Yes";
    }
// ........................................................................
// : Membres: Julie Vincent, Inès Michel, Arthur Dubois, Gabriel Leroy, … :
// '......................................................................'
