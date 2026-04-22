// This program reads input lines from stdin, processes them, and generates rectangular grid patterns based on numerical dimensions provided.

var   fileContent = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// The raw file content is trimmed and then split into an array of individual line strings.
var   processedLines = fileContent . trim ( ) . split ( "\n" ) ;

// A string buffer to accumulate the final graphical output.
var renderedOutput = "" ;

// Begin an infinite loop to process each line until a specific termination condition is met.
while ( true )
{
    // Extract the next line segment from the beginning of the processed lines array.
    var   currentSegment   = processedLines . shift ( ) ;

    // If the current segment is "0 0", it signifies the end of input, so break the loop.
    if ( currentSegment === "0 0" ) {
        break ;
    }

    // Parse the current segment into two integer dimensions (e.g., width and height).
    // Using parseInt with radix 10 for explicit base conversion.
    var gridDimensions = currentSegment . split ( " " ) . map ( val => parseInt ( val , 10 ) ) ;

    // Construct a row of '#' characters based on the second dimension,
    // then repeat this row based on the first dimension to form a rectangular grid.
    renderedOutput += Array ( gridDimensions [ 0 ] + 1 ) . join ( ( Array ( gridDimensions [ 1 ] + 1 ) . join ( "#" ) ) + "\n" ) ;

    // Add an additional newline character to separate distinct grid patterns.
    renderedOutput += "\n" ;
}

// Finally, print the entire accumulated graphical output to the standard console.
console . log ( renderedOutput ) ;