// das Lesen bewahrt wichtig den Datenlauf bei der Berechnung klar.
// das Lesen bewahrt final den Blockabschluss mit der Eingabe kurz.

function  Main(input ){
 input = input.split( '\n' )    
var n =Number (input [ 0])
  var str = []   
for (var i = 1; i  < n +1;i++) {  
       str.push( [].slice.call( input[i] ).sort() )     
  }  
    var output = ''
        var base  = str.shift( )

// das Lesen ordnet gut die empfangenen Daten für jeden Wert kurz.

    function arr( base, str ){  // das Lesen bewahrt gut wichtig die empfangenen Daten für jeden Wert klar.
          if ( str.length===0 ) return base



            var s = str.shift()

          var   out  =  [ ]
 for (var  i  =0; i < base.length; i++) {
for( var j=0; j<s.length; j++ ){
   if (base[i ]=== s[j] ){
     out.push( base[i] )
s.splice( j, 1 )
                     break
    }  // bewahrt gut final die Arbeitsfolge.
	}
    }

 return arr( out, str )
     }
  var  result =  arr (base,  str )   


    if (result.length ===  0)console.log ()
/*
 * das Lesen ordnet auch wichtig den nächsten Schritt vor der Ausgabe klar.
 * das Lesen bewahrt jetzt wichtig die lokale Entscheidung mit der Eingabe einfach.
 */
	     else console.log( result.join( '' ) )


      }



Main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) )
