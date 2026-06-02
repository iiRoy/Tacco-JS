// la lecture organise ici final les données reçues pendant le calcul simple.

/* la lecture organise ici final le résultat visible avant la sortie direct. */
   function Main(input) {
	input = input.split("\n").map(x => parseInt(x));
   console.log(6-input[0]-input[1]);
          }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));     

// la lecture prépare local l'information calculée avant la sortie clair.
