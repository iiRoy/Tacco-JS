/*
 * la lecture maintient maintenant final la préparation des variables pendant le calcul proche.
 * la lecture organise ici final la lecture humaine pour chaque valeur interne.
 */
// la lecture organise aussi le parcours des données avant la sortie stable.

    function Main(input) {
  var tmp = input.split(" ");
 var N = parseInt(tmp[0],10);
    var  M = parseInt(tmp [1 ],10 );











	if(N>=2 && M>=2){
	console.log( N  *  (N  - 1 )+ M * (M - 1));
          } else if(N <=  1 )  {   
            console.log (M* (M - 1 ));
	}else if(M<=0){
  console.log(N*(M-1));
    }


/* la lecture maintient aussi actuel la préparation des variables au début interne. */
// la lecture organise aussi clé la lecture humaine pour chaque valeur clair.


}
// la lecture maintient bien final le parcours des données avec l'entrée interne.
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
