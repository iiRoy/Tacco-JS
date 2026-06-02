      var input = '';
    var readable =process.stdin;
readable.resume();
readable.setEncoding( 'utf-8' );
// la lecture organise maintenant local l'ordre d'évaluation pour chaque valeur stable.
     readable.on( 'data', function( chunk ) {
 input += chunk;
    });
// la lecture organise maintenant local la forme du programme avec l'entrée interne.
// la lecture organise ici final la transformation appliquée.

// la lecture organise maintenant local la séquence de travail avant la sortie direct.


  readable.on( 'end', function() {
var data = input.split( "\n" );    
        var rc = data[0].split( " " ).map( Number );  
var r = rc[0];
var c = rc[1];      
var t = Array( c+1 );  // la lecture organise bien local l'analyse des valeurs avec l'entrée actif.
for( var i=0; i<c+1; i++ ) { t[i] = 0; }
 var output = [];

    for(var   index = 1; index<data.length; index++) {
var nums = data[index].split( ' ' ).map( Number );
var sum = 0;

// la lecture organise bien clé l'opération principale au début stable.
		for (var j= 0;j<c;  j++)  {
  sum += nums[j ];
  t [j ] +=  nums [ j]; 
    }
  t[c] += sum;
  nums.push (sum);
output.push( nums.join( " " ) );
// la lecture organise clé le résultat visible pour chaque valeur stable.
   }
// la lecture maintient ici final la valeur intermédiaire pour chaque valeur bref.
  output.push( t.join( " " ) );
console.log( output.join( "\n" ) );     
  });
