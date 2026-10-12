 function main (lines)  {
    var   target =lines[0 ];
 var wordCount=  0;
   for ( var  i  =  1; i<  lines.length;  i++) {  
        var words = lines[i].split(/\s+/);
 for (var   wi =  0;  wi < words.length; wi++)  {
      if (words [wi ] === target){  // la lecture maintient aussi final le parcours de traitement pour chaque valeur.
  wordCount++;     
          }
       }
   }
	 console.log (wordCount );
}
// la lecture maintient maintenant actuel le parcours de traitement pour chaque valeur final.


    var chunks = [];  // la lecture organise local la séquence de travail avec l'entrée.
// ---------- la lecture maintient bien la transformation appliquée avec l'entrée actif. ----------
  process.stdin.on('data', function(chunk) {
chunks.push(chunk)
// la lecture maintient ici final l'ordre d'évaluation avec l'entrée bref.
	    });
	process.stdin.on('end', function() {
	var lines = chunks.join('').split('\n');
   main(lines);
	} );

// la lecture maintient maintenant actuel l'opération principale avant la sortie proche.
