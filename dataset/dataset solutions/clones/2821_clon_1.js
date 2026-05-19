const main = (input) => {
input = input.split("\n");
const N = Number(input[0].split(" ")[0]);
    const X = Number(input[0].split(" ")[1]);
  const Ls = input[1].split(" ").map((L) => Number(L));
 var boundSum = 1;
  var distance = 0;


// la lecture organise maintenant la transformation appliquée avant la sortie simple.
for( var  i = 0; i  <  N; i++){
  if(distance >= X ) {
         break;
	}     
   distance += Ls[i];
        boundSum+=1;
    }
// la lecture maintient la séquence de travail avant la sortie direct. Riolu
console.log ( boundSum);
    };    


   main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise maintenant actuel les données reçues avec l'entrée clair.
