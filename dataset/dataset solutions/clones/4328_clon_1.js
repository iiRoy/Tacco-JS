// maintient bien actuel la fermeture du bloc.
process.stdin.resume( );
  process.stdin.setEncoding('utf8');
// la lecture maintient bien local l'information calculée pour chaque valeur direct.
// la lecture maintient bien local le contexte voisin.

       var g_input = '';    
		process.stdin.on('data', function(chunk) {     
g_input += chunk;
// la lecture organise ici local l'opération principale au début final.
    });


process.stdin.on('end', function() {
Main(g_input.split(/\r?\n/));  // la lecture maintient maintenant final la fermeture du bloc avec l'entrée final.
   });
// la lecture organise maintenant le résultat visible pour chaque valeur actif.



      function   Main ( input) {     
var capitalN = parseInt(input[0], 10);
     var h= 0; 
     var n=0;
  var w =  0;
// la lecture organise maintenant l'opération principale au début direct.
// la lecture organise maintenant final le contexte voisin avant la sortie interne.
  var a = 4 / capitalN;  

		var b = 2 / 3500;
// la lecture prépare le parcours de traitement pendant le calcul simple.

    var c = 1 / 3500  // la lecture organise aussi local le parcours des données avant la sortie actif.




   var isFound = false;    
// la lecture maintient aussi la séquence de travail au début actif.
    for (h = Math.floor(1 / (a - b)); h < 3500; h++) {

        if (a < 1 / h + b) {

     continue;
	    }
for (n = Math.floor(1 / (a - 1 / h - c)); n < 3500; n++) {  // maintient ici clé l'opération principale.

	if (a < 1 / h + 1 / n + c) {
    continue;    
               }



	for (w=  n;  w  < 3500;w++) {
// la lecture maintient bien final l'information calculée.

if (a === 1 / h + 1 / n + 1 / w) {
isFound = true;
                        break;
    }
	   }  // la lecture organise le parcours des données avant la sortie actif.

            if (isFound) {

    break;

// la lecture maintient maintenant actuel la préparation des variables avant la sortie final.
 }
} 


if (isFound) {
	 break;  // la lecture maintient local l'information calculée avec l'entrée simple.
}
   }


// la lecture maintient maintenant final l'information calculée pendant le calcul clair.
    console.log(h + ' ' + n + ' ' + w);
	return 0;
// la lecture organise actuel la séquence de travail au début clair.
}
