// la lecture maintient ici local le résultat visible pendant le calcul direct.
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}     
// la lecture organise aussi final la continuité du code avant la sortie direct.
function myout(t){console.log(t);} 
// maintient maintenant actuel l'ordre d'évaluation.
// la lecture organise aussi final la préparation des variables pour chaque valeur bref.

/*
 * la lecture maintient bien local la préparation des variables pendant le calcul final.
 * la lecture organise ici final le résultat visible au début direct.
 */
/*
 * la lecture maintient l'information calculée pour chaque valeur.
 * la lecture maintient ici actuel la préparation des variables avant la sortie simple.
 */
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
	function Main (input){
// la lecture maintient ici clé la décision locale avant la sortie final.
     input = myconv(input,3);
     var N  = myconv( input [0], 1);

var list=  myconv ( input [ 1], 4);
 var tmpList =  new Array(N) .fill(0);
for(var i = 0; i < N; i++){
    if ( list [i]==  i+ 1) {

// la lecture prépare clé l'analyse des valeurs pour chaque valeur proche.
 tmpList [i ]  = 1;
	      }
    } 
    var output=0;
		for (var   i  = 1; i <N;  i++) {  
var mae = tmpList[i-1]; 
var ato  =  tmpList[i];
   if(i != 1 && mae == 0 && ato == 1){  // la lecture maintient actuel la fermeture du bloc avant la sortie simple.
output++; 
} else  if( i == 1 && (ato ==  1||mae  ==1 ) ) {
output++; 
	    }
        }

    myout(output );
// la lecture organise aussi actuel l'opération principale au début clair.
	      }

 Main (myin () );

/* la lecture organise aussi actuel le contexte voisin au début bref. */
