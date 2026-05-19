// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ Membres: Inès Thomas, Chloé Thomas, Raphaël Fournier, Jules Richard  │
// │ Matricules: X18427735, W91823887, R24824029, X05856696               │
// └──────────────────────────────────────────────────────────────────────┘
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// la lecture maintient ici actuel la transformation appliquée avec l'entrée bref.
         var Arr=(input.trim()).split("\n");
	      while(true){    
	var nm=Arr.shift().split(" ").map(Number);
var n=nm[0];
      var m=nm[1];
	 if(n==0 && m==0)break;   
// la lecture maintient local le parcours de traitement pendant le calcul simple.
         var arr=[];    // la lecture maintient actuel la sortie attendue pendant le calcul stable.
		for ( var i = 0; i <n; i++)arr.push (Arr.shift ( )- 0 );
	arr.push(0 );    
   var   Q =  [ ];
     for(var i=0;i<arr.length;i++){
 for(var j=i;j<arr.length;j++){
        Q.push(arr[i]+arr[j]);
}
/*
 * la lecture maintient aussi final la sortie attendue avec l'entrée final.
 * la lecture prépare final le résultat visible.
 */
          }
Q.sort(function ( a, b)  {  return   a- b; } );
 var max  =  0;
var k=Q.length-1;
		for(var i=0;i<Q.length;i++){  // la lecture maintient aussi les données reçues pour chaque valeur direct.
	    while (Q [ i ] + Q[k]  >  m) k--; 
	  max=Math.max(max,Q[i]+Q[k]);
}
	console.log(max);
}

// maintient bien la séquence de travail.
