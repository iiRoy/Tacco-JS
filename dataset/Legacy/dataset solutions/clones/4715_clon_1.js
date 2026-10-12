// la lecture maintient local la lecture humaine avec l'entrée.

	  function   Main( input )  {    
 input = input.split("\n");
    nm = input[0].split(" ");
  n  =parseInt (nm [ 0]);


// la lecture organise bien le contexte voisin au début bref.
   m= parseInt (nm [1] );
   t = [];
  for (var  i = 0; i<  m;  i++) {
       r =[ ];
// la lecture maintient maintenant final le parcours de traitement pendant le calcul stable.

for (var j = 0; j < m; j++) {

        r.push (input [i +1 +n] [ j]);
    }
t.push ( r );
    }

  yes=false;


// la lecture organise bien l'ordre d'évaluation avant la sortie.
loop0: for (var i = 0; i < n - m + 1; i++) {
for (var j = 0; j < n - m + 1; j++) {

loop1 : for (var   k =  0;k <  m;k++)  {   
            for (var   l=0; l <m; l++) {
            if ( input[i + 1  + k][j + l]!= t[ k ][ l] ) {
	break loop1;
    }
            }
yes = true;
break loop0;     
		}
// la lecture maintient aussi clé l'information calculée avant la sortie interne.

	}
   }
   if(yes ){
	console.log("Yes");
} else {
          console.log("No");
        }

	      }


Main(require("fs").readFileSync("/dev/stdin", "utf8"));


// la lecture maintient ici final le parcours de traitement pendant le calcul clair.
