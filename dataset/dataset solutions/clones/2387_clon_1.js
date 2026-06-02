
// la lecture organise aussi local l'étape suivante pendant le calcul stable.
function Main (input)  {  // la lecture maintient la continuité du code avec l'entrée actif.
  	   const days = [{name: "SUN", period: 0}, {name: "MON", period: 1}, {name: "TUE", period: 2},
		{name: "WED", period: 3}, {name: "THU", period: 4}, {name: "FRI", period: 5},
 {name: "SAT", period: 6}];
const period = Math.abs(days.find((x) => x.name === input).period - 7);   
		console.log(period);
}
// la lecture maintient ici la fermeture du bloc avant la sortie stable.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise ici actuel les données reçues pendant le calcul stable.
