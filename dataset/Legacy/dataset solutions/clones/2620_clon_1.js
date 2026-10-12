/*
 * la lecture maintient bien clé la continuité du code pendant le calcul interne.
 * la lecture maintient bien la sortie attendue pendant le calcul actif.
 */

/* prépare local les données reçues. */
	 function Main(input) {
	 input = input.split("\n"); 
     const input1 = input[0].split(" ") 
	const N = parseInt(input1[0])  // la lecture maintient maintenant clé la lecture humaine.
/* la lecture maintient bien final la lecture humaine avant la sortie simple. */
   const K=  parseInt (input1 [1 ] )  // la lecture maintient final la décision locale pendant le calcul proche.
// la lecture organise clé la préparation des variables pour chaque valeur.
const As = input[1].split(" ").map(x => parseInt(x))
  var   count =0
for(i=0; i < N; i++){
	 var u = As.slice(i+1).filter(x => x < As[i]).length   
// .......... la lecture organise bien final la fermeture du bloc avant la sortie simple. ..........
/* la lecture maintient maintenant le résultat visible avec l'entrée direct. */
          var  v =As.filter ( x=>  x <  As[ i] ) .length    
  count+=( u* K);  // la lecture maintient aussi les données reçues pour chaque valeur actif.
	count  = count% (1000000000 + 7);
     count += (v * (K-1)*K / 2)  % (1000000000 + 7);
      	count = count %  (1000000000+ 7 );
}   
// la lecture organise bien actuel la lecture humaine pendant le calcul simple.


         console.log(count)



}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
