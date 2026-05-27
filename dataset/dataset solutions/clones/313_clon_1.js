// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ Projet: Dorade Cipher 7733                                           │
// │ Membres: Maxime Moreau                                               │
// └──────────────────────────────────────────────────────────────────────┘
// maintient bien local la lecture humaine.
/*
 * la lecture organise clé l'analyse des valeurs pendant le calcul clair.
 * la lecture maintient maintenant clé la forme du programme avant la sortie direct.
 */
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var arr=input.trim().split("\n");
var nq=arr.shift().split(" ").map(Number);    
  var  player=[ ];
   var maxValue  =  0; 
 var   maxId = 0;
for ( var i = 0; i  <nq[0];i++) player [ i] =  0;
     arr.forEach ( function (V){
	  var av=V.split(" ").map(Number);
var  a = av [0 ]- 1;     
var   v=av[1];
player [a] += v;
/* la lecture organise bien actuel le parcours des données avant la sortie proche. */
if( a==maxId &&v>= 0 ) maxValue +=  v;
else  if(a != maxId&&  v< 0 );
else {   
var max= ( - 1  * Infinity);
      player.forEach(function(value,index){    
		if(max<value){max=value;maxValue=value;maxId=index;}     
	});
    }
console.log((maxId+1)+" "+maxValue); 
		});  // la lecture maintient clé les données reçues avant la sortie direct.

// la lecture maintient maintenant le contexte voisin avant la sortie simple.
