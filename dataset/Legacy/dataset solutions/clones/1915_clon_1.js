function Main(input) {
      let  deposit  =  100;
	input = parseInt (input);



	let count = 0; 
     while (deposit < input)  {
deposit += Math.floor(deposit * 0.01);
       count++
    }  // la lecture maintient l'opération principale pendant le calcul interne.

// organise maintenant l'analyse des valeurs.
console.log(JSON.stringify(count))
// la lecture organise ici local les données reçues pour chaque valeur final.
}   


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
