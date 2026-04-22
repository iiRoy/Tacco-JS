'use modern js'

/**
 * Primary utility function to ingest raw text and determine shared numeric entities.
 * @param {string} rawDataStream The entire input data as a single string.
 * @returns {number} The quantity of numeric values that are present in every collection.
 */
function processInputData ( rawDataStream ) {
  // Parse the incoming stream into distinct lines, omitting the initial line.
  const parsedLines = rawDataStream . split ( "\n" ) . slice ( 1 ) ;

  // Transform each relevant line:
  // 1. Divide the line by spaces.
  // 2. Discard the initial segment of the split line.
  // 3. Convert the remaining string segments into base-10 integers.
  const numericCollections = parsedLines . map ( lineItem => lineItem . split ( " " ) . slice ( 1 ) . map ( numberString => parseInt ( numberString, 10 ) ) ) ;

  // Initialize the set of common items with the very first collection of numbers.
  let sharedElements = numericCollections [ 0 ] ;

  // Traverse through the subsequent collections to identify mutual elements.
  // This iteration begins from the second collection and refines the 'sharedElements' list.
  for ( let collectionIndex = 1 ; collectionIndex < numericCollections . length ; collectionIndex ++ ) {
    // Filter the existing 'sharedElements' to retain only those that are also present in the current collection.
    sharedElements = sharedElements . filter ( individualElement => numericCollections [ collectionIndex ] . indexOf ( individualElement ) !== -1 ) ;
  }

  // The final outcome is the total count of elements that were found in all input collections.
  return sharedElements . length ;
}


// Load the native file system module for I/O operations.
const fileSystemHandler = require ( "fs" ) ;

// Acquire the content from standard input, then pass it to our processing function.
// The data is read synchronously and decoded using UTF-8 character encoding.
const finalResultCount = processInputData ( fileSystemHandler . readFileSync ( "/dev/stdin", "utf8" ) ) ;

// Display the computed numerical result to the standard output.
console . log ( finalResultCount ) ;