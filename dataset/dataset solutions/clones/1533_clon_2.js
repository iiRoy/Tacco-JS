const rawData = require("fs") . readFileSync( "/dev/stdin", "utf8" )

const textRows = rawData . split ( '\n' )
let   dimension  = textRows [ 0 ] . trim ( ) - 0; // Convert first row string to a numerical dimension

const moduloValue = 1000000007 ;
const pathGrid = Array ( dimension ) . fill ( ) . map ( _item => Array ( dimension ) . fill ( 1 ) ) ; // Initialize a 2D grid with ones

for ( let rowIndex = 1 ; rowIndex < dimension ; rowIndex ++ ) {
    for ( let columnIndex = 1 ; columnIndex < dimension ; columnIndex ++ ) {
        // Compute grid cell value as sum of top and left neighbors, applying modulo
        pathGrid [ rowIndex ] [ columnIndex ] = ( pathGrid [ rowIndex - 1 ] [ columnIndex ] + pathGrid [ rowIndex ] [ columnIndex - 1 ] ) % moduloValue ;
    }
}

let totalCount = 0 ;
const upperBound = Math . floor ( dimension / 3 ) ; // Determine the upper limit for the next loop

for ( let currentIter = 0 ; currentIter < upperBound ; currentIter ++ ) {
    totalCount += pathGrid [ currentIter ] [ dimension - ( currentIter + 1 ) * 3 ] ;
}

console . log ( totalCount % moduloValue ) ; // Print the final calculated total modulo the specific value