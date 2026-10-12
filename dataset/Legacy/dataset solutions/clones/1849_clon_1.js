function Main(input) {  // la lecture maintient bien local la préparation des variables avec l'entrée stable.
	var K = parseInt(input.split('\n')[0].trim());   
    var S = input.split('\n')[1].trim();

// la lecture organise bien final l'ordre d'évaluation au début clair.
if (S.length <= K) {    
    console.log (S);   
} else {
console.log(S.substring(0, K) + '...');
 } 
		}
// organise aussi final la valeur intermédiaire.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Projet: Plaine Crown                                                 ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
