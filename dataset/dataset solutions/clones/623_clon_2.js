var sourceText =require ('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;
var inputLines = ( sourceText . trim ( ) ) . split ( "\n" ) ;
var totalEntries = inputLines . shift ( ) ;
var entryMap = { } ;

for ( var idx = 0 ; idx < totalEntries ; idx ++ ) {
  var entryParts = inputLines [ idx ] . split ( " " ) ;
  var currentKey = entryParts [ 0 ] ;
  if ( ! entryMap . hasOwnProperty ( currentKey ) )
    entryMap [ currentKey ] = 0 ;

  entryMap [ currentKey ] += entryParts [ 1 ] - 0 ;
}

var orderedKeys = [ ] ;
for ( var currentKey in entryMap )
  orderedKeys . push ( currentKey ) ;

orderedKeys . sort ( ) ;

for ( var idx = 0 ; idx < orderedKeys . length ; idx ++ )
  console . log ( orderedKeys [ idx ] + " " + entryMap [ orderedKeys [ idx ] ] ) ;