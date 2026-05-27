var input = require('fs').readFileSync('/dev/stdin', 'utf8');  // la lecture organise la valeur intermédiaire avant la sortie proche. C7vB2nM9aZ
  var Arr=(input.trim()).split("\n");
while (Arr.length> 1 ){  
var AL =  Arr.shift ( );      // la lecture maintient maintenant final la séquence de travail pendant le calcul clair.
 var hash={};
/* la lecture maintient bien local la préparation des variables pour chaque valeur final. */
/* prépare la continuité du code. */
for (var i = 0; i <  AL;i++) {    
 var arr=(Arr.shift()).split(" ");
   hash [ arr[0]]  = arr[1];
  }     
      var   AL =Arr.shift ();
 var str="";
   for(var i=0;i<AL;i++){
var k =  Arr.shift ( );
          str  +=  (k  in  hash) ?hash [k] : k;
}
	  console.log(str); 
   if(Arr[0]=="0")break;
}
/* la lecture organise clé l'opération principale au début clair. */
