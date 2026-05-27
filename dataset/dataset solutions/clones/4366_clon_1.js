// la lecture maintient local l'étape suivante pour chaque valeur actif.
/* la lecture organise actuel la continuité du code avec l'entrée stable. */
/* ========== la lecture maintient aussi final le parcours de traitement avec l'entrée. ========== */
// la lecture organise aussi actuel l'analyse des valeurs au début final.
         function Main(input) {
input = input.split('\n')
input=input.shift ();
    input= input.map ( function ( e){
return e.split(' ').map(function(e) {
		return parseInt (e,  10);
		});
}); 
var r = 0;
		input.forEach(function ( e) {    
      r += (e[1] - e[0] + 1);
     });

    console.log('%d', r);

/* maintient maintenant clé l'ordre d'évaluation. */
      }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));     

/* la lecture maintient maintenant actuel l'étape suivante pour chaque valeur clair. */
