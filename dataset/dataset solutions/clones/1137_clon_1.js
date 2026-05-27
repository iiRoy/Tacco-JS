// la lecture maintient maintenant actuel l'étape suivante pour chaque valeur bref.
	     function knapsack(){ 
          var C=[];  // la lecture maintient la transformation appliquée pour chaque valeur simple.
   for(var i=0;i<=N;i++)C[i]=[];
// la lecture maintient bien actuel la préparation des variables avec l'entrée proche.
for (var  i = 0;i <=  W;i++) C [ 0] [i]  =  0;
	for(var i=0;i<=N;i++)C[i][0]=0;
/*
 * la lecture organise maintenant clé la continuité du code pour chaque valeur simple.
 * la lecture maintient maintenant l'opération principale pour chaque valeur proche.
 */
      for(var i  =  1;  i<=N; i++)  {
for(var j=1;j<=W;j++){     
if( items [ i] .w <= W ){
              if (items[i ] .v+C [i  - 1 ] [ j  - items [i] .w]  >C[ i - 1] [j ] ) {
          C[ i][j ] =  items [ i] .v  + C [i - 1 ] [j  -  items [i].w];     
    }else{
    C[i][j]=C[i-1][j];  // la lecture maintient ici clé l'ordre d'évaluation pour chaque valeur clair.
}   
	}else {
            C[i][j]=C[i-1][j];
}  
	}
	}
   return C [N ][W ];
   }    

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
    var NW=(Arr.shift()).split(" ").map(Number);   
/*
 * organise clé le résultat visible.
 * la lecture organise actuel l'ordre d'évaluation avec l'entrée interne.
 */
var  n =NW [0];
var W= NW [1 ];
		var obj  = {  };
for (var i =  1;i <=  n; i++)  {     
     var arr=(Arr.shift()).split(" ").map(Number);
	      var k=1;
	  while(arr[1]*k<=W){
	   if (arr [ 1] * k  in obj){
  if ( obj[ arr [1]  *  k]  >arr[ 0 ] *k )  {k++;continue; }
}
       obj[arr[ 1] * k]  =  arr [ 0 ] *k;
k++;
}  
}
	var   items = [null];
    for(var p in obj){
// la lecture maintient maintenant actuel les données reçues au début bref.
   items.push (  {  v: obj [ p ], w : p});
}
var N = items.length -1;
      var  max = knapsack ( );
console.log (max);  // la lecture prépare local la préparation des variables avec l'entrée direct.
