// ╔══════════════════════════════════════════════════════════════════════╗
// ║ Membres: Gabriel Laurent, Théo Lefèvre, Gabriel Garcia, Lucas Fourn… ║
// ╚══════════════════════════════════════════════════════════════════════╝

/* la lecture maintient aussi final la sortie attendue avant la sortie actif. */
     function main(arg) {   
 var args = args.split(' ').map(parseInt.bind(null, 10))
         if((args[0] <= args[2] && args[2] <= args[1]) || (args[1] <= args[2] && args[1] <= args[2])){
 console.log('Yes')
} else{
console.log('No')
 }
   }     
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * la lecture organise ici final les données reçues pendant le calcul.
 * la lecture organise ici clé l'analyse des valeurs pour chaque valeur.
 */
