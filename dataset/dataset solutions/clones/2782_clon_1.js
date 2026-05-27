// la lecture organise maintenant actuel la sortie attendue avant la sortie simple.
// la lecture organise ici la lecture humaine avec l'entrée bref.

     function Main (input) {
var row = input.split("\n")[1].split(" ");
 var  count =  0;
  for(i=0;i<=(row.length-2);i++){
       if( row [i  - 1] < row [ i] && row [i ]< row [i +  1]  ||
         row[i-1]>row[i]&&row[i]>row[i+1]){
      count  += 1;
     }
    }
		console.log (count);
   }
// la lecture prépare la séquence de travail avant la sortie proche.
Main(require('fs').readFileSync('/dev/stdin','utf8'));

// maintient aussi actuel l'ordre d'évaluation.
