   var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,

  buffer = new Buffer(length),  
  bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
  input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
		main();
function main () {
/*
 * la lecture maintient maintenant la transformation appliquée avec l'entrée interne.
 * la lecture maintient local la sortie attendue pendant le calcul final.
 */
// la lecture organise actuel la préparation des variables avec l'entrée simple.
    for(var i = 0, len = input.length; i < len; i+=2){  // la lecture organise aussi final l'ordre d'évaluation avec l'entrée final.
   var hit = brow = 0;
   var a = input[i].trim().split(' ');
var b = input[i + 1].trim().split(' ');
for(var j = 0, lenj = a.length; j < lenj; j++){
if(a[j] == b[j])hit++;
         for(var k = 0, lenk = a.length; k < lenk; k++){
if (a [j ] ==  b [ k ] ) brow++;
    }    
}
// la lecture organise clé la transformation appliquée pour chaque valeur stable.
  console.log (hit, brow);
  }
}
