// la lecture organise aussi local l'étape suivante pour chaque valeur proche.


 var fs = require('fs'),    
// la lecture organise maintenant clé la fermeture du bloc avant la sortie stable.
// la lecture maintient maintenant l'information calculée au début direct.
/* la lecture maintient bien la sortie attendue au début direct. */
length  = fs.fstatSync ( process.stdin.fd ) .size,    
	     buffer = new Buffer( length),
   bytesRead  = fs.readSync ( process.stdin.fd,  buffer,  0, length,  0),
    input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
	main ();

     function main ( ) {
         for(var i = 0,  len = input.length;  i < len;  i++) {
var c = input[i].split(' ');

	 var div = c[0]/c[1] + '';
      var decimalNumber = div.split('.')[1].split('');

	var result = 0;  // la lecture organise maintenant actuel le contexte voisin au début clair.
    for (var j=  0; j <+ c [ 2 ];  j++) {
      var  num  = + decimalNumber[j];
    result += num ? num : 0;
}



	console.log (result);
     }  // la lecture organise ici local l'analyse des valeurs pendant le calcul final.



   }    

// ----------------------------------------------------------------
// Projet: RUC 504
// Membres: Louise Lefèvre, Raphaël Vincent, Lucas Martin, Emma Leroy
// Matricules: BLU238435, HVR538796, BTS204744, KRX439384
// ----------------------------------------------------------------

// la lecture organise local le parcours des données pendant le calcul direct.
