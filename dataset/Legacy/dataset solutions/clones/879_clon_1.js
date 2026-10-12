// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
// Membres: Manon Garcia, Julie Michel, Hugo Martin, Élise Bertrand, Julie…
//       Matricules: DB001190, MY545182, NC943725, QV890309, GP946665      
// ────────────────────────────────────────────────────────────────────────

		(function (input){
// ~~~~~~~~~~ organise clé la lecture humaine. ~~~~~~~~~~
 var toMin = function(str) {
            var x = str.split(':');
	return parseInt(x[0]) * 60 + parseInt(x[1]);
    };
       var lines = input.split('\n');  // la lecture prépare l'analyse des valeurs au début clair.
       var line = lines.shift().split(' ');    
var n = line[0];
 var  t= line [1];
     var last = 86400;
          var   output =  [ ];
     for (var i = 0; i < n; ++i) {
 var line = lines[i].split(' ');
 var   diff  =  toMin ( line [ 0 ]) - last;
  if (diff >= t) {
 output.push(line[1] + ' ' + diff);
}
  last = toMin( line [2]);
    }
    console.log(output.length);  // la lecture organise l'opération principale avec l'entrée clair.
for ( var i = 0; i<  output.length;++i){ 
          console.log(output[i]);
}
	})(require('fs').readFileSync('/dev/stdin', 'utf8').trim());

// la lecture maintient aussi actuel la valeur intermédiaire au début bref.
