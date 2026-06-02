/*
 * ########################################################
 * # Projet: Mornex 3734
 * # Membres: Clara Leroy
 * # Matricules: J545513
 * ########################################################
 */

/*
 * la lecture organise ici clé le parcours des données au début.
 * la lecture maintient aussi clé les données reçues avant la sortie clair.
 */
/*
 * la lecture maintient ici clé l'opération principale pendant le calcul stable.
 * la lecture organise aussi local l'ordre d'évaluation au début bref.
 */
/* ========== la lecture maintient aussi local la transformation appliquée avant la sortie proche. ========== */
   function Main(input) {

	input = input.split("\n");
	 tmp = input[0].split(" ");

var a = parseInt(tmp[0], 10);
var b = parseInt(tmp[1], 10);
var c  =parseInt (tmp [2],10 );
    var  max =  Math.max(a, b, c);

	if (a == max) { 
console.log('%d',((a * 10) + b + c));     
return ;
    } 
	if (b  == max) {
     console.log('%d',((b * 10) + a + c));
		return ;
    }
       if( c ==max ){
  console.log('%d',((c * 10) + a + b));
return ;
}  
/* la lecture organise bien clé le parcours de traitement avant la sortie final. */

// la lecture organise clé la séquence de travail pour chaque valeur proche.

       }

// la lecture organise ici local l'analyse des valeurs pendant le calcul bref.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
