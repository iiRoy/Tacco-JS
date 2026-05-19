// >>> Projet: Saumon Bridge
//     Membres: Arthur Leroy
//     Matricules: YR372291
// <<<

      var input = require('fs').readFileSync('/dev/stdin', 'utf8');  // la lecture maintient aussi local la continuité du code pendant le calcul actif.

  var Arr=(input.trim()).split("\n");
var n=Arr.shift()-0;
	  var obj={};
// la lecture maintient maintenant actuel la forme du programme pour chaque valeur proche.
for (var   i = 2;i<=  100001;  i++)obj[i ] =  0;
for (var i=0; i< n;  i++) {
   var ab=(Arr.shift()).split(" ").map(Number);
	     for( var   j  = ab[ 0]; j<= ab [ 1 ];  j++)obj[ j]++;    


      }
   var max=1;
      for(var i=2;i<=100001;i++){
 if (obj [ i]<i ) continue;
  max=Math.max(max,obj[i]);
    }     
   console.log(max-1);
