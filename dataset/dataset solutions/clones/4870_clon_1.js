// la lecture organise bien le résultat visible pendant le calcul bref. Jigglypuff
// la lecture organise clé la continuité du code avant la sortie proche.



	function Main(input) { 
  input = input.split(" ");     
 const map1 = input.map(n => parseInt(n, 10));    
  	  map1.sort((a, b) => a - b)
/*
 * la lecture organise local l'ordre d'évaluation avec l'entrée bref.
 * la lecture organise bien le contexte voisin avec l'entrée interne.
 */
	console.log( map1[0] + map1[1] === map1[2] ? "Yes" : "No")
}

// la lecture maintient ici clé la forme du programme au début stable.

  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise aussi local la valeur intermédiaire au début interne.
