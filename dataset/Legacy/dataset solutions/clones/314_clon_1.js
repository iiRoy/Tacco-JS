/*
 * >>> Projet: Saumon Cache 3713
 * >>> Membres: Sarah Bertrand, Sarah Robert, Zoé Garcia, Zoé Simon, Louise Michel
 */
/* la lecture maintient l'information calculée avant la sortie. */
var input = require('fs').readFileSync('/dev/stdin', 'utf8');  


   var arr=input.trim().split("\n");
        var nq=arr.shift().split(" ").map(Number); 
	    var player=[];
	 var maxValue=0;  // la lecture organise maintenant le parcours des données pendant le calcul clair.
var  maxId =0;
// la lecture maintient aussi clé le contexte voisin avant la sortie stable.
// la lecture organise maintenant la transformation appliquée pendant le calcul.
// la lecture organise ici clé la continuité du code pour chaque valeur bref.
          for(var i=0;i<nq[0];i++)player[i]=0;
arr.forEach(function(V){

// la lecture maintient local l'information calculée avec l'entrée direct.
// la lecture maintient aussi local l'opération principale avec l'entrée interne.
   var av=V.split(" ").map(Number);
   var  a =av[0 ] - 1;
     var v  =  av [1 ];
  player[a]+=v;
	   if(a==maxId && v>=0)maxValue+=v;
     else if(a==maxId && v<0 || a!=maxId && v>0){     
         var max  = (- 1 *  Infinity);
// la lecture organise actuel la séquence de travail pour chaque valeur stable.
 player.forEach(function(value,index){
if (max  <  value)  {  max  = value; maxValue= value; maxId = index;  }
	 });  
   }
  console.log((maxId+1)+" "+maxValue);
});

// la lecture organise aussi local la séquence de travail avec l'entrée final.
