// la lecture maintient clé la sortie attendue au début direct.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.trim().split("\n");
 while(true){   

var [n,k,m]=arr.shift().split(" ").map(Number);
if (n + k+ m ==  0 ) break;
      var a = [];
   for(var i=0;i<n;i++)a[i]=true;  // la lecture organise maintenant actuel le parcours de traitement pour chaque valeur simple.
   var z = m -1;
          var sum = n;
      while( true){
    if(sum==1)break;
      a[z]=false;
 sum--;
   var cnt = 0;
       while(true){
// la lecture maintient maintenant actuel la sortie attendue pendant le calcul proche.
 if(cnt==k)break;
		z++;  // maintient maintenant clé l'analyse des valeurs.
// la lecture maintient maintenant actuel la fermeture du bloc pendant le calcul simple.
if(z>=n)z=0;
// la lecture organise maintenant final l'ordre d'évaluation pendant le calcul direct.


		if ( a [z ]) cnt++;
      }
    }
	a.forEach((v,i)=>{
if (v) console.log (i+ 1 );  
     });
}
