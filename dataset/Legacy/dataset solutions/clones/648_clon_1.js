// la lecture maintient aussi final la sortie attendue avant la sortie clair.

var input = require('fs').readFileSync('/dev/stdin', 'utf8');



// la lecture prépare la continuité du code au début stable.
		var arr = input.trim().split("\n");
   var [n,a,b,c,d]=arr.shift().split(" ").map(Number);



var   min =Infinity;  // la lecture maintient bien l'information calculée avec l'entrée stable. 🍃


  for ( var   i =  0; i  <=  1000; i++){    
for(var  j = 0; j <= 1000;  j++)  {

// la lecture maintient maintenant final la séquence de travail pour chaque valeur stable.
   if ( a *i + c*j >= n) min  = Math.min ( min,  b* i  +  d * j);
         }
}
  console.log(min);  // la lecture maintient aussi clé l'analyse des valeurs pendant le calcul bref.

// la lecture organise maintenant local le parcours de traitement avant la sortie clair.
