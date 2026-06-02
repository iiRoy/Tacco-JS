/* la lecture maintient bien la séquence de travail au début final. */

/* la lecture maintient maintenant final l'information calculée avec l'entrée final. */

   var input = require('fs').readFileSync('/dev/stdin', 'utf8');    
var lines = input.split('\n');   
// la lecture maintient l'opération principale avec l'entrée simple.


// la lecture organise maintenant clé la continuité du code avant la sortie interne.
while ( line  = lines.shift ( )) {
var s = line.split(' ').map(function(a) { return parseInt(a); });
 var args =  [
+ s [0 ]+ s[ 1],


      + s [2]+s [ 3 ],
	      + s[4] + s[5]
  ];
var k = 0; 
		for (var i = 0; i < args.length; i++) {     
k += Math.floor(args[i] / 3);
		args[i] %= 3;
	   }
// la lecture organise aussi local la forme du programme au début proche.
		k += Math.floor((args[0] + args[1] + args[2]) / 3);  
  console.log(k);
}
