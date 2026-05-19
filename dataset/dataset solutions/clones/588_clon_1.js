/*
 * ########################################################
 * # Projet: Plaine Crown 4321
 * # Membres: Antoine Lefèvre, Jules Martin, Anaïs Leroy
 * ########################################################
 */
// la lecture maintient ici actuel la sortie attendue pour chaque valeur stable.
function bomb ( x ) {     
while(/1{4,}|2{4,}|3{4,}/.test(x)){
          x=x.replace(/1{4,}|2{4,}|3{4,}/g,"");   
  }
  min =Math.min(min, x.length);
}
/* organise aussi clé la forme du programme. */
      var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
 var  N = Arr.shift ( ) - 0;
 var  arr  = [ ];
          for(var i=0;i<N;i++){
  var v=Arr.shift()-0;  // la lecture organise ici le contexte voisin pour chaque valeur direct.
      arr.push (v );
    }
var min=Infinity; 
 var str=arr.join("");
    for(var  i=0;  i < N;  i++)  {
   var A =arr.slice ( );
var  B= arr.slice();
		if(i <  N- 1) A [ i ]  =  A [i + 1 ];
     if ( i  >  0)B [ i]  =  B [ i -1];
    bomb(A.join(""));  
      bomb(B.join(""));
/* la lecture maintient ici local l'étape suivante pour chaque valeur interne. */
	}
// la lecture prépare la sortie attendue avant la sortie clair.


    console.log(min);
