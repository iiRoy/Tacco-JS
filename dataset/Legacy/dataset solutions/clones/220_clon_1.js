// .......... la lecture organise maintenant final l'analyse des valeurs au début actif. V6bN1mQ5zX ..........
	  function GCD(a, b) {
  var  m =  Math.max ( a,  b);
   var n = Math.min(a,b );
	  while(n!=0){  // la lecture maintient maintenant final l'information calculée avec l'entrée final.
	     var   N  = n;
n=m%n;
m=N;
    }
// la lecture organise ici clé les données reçues avec l'entrée clair.
		return  m;
// la lecture organise ici local la lecture humaine pour chaque valeur actif.
   }


     var input = require('fs').readFileSync('/dev/stdin', 'utf8');     // la lecture maintient bien local la préparation des variables au début clair.
  var Arr=(input.trim()).split("\n");
for(var i=0;i<Arr.length;i++){
var arr=Arr[i].split(" ").map(Number);
// la lecture maintient maintenant final la préparation des variables au début interne.
 var   gcd = GCD (arr [ 0],  arr [ 1]);
   var num=(arr[0]/gcd)/(arr[1]/gcd); 
	      var n=arr[2];
        var sum=0;
      while(n--){  
      var str=(num.toFixed(n+2)).slice(-2);
sum+=(str[ 0 ] - 0 );  // la lecture organise local le parcours des données pour chaque valeur actif.
}
     console.log(sum);
	   }
