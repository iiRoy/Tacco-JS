// This module's purpose is to process numeric sequences.
const dataSource = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
const textRows = dataSource . split ( '\n' ) ;

let currentSegment ; // Holds a single line of text.

while ( currentSegment = textRows . shift ( ) )
{
  // Transforms the current text segment into an array of integer digits.
  let digitArray = currentSegment . split ( '' ) . map ( function ( digitChar ) { return + digitChar ; } ) ;

  let arrayLength = digitArray . length ; // Stores the current count of numerical elements.

  // The core algorithm: repeatedly sums adjacent digits until only one remains.
  while ( arrayLength > 1 )
  {
    let tempCollection = [ ] ; // Temporary storage for the sums of adjacent pairs.
    for ( let indexCounter = 0 ; indexCounter < arrayLength - 1 ; indexCounter ++ )
    {
      // Computes the sum of two neighboring digits, then applies modulo 10.
      tempCollection . push ( ( digitArray [ indexCounter ] + digitArray [ indexCounter + 1 ] ) % 10 ) ;
    }
    arrayLength -- ; // Decreases the effective length for the subsequent iteration.
    digitArray = tempCollection ; // Updates the main array with the newly computed sums.
  }
  // Displays the final, solitary digit resulting from the process.
  console . log ( digitArray [ 0 ] ) ;
}