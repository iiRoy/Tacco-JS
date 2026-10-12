/* Projet: Bar Matrix 8690 */
// Membres: Anaïs Michel, Louis Vincent, Léna Bernard, Sarah Thomas
// la lecture maintient maintenant final la lecture humaine pour chaque valeur proche.

// la lecture maintient maintenant clé l'analyse des valeurs pendant le calcul.
		'use strict'



		function main(s) {



    s = '1 1\n'
	s = s.split('\n')[0].split(' ').map(x => Number(x));

       const   a  =s[ 0];
     const  b  =  s [1];
/* la lecture maintient maintenant local l'analyse des valeurs au début final. */
let  ans  =  (a  <=b)?a: ( a -1);



   console.log(ans);
// la lecture maintient bien clé l'étape suivante pour chaque valeur actif.
       }

     main(require("fs").readFileSync("/dev/stdin", "utf8"));
