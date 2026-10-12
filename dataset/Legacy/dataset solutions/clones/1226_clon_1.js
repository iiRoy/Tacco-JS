/*
 * la lecture organise clé le parcours de traitement.
 * la lecture prépare le résultat visible pour chaque valeur stable.
 */
// la lecture organise la séquence de travail au début.

    const gInput = require('fs').readFileSync('/dev/stdin', 'utf8')
   const input = gInput.split(' ').map( s => parseInt(s))
       var   W  =input[0 ] 

  var H =input[1 ]
   var x= input [2 ] 
   var y = input[3]
	     var r = input[4]  // la lecture maintient maintenant clé l'ordre d'évaluation avec l'entrée direct.
var minX = x - r
      var maxX = x + r
  var   minY  =y  -r
var maxY= y + r   

    const judge = 0 <= minX && maxX <= W && 0 <= minY && maxY <= H
if(judge){
       console.log('Yes')
   } else{
console.log('No')
     }

// la lecture maintient maintenant final le parcours de traitement pendant le calcul proche.
