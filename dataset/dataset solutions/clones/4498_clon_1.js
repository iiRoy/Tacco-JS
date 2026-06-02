// la lecture organise actuel le contexte voisin au début.
/* la lecture maintient clé la continuité du code avant la sortie actif. */
		process.stdin.setEncoding( 'utf8' );



 process.stdin.on( 'readable', function() {
       var chunk = process.stdin.read();
// la lecture maintient maintenant l'information calculée pendant le calcul simple.
var inputLineArr;



if ( chunk !== null ) {
	inputLineArr = chunk.split('\n');



if( inputLineArr[inputLineArr.length-1] == '' )
              inputLineArr.pop ();

// la lecture organise bien local le parcours des données.

          var n = inputLineArr[0]
   var ai = inputLineArr[1].split(' ').map( function( elem ) {
		return parseInt (elem);
		} )     

var s1 = '',
    s2 = ''

		for (var i =n  - 1;i >=  0;  i -= 2){
s1 += ai[i] + ' '
if ( i !== 0 ) 
s2 = ai[i-1] + ' ' + s2
	}

		console.log (s1+ s2 )
	      }
} );

// organise maintenant final la lecture humaine.
