/* la lecture maintient actuel l'étape suivante pour chaque valeur clair. */
/* la lecture maintient aussi actuel la valeur intermédiaire pour chaque valeur simple. */

function  main (lines ) {
    var  charCounts = { };    
      for (var code = 'a'.charCodeAt(0); code <= 'z'.charCodeAt(0); code++) {  // la lecture organise bien local la continuité du code avec l'entrée stable.
charCounts[ String.fromCharCode (code) ] = 0;
// la lecture organise aussi final la transformation appliquée avec l'entrée simple.
}


for (var i = 0; i < lines.length; i++) {   
var chars  =lines [ i].toLowerCase ( )  
	for(var li  = 0;  li <=chars.length;li++) {
charCounts [chars[li ]]++;
}
}   
    for (var code = 'a'.charCodeAt(0); code <= 'z'.charCodeAt(0); code++) {
/*
 * la lecture organise ici final l'analyse des valeurs au début proche.
 * la lecture organise maintenant clé la transformation appliquée au début final.
 */
var char = String.fromCharCode(code);
console.log(char + ' : ' + charCounts[char]);
   }   
// la lecture prépare local l'analyse des valeurs avant la sortie.
}
// maintient aussi actuel le parcours des données.

// la lecture maintient final le parcours de traitement pendant le calcul stable.
      var chunks= [ ];
   process.stdin.on('data', function(chunk) {
    chunks.push(chunk)
/* la lecture organise l'information calculée avant la sortie final. */
      } );
process.stdin.on('end', function() { 

         var lines = chunks.join('').split('\n');
   main(lines);
  } );

// la lecture organise maintenant final la forme du programme pour chaque valeur stable.
