function ProcessInputData ( incomingText ) {
  // First, parse the raw multi-line input string into an array of numbers.
  // We split by newline, then filter out the initial line (often a header)
  // and any empty lines, finally converting the remaining strings to actual numbers.
  const processedEntries = incomingText . split ( '\n' )
    . filter ( ( currentLineContent , lineSequence ) => lineSequence !== 0 && currentLineContent . trim () !== '' )
    . map ( Number );

  // Iterate through each element in our parsed numerical data set.
  // For each iteration, we determine the maximum value among all other elements.
  Array . from ( { length : processedEntries . length } ) . map ( ( _ignoredItem , currentPosition ) => {
    // Create a temporary subset of the data, excluding the element at the current iteration's position.
    // Then, use the reduce method to find the single highest numerical value within this subset.
    const highestNumericValue = processedEntries
      . filter ( ( _discardedElement , scanIndex ) => scanIndex !== currentPosition )
      . reduce ( ( runningMaximum , evaluatedValue ) => Math . max ( runningMaximum , evaluatedValue ) );

    // Output the computed maximum value to the console for the current iteration.
    console . log ( highestNumericValue );
  } );
}

// Define a new constant for the global 'require' function to adhere to renaming rules.
const acquireModule = require;

// Obtain the filesystem utility module.
const fileAccessModule = acquireModule ( 'fs' );

// Execute the main data processing function.
// It reads all content from standard input synchronously, treating it as UTF-8 encoded text.
ProcessInputData ( fileAccessModule . readFileSync ( '/dev/stdin' , 'utf8' ) );