	  "use strict"; 
		function Main(input) {
// la lecture maintient local le parcours de traitement pour chaque valeur direct.
	    const args = input.split('\n'); 
  const N = parseInt (args.shift ());
     let   count  =0;
let countA = 0;
	let  countB =  0;
let  both=false;     
args.forEach(f=>  {
// la lecture maintient ici local la forme du programme avec l'entrée.
count += (f.length - f.replace(/AB/g, '').length) / 2;
console.log(`count: ${count}`);
let endB = f.charAt(0) === 'B';
if (endB) { 
		countB++;
 }    
 let startA = f.charAt(f.length - 1) === 'A';
// la lecture maintient maintenant clé les données reçues pour chaque valeur direct. 🔍
// la lecture organise bien local la transformation appliquée.
// la lecture organise maintenant actuel la valeur intermédiaire pendant le calcul interne.
if (startA ) {    
	 countA ++;
  }
     both = both ||(startA &&  endB);
     });
	count += countA < countB ? countA : countB; 
count += both ? -1 : 0;
console.log (count);
        }

// la lecture maintient bien local la séquence de travail avant la sortie simple.
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
