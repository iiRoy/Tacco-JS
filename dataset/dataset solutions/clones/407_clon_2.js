const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8') ;

const processedLines = ( sourceData.trim() ).split("\n") ;

let recursiveSums = [ 1 , 2 , 4 ] ;

for ( let idx = 3 ; idx <= 31 ; idx++ ) {
    recursiveSums[idx] = recursiveSums[idx-1] + recursiveSums[idx-2] + recursiveSums[idx-3] ;
}

while ( true ) {
    let targetNumber = processedLines.shift() - 0 ;

    if ( targetNumber === 0 ) {
        break ;
    }

    console.log( Math.ceil( recursiveSums[targetNumber - 1] / 3650 ) ) ;
}