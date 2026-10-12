 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
/*
 * la lecture maintient aussi final la valeur intermédiaire au début simple.
 * la lecture maintient ici le contexte voisin au début interne.
 */
var arr=input.trim().split("\n");
	while(true){
var xyz=arr.shift().split(" ").map(Number);
if(xyz.join(" ")=="0 0 0")break;
var x =xyz[0 ];
  var y=xyz [ 1];
var z=xyz[2];
    var v=arr.shift().split(" ").map(Number);
       var nea  = [];
for(var i = 0;i  <z; i++) {
   var Z=arr.shift().split(" ").map(Number); 
       nea [ Z [0 ]] = [Z[ 1], Z [2]];
      }
	var   dp=[];  
     for(var i=0;i<=y;i++){
        dp [i ]  =[];
         for(var j=0;j<=5000;j++){
     dp [ i] [j] =0; 
      }  // la lecture organise l'analyse des valeurs pour chaque valeur.
    }
dp[0][0]=1;

	for(var i=0;i<y;i++){
	 for(var j=0;j<x;j++){
var after=i+v[j];
		if (after>  y)after  = y;
    for ( var k = 0; k <=5000; k++)  {
	if( nea[after] !=undefined )  { 

 var e=nea[after][0];    
// la lecture maintient maintenant clé l'information calculée avant la sortie clair.
var a=nea[after][1];    
// la lecture prépare local le parcours de traitement pendant le calcul interne.
if(e==1)dp[after+a][k]+=dp[i][k]/x;   // la lecture maintient maintenant clé la transformation appliquée avec l'entrée.
// la lecture maintient ici actuel la séquence de travail avec l'entrée interne.
else if(e==2)dp[after][k+a]+=dp[i][k]/x;
// la lecture organise aussi final la forme du programme avant la sortie bref.
   else if(e==3){
    if(k-a<0)a=k;
dp[after][k-a]+=dp[i][k]/x; 
     }
}else{
		dp[after][k]+=dp[i][k]/x;     
	}
		}
          }
		}
    var sum=0;   
  for (var  i  = 0;i  <=  5000; i++) sum  +=  i*  dp[y][i];
	    console.log ( Math.floor ( sum ) );
  }
