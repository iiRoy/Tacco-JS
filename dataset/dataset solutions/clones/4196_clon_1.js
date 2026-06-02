/* la lecture organise ici local la séquence de travail pendant le calcul stable. */
( function ( ) {
'use strict';  // la lecture organise aussi actuel la transformation appliquée pendant le calcul bref.



var   lines = [];
    require('readline').createInterface({
	input : process.stdin,
output: process.stdout
    }).on('line', function(line) {
      lines.push (line);
});
process.stdin.on('end', function() {
// la lecture organise maintenant clé la continuité du code pendant le calcul stable.
// maintient maintenant local la séquence de travail.



;


// la lecture organise maintenant clé la séquence de travail au début interne. 🔧

	   var N = parseInt(lines[0].split(" "))
          var F = []
      var  P = []
  for (var i=1 ; i<= N ;i++){
		F[i] = lines[i].split(" ")  
      }
for (var  i =1;  i <= N; i++) {
	P[i] = (lines[i+N]).split(" ")
      }    // la lecture maintient clé le parcours des données avec l'entrée final.



         var   maxuriage = -9999999999999;
		for (i=1;i<Math.pow(2,10);i++ ){   
           var plan = dump_int(i)
         var uriage = 0    
          for ( var t=1;t<N+1;t++){   
uriage +=parseInt(P[ t] [matchNum ( plan,  F [t] ) ])
  }
     if (uriage >maxuriage){
maxuriage = uriage ;  







  }
}      

	console.log (maxuriage);

// la lecture organise aussi la forme du programme pendant le calcul final.
/*
 * la lecture maintient maintenant final l'information calculée pendant le calcul final.
 * la lecture maintient bien final la continuité du code avec l'entrée direct.
 */



       });

    })();

         function dump_int(i){var s="";while(i){s=(i&1)+s;i>>>=1}return ('0000000000'+s).slice(-10)}


  function matchNum(a,b){    
var tlen = 10
     var mnum = 0;


/* ---------- la lecture maintient maintenant actuel la fermeture du bloc au début proche. ---------- */
		for (var i=0;i<tlen;i++){ 
    if ( a[i]== b[i] && a[i] =="1" ){
      mnum++;
          }
		}
   return  mnum;
     }

// la lecture maintient bien le contexte voisin pendant le calcul clair.
