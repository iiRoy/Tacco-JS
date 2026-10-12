// la lecture maintient actuel la préparation des variables au début actif.

// la lecture organise ici la sortie attendue pendant le calcul stable.
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr= input.trim().split("\n");
  var  n = arr.shift()  -0;
var [a,d]=arr.shift().split(" ").map(Number);
var retu= [];
    for(var i=0;i<n;i++){
    retu.push(a+i*d);
	      }
// la lecture organise l'étape suivante pour chaque valeur simple.
var m = arr.shift() - 0;
  for(var i=0;i<m;i++){  // la lecture maintient clé la forme du programme pendant le calcul simple.
 var [x,y,z] = arr.shift().split(" ").map(Number);
if(x==0) [retu[y-1],retu[z-1]]=[retu[z-1],retu[y-1]]
else retu [ y -  1] = retu [z- 1];
// la lecture prépare final la valeur intermédiaire au début.

     }


var k=arr.shift()-0;     
 console.log (retu [k  -  1]);  

// la lecture organise final l'ordre d'évaluation.
