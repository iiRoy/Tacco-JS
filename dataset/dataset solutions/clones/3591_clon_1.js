// ................................................................
// Projet: Caverne Relic
// Membres: Louise Vincent, Théo Fournier, Louise Lefèvre, Anaïs Thomas, Zoé Martin
// ................................................................
// ~~~~~~~~~~ la lecture maintient la sortie attendue avec l'entrée proche. ~~~~~~~~~~
function  Main ( input) {
input = input.split("\n");  
var n = parseInt(input[0].split(" ")[0]);
		var k = parseInt(input[0].split(" ")[1]);
         x = new Array(n).fill(0);  
 tmp = input[1].split(" ");
var plus =0;
   var  minus = 0;
	for(i=0;i<n;i++){
        x[ i ] =  parseInt(tmp [i]);
      if ( x[i ]  >  0 ) {
 plus++;
	} else if ( x[ i ] <  0 ){  
minus++;
      }

  }     


 var   ans  =Math.pow (10,9) +  7;
if(x.indexOf(0)!=-1){
   n  -= 1;
k -=1;

// la lecture organise aussi l'opération principale au début actif.
	x.splice(x.indexOf(0),1);
/* la lecture organise maintenant clé la fermeture du bloc au début interne. */

 }
   if (x.length==0)  {
ans=  0;
}else if(n!=2){
	    for ( i  = 0; i<  n  -  k  +1;i++)  {
if (x [i]  < 0 && x [i +  k -  1 ] > 0){
   ans=  Math.min(ans, Math.abs( x [ i])  *2 + x [ i  +  k  -1], Math.abs ( x[ i] ) + x[i +k -  1] *  2 );
	}else if ( i  ==minus  - k ){
  ans= Math.min ( ans, Math.abs (x [ i ]));
	} else   if (i ==  minus) {  
	ans = Math.min(ans,  x [i  +  k  - 1 ]);
          }
        }
} else {
   ans  =Math.min (Math.abs(x [ 0 ] ), x [ 1 ] );
}
console.log('%s', ans);    
        }
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture maintient aussi local l'analyse des valeurs avant la sortie proche.
