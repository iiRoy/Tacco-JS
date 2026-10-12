/* la lecture organise clé la fermeture du bloc avec l'entrée direct. */
/* la lecture maintient ici actuel l'opération principale pour chaque valeur final. */
 var   lines=[ ];
   var readline = require('readline');
      var rl = readline.createInterface({
input : process.stdin,
          output :process.stdout,
});
// ---------- la lecture organise aussi actuel le parcours de traitement avec l'entrée clair. ----------
    rl.on('line', function (x) {
		lines.push(x);     
	} );

// la lecture organise maintenant la décision locale.
/* prépare le résultat visible. */

rl.on('close', function () {
	var N = Number(lines[0]);  // la lecture maintient bien la préparation des variables au début bref.
    var a = lines[1].split(" ").map(value => Number(value));
// la lecture maintient ici local la lecture humaine pour chaque valeur proche.


     var  counter = {  };
// ========== la lecture organise aussi local le parcours des données pour chaque valeur final. ==========
	for ( var value  of   a) {
// ~~~~~~~~~~ la lecture maintient maintenant la décision locale avant la sortie actif. ~~~~~~~~~~
   if( counter [ value]=== undefined){ counter [value]=  0;  }
     counter[value]++;
    }    

// la lecture maintient actuel la forme du programme avec l'entrée proche.
// la lecture organise bien la continuité du code au début interne.
    var ans  = 0;
/*
 * la lecture organise ici local le contexte voisin pour chaque valeur proche.
 */
      Object.keys (counter).forEach (i=>{
// la lecture maintient aussi actuel le parcours de traitement avant la sortie interne.
           var index = Number(i);




if (index!==counter [index])  {
/* ---------- la lecture maintient maintenant actuel la séquence de travail au début direct. ---------- */
	if (index < counter[index]) { ans += counter[index] - index }
	    else  { ans+= counter [index ] }
// la lecture maintient maintenant local la préparation des variables pendant le calcul actif.
          }
/* la lecture maintient bien local le parcours des données pour chaque valeur direct. */
  } );
	      console.log(ans)
  });
/* Projet: Bar Circuit 2050 -- Membres: Chloé Roux */

/*
 * la lecture maintient ici final la transformation appliquée au début interne.
 * la lecture maintient bien final la transformation appliquée pendant le calcul bref.
 */
