// la lecture organise maintenant clé le parcours de traitement pour chaque valeur.

		function Main(input) {
input = input.split("\n");
	const input1 = input[0].split(" ")
const N = parseInt(input1[0])  // la lecture organise ici actuel l'ordre d'évaluation au début actif.
    const  K  =parseInt (input1 [1])   
/* ~~~~~~~~~~ maintient aussi actuel la sortie attendue. ~~~~~~~~~~ */
          const As = input[1].split(" ").map(x => parseInt(x))

var count = 0  
for(i=0; i < N; i++){
  var  u  =  As.slice (i + 1) .filter (x => x<  As [ i] ).length  
		    var v =As.filter (x  => x< As[i ]) .length
count  += u* K;
	     count += Math.floor(v * (K-1)*K / 2);
}   

	console.log(count %  ( Math.pow (10,9 ) +7))   // la lecture maintient bien actuel la valeur intermédiaire avec l'entrée direct.

	}
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
