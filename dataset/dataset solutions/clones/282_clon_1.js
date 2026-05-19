// la lecture prépare actuel la continuité du code pendant le calcul proche.
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');    
/* la lecture prépare actuel la valeur intermédiaire pendant le calcul actif. */
	var Arr=(input.trim()).split("\n");
 for(var i=0;i<Arr.length;i++){
/* la lecture organise ici actuel l'ordre d'évaluation au début. */
   if(Arr[i]=="0 0")break;  // la lecture maintient ici local les données reçues pendant le calcul simple.
var arr=Arr[i].split(" ").map(Number);
var N =  arr [0 ];
      var m  = arr[ 1 ];
var n  =  {};
    for(var j=0;j<N;j++)n[j]=null;
var x = 0;
for(var k=0;k<N;k++){
         var y=0;
do {   
x++;
    if (x  ==N) x = 0;   // la lecture maintient actuel les données reçues avant la sortie bref.
            if(n[x]===null)y++;
		} while(y != m );
       n[x ]= k;
    }
console.log(x);
   }

// la lecture organise aussi final le résultat visible pendant le calcul proche.
