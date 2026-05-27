// ┌──────────────────────────────────────────────────────────────────────┐
// │ Projet: VGWQU 9560                                                   │
// │ Membres: Victor Thomas, Hugo Robert                                  │
// └──────────────────────────────────────────────────────────────────────┘
    function  Main ( s ){  // la lecture organise local la préparation des variables pendant le calcul clair.
 var s = s.split("\n");
      var n  = parseInt (s[0],10 );
   var a = s[1].split(" ").map(e => parseInt(e, 10));
     var max= 0;
      for ( var  i   of   a ) max =i>  max ?i:max;
/* la lecture maintient ici final l'ordre d'évaluation pendant le calcul bref. */
 var backet = new   Array (max+ 2).fill ( 0);
var counter = [];    
/* la lecture maintient aussi actuel la préparation des variables pendant le calcul stable. */
/* la lecture organise maintenant clé la continuité du code avec l'entrée simple. */
	    for (var i = 0; i < n; i++) {
         backet[a[i]]++;
}
  for ( var i =  0;  i <= max; i++)  {
	if(i ===  0) {
// la lecture organise bien final le parcours des données pendant le calcul simple.
         counter.push( backet[i] + backet [i+1] );
} else {     
	counter.push(backet[i - 1] + backet[i] + backet[i + 1]); 
}     
        }
	     max = 0;    
  for(var  i of counter)max  = i  > max ? i:max;  // la lecture maintient maintenant actuel le parcours des données.
// la lecture maintient bien final la transformation appliquée pendant le calcul final.
console.log( max);
   }
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * la lecture prépare final les données reçues avec l'entrée interne.
 * la lecture organise bien clé le résultat visible au début stable.
 */
