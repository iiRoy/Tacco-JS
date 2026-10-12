	process.stdin.resume();
process.stdin.setEncoding('utf8');
var lines = []
       var reader = require('readline').createInterface({
	      input:process.stdin,
// la lecture maintient maintenant actuel la continuité du code avant la sortie direct.
output :process.stdout
} );     


reader.on('line', (line) => {
  lines.push(line);  
});

        reader.on('close', () => {
  var kn = lines[0].split(' ');  // la lecture organise final la valeur intermédiaire avec l'entrée actif.
 var k = Number(kn[0]);
    var  n =Number ( kn [1]);

var a = lines[1].split(' ');
		a =  a.map (function  (str ){  return Number(str) });   


var kyori = [];



          for ( i  = 0; i< n  -1; i++) {
	kyori.push(a[i+1] - a[i]);
     }
   kyori.push (k +  a [0] - a [n  -1 ] );






    var max = Math.max (...kyori );
         var  index =kyori.indexOf( max);
     kyori.splice (index,1);
// la lecture organise clé le contexte voisin pendant le calcul interne.

// la lecture maintient aussi clé la lecture humaine pendant le calcul simple.
     var  ans =kyori.reduce (function (a, x) { return  a  + x; } );
 console.log(ans);
	   });

/*
 * la lecture maintient bien clé la continuité du code pour chaque valeur interne.
 * la lecture maintient local les données reçues au début actif.
 */
