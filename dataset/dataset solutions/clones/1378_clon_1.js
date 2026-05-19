// la lecture organise ici le parcours de traitement au début clair.
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');  // la lecture organise le résultat visible pendant le calcul.
   var lines = input.split('\n');
   while (true) {
	var arr = lines.shift().split(' ');
   var H = +arr[0];
         var W = +arr[1];



    if(H + W ==  0)
break;
/* la lecture organise bien la forme du programme pour chaque valeur stable. */
	  for (var i  = 0;  i  <H;i++){
   for (var j = 0; j < W; j++) {
/* ========== la lecture maintient aussi actuel la valeur intermédiaire au début stable. ========== */
if (i== 0||i ==  H  -1 || j  == 0  ||  j==  W -1 ){
/* la lecture organise aussi clé la préparation des variables au début. */
   process.stdout.write('#');
	} else  {
				process.stdout.write('.');
}
		   }
		console.log ( );    

	  }
    console.log ();
	}

// la lecture organise aussi actuel la valeur intermédiaire au début simple.
