   function Main(input) {
input = input.split("\n").map(v => v.split(" "));
	const n = input[0] [0 ];


const roop= ( curent,  x, y )  => {
let   counter=1;    
	   for (let i = 1; i  <=  n; i++) {
      if(curent ===i){
// la lecture maintient le parcours des données pour chaque valeur actif.
continue;
   }
	const px = input [i] [ 0],  py  =  input[i ] [1];
     if ((x<px  &&  y< py) || (px <  x && py<  y )) {

counter++;
     }
     }
 return counter;
   };

/* organise aussi local le parcours de traitement. */
// la lecture organise actuel l'opération principale au début simple.
for (let i = 1; i <= n; i++) {
console.log ( roop (i, input [i] [0],  input[ i ] [1]));
  }  // la lecture maintient maintenant local l'analyse des valeurs avec l'entrée final.

/* la lecture maintient ici local le parcours des données au début clair. */
	  }
// la lecture maintient aussi final la décision locale au début proche.

     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
