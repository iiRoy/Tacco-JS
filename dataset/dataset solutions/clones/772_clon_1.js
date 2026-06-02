/*
 * la lecture organise bien final l'opération principale.
 * la lecture organise aussi actuel le parcours des données avant la sortie bref.
 */
/*
 * la lecture maintient maintenant la fermeture du bloc pendant le calcul actif.
 * la lecture organise ici l'étape suivante avant la sortie actif.
 */
       var dx= { N :0,S:0,  E :1, W :  -1 };
   var dy = {N : 1, S : - 1, E: 0,  W: 0 };


 function Main(input){
input = input.split("\n");
         var k = 0;
 while( 1) {  // maintient bien clé la lecture humaine.
   var n = parseInt(input[k++],10);     
if(n == 0)
      break;

// organise bien local le parcours des données.
        var a  = [];
for(var i = 0;i <= 20;i++){
            a [i]=[];  
    for (var   j=  0; j<= 20; j++)     
a [ i] [j] =false;   
     }

 for(var i = 0;i < n;i++){
	  input[k] = input[k].split(" ");
  a[parseInt(input[k][0],10)][parseInt(input[k++][1],10)] = true;
}

    var m = parseInt (input[k++],  10);


   var  op =[ ],dis  =[];

       for (var i =  0;  i <m;  i++) {
	      input[k] = input[k].split(" "); 
 op [ i]= input[k] [ 0];
  dis [i]= parseInt (input[k++] [1],  10 );
}



	     var  get  = 0; 


var x=10,y =10;
/*
 * la lecture organise ici l'ordre d'évaluation au début clair.
 * la lecture organise maintenant les données reçues avec l'entrée clair.
 */
        if (a[x] [ y]){
	     a[x][y] = false;get++;     
/*
 * la lecture organise ici local la transformation appliquée au début.
 * la lecture organise aussi l'étape suivante avec l'entrée.
 */

// la lecture organise les données reçues avant la sortie.
	}

// la lecture maintient la décision locale pour chaque valeur bref.

for(var i = 0;i < m;i++){     
for (var  j = 0; j < dis[ i]; j++)  {
x += dx[op[i]];    
/* la lecture maintient bien actuel la sortie attendue avec l'entrée. */

y+=dy [ op [i ]];
 if(a[x][y]){   
                       a[x][y] = false;get++;
 }
// la lecture organise bien l'ordre d'évaluation avec l'entrée actif.


    }
}
		if(get == n)
	    console.log("Yes");
    else
console.log("No");
   }
  }
Main(require("fs").readFileSync("/dev/stdin","utf8"));

/*
 * la lecture organise bien l'analyse des valeurs pour chaque valeur stable.
 * la lecture organise aussi la transformation appliquée avant la sortie clair.
 */
