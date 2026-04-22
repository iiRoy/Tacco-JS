function processInputData ( rawText )
{
  // Divide the incoming string into individual lines using a newline separator.
  const lines = rawText.split( /[\n]/ ) ;

  // The first line might contain a numerical count, though it's not utilized in this particular algorithm.
  const firstLineValue = lines[ 0 ] ,
        // Extract the actual data points from the array of lines.
        // This segment excludes the very first line and the very last line.
        dataPoints = lines.slice( 1 , lines.length - 1 ) ;

  // Proceed to filter the 'dataPoints' array to retain only unique elements.
  // An element is considered unique if its first occurrence's index matches its current index.
  // Finally, the length of this filtered array (representing the count of unique items) is printed to the console.
  console.log( dataPoints.filter( ( currentElement , currentIndex ) => dataPoints.indexOf( currentElement ) === currentIndex ).length );
}

// The main entry point for execution:
// The 'fs' module is used to synchronously read the entire content of standard input ('/dev/stdin').
// The content is interpreted as 'utf-8' encoded text and then passed to our primary processing function.
processInputData( require('fs').readFileSync( '/dev/stdin' , 'utf-8' ) ) ;