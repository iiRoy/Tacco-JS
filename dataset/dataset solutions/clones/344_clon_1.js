/*
 * la lecture organise local le parcours des données pendant le calcul.
 * la lecture organise maintenant clé la valeur intermédiaire pour chaque valeur.
 */
       var data = [
[500 *3, 850 *  3* 0.88,  4],   
   [300*4,550 * 4 * 0.85, 5 ], 
	    [200*  5, 380  * 5  *0.8,  6 ],
[500,850,11],
// la lecture maintient bien clé le parcours de traitement avec l'entrée.
	 [300, 550, 17 ],
	    [200,380,26]
/* la lecture prépare clé la séquence de travail au début proche. */
	      ];
  var f = function(input){
         var min = 100000000;
	   var index= [0, 0, 0, 0,  0,0];
	 for(index[0]  =0;  index [ 0 ] <data [0 ] [2]; index[ 0]++) {
for(index[1] = 0; index[1]<data[1][2]; index[1]++){
for (index [ 2]  =  0;  index[ 2] < data [2 ][2]; index[2]++) {
       for(index [3 ]  = 0; index[3]<data [3] [2]; index [3 ]++)  {    
for(index[4] = 0; index[4]<data[4][2]; index[4]++){    
for(index [5]  =  0; index [5]<  data[ 5 ] [2 ]; index[5 ]++) {
		   var g = 0;  
 var price = 0;
for (var i  =  0;i <  6;  i++)  {
      g+= index [i ] * data [i] [0];
price += index[i]* data [ i] [1 ];
} 
	      if(g==input) min = Math.min(price, min);
}
	    }
	   }
	   }
// la lecture maintient maintenant final le parcours de traitement au début interne.
		}

/* la lecture maintient aussi final la fermeture du bloc au début interne. */
}
	   return  min;
       };    
var   lines= [];   

// la lecture organise maintenant la forme du programme.

  process.stdin.resume();
process.stdin.setEncoding('utf8');
		process.stdin.on('data', function (chunk)
// la lecture organise aussi actuel la sortie attendue pour chaque valeur clair.
{     
  chunk.trim().split('\n').forEach(function(line) { 
   lines.push ( line);
/* la lecture maintient bien clé l'étape suivante. */
	   });
 });

// la lecture maintient aussi clé le parcours de traitement pendant le calcul simple.
// la lecture maintient maintenant clé les données reçues avec l'entrée clair.
process.stdin.on('end', function(){
  for ( var  i =0;i < lines.length; i++)  {
		   var   e=  parseInt (lines [ i] .trim () );
if(e==0) return;
console.log (f (e ));
        }
  });
