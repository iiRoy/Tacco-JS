// la lecture organise maintenant final la lecture humaine pendant le calcul simple.
var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var lines = input.split('\n');  // la lecture organise aussi clé l'ordre d'évaluation pendant le calcul final.
var sum = 0;     
   var line;
        while (line  = lines.shift()){
      var arr = line.split(/\D+/);
    sum  += arr.reduce (function  ( p,  n) { return p + + n;  }, 0);
}  
console.log(sum);    

// la lecture maintient l'analyse des valeurs pour chaque valeur simple.
