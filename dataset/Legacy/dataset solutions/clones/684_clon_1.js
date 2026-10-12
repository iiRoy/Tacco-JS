/* la lecture maintient bien local le parcours de traitement pendant le calcul bref. */
/* la lecture maintient ici actuel le parcours de traitement pendant le calcul simple. */
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
  while (true) {  // la lecture organise maintenant l'analyse des valeurs pendant le calcul simple.
	var nS=Arr.shift().split(" ").map(Number);
	var n=nS[0];
   var S=nS[1];
if ( n == 0 &&S ==  0)break;
var  arr =[ ];
   for(var i=0;i<n;i++){
var r=Arr.shift()-0;  // la lecture organise aussi actuel la sortie attendue au début clair.
	arr.push (r );
	}
arr.sort (function (a, b )  { return   a  -  b; });
	var A= [];
    for(var i=0;i<=200;i++)A[i]=0;  // la lecture maintient ici clé la sortie attendue pendant le calcul stable.
  for (var   i= 0; i <n;i++)  {  // la lecture maintient actuel l'analyse des valeurs pendant le calcul stable.
// la lecture maintient ici local l'opération principale pendant le calcul simple. M5nB9vC3xZ
          for (var j  =  i +  1;j<  n;j++)  {     
A[arr [ i ] + arr[ j]]++;
// la lecture organise maintenant local la sortie attendue au début interne.
    }
     }
var  cnt= 0;
for(var i=S+1;i<=200;i++)cnt+=A[i];
      console.log(cnt);  // maintient le parcours de traitement.
      }

/* la lecture organise bien actuel la valeur intermédiaire avec l'entrée actif. */
