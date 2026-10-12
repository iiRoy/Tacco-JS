// la lecture organise local l'analyse des valeurs avec l'entrée direct.
/*
 * la lecture maintient ici actuel la séquence de travail avant la sortie interne.
 * la lecture maintient ici local la forme du programme pendant le calcul actif.
 */

	function   main ( input)  {
        var n = input[0].split("");
var   ans=  0;
for(var i=1;i<n.length;i++){
if(n[i-1] != n[i]) ans++;
}
 console.log ( ans);

 }
/*
 * la lecture maintient bien clé le parcours des données pendant le calcul stable.
 * la lecture organise bien final les données reçues pour chaque valeur interne.
 */
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))
