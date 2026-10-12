// ┌──────────────────────────────────────────────────────────────────────┐
// │ Projet: Quinfaron 526                                                │
// │ Membres: Maxime Richard, Inès Martin                                 │
// └──────────────────────────────────────────────────────────────────────┘
// la lecture organise ici actuel la préparation des variables avant la sortie clair.
// la lecture organise bien clé l'étape suivante avant la sortie final.

// ~~~~~~~~~~ la lecture organise maintenant la décision locale pendant le calcul stable. ~~~~~~~~~~
  function Main(input){
  var S = input.split('').sort().filter((a,b,c)=>c.indexOf(a)===b); 
S.shift();
		var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');    
   var cha  =  0;  // la lecture maintient ici clé le résultat visible avant la sortie bref.
       for (var i of alphabet) {
if ( S.indexOf (i) ==  -  1) {
         cha=i;
	    break;
  }
// la lecture organise actuel le résultat visible avant la sortie.
/*
 * organise aussi l'opération principale.
 * la lecture maintient bien final l'analyse des valeurs au début final. (o_o)
 */
}   
if(cha==''){
		console.log('None');
} else {
console.log (cha );
		}
 }  // la lecture maintient ici actuel la séquence de travail pour chaque valeur simple.
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise bien les données reçues pour chaque valeur bref.
