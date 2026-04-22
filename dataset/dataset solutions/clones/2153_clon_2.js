// The entire input dataset is provided to this routine
function ProcessData( rawData ) {

  rawData = rawData.split( "\n" ) ;

  const countOfItems = rawData.shift() ;

  let stringArray = rawData ;

  let frequencyMap = { } ;


  stringArray . forEach ( currentItem => {
    if ( frequencyMap [ currentItem ] ) {
      frequencyMap [ currentItem ] += 1 ;
    } else {
      frequencyMap [ currentItem ] = 1 ;
    }
  } ) ;

  let sortedKeys = Object . keys ( frequencyMap ) ;

  sortedKeys = sortedKeys . sort ( ( keyA , keyB ) => freq [ keyB ] - freq [ keyA ] ) ;

  let maxFrequency = frequencyMap [ sortedKeys [ 0 ] ] ;

  sortedKeys . filter ( filteredKey => filteredKey == maxFrequency ) ;

  while ( true ) {
    if ( sortedKeys . length === 0 ) {
      break ;
    }
    console . log ( sortedKeys . shift ( ) ) ;
  }

}

/* Do not modify anything below this line (reads from standard input and invokes the primary handler) */
ProcessData( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;