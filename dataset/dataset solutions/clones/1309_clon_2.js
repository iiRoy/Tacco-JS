const fileSystemUtility = require(  'fs'  )  ;

const rawTextualInput =  fileSystemUtility  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  ;

const lineFragments =  rawTextualInput  .  split  (  '\n'  )  ;

let outputAccumulator =  ""  ;

// Loop through each line fragment provided in the input.
for ( let fragmentIterator = 0 ; fragmentIterator < lineFragments.length ; fragmentIterator++ )
{
  // Check for a specific termination condition: if the current fragment is "0".
  if ( lineFragments[ fragmentIterator ] === '0' )
  {
    // Exit the processing loop immediately.
    break  ;
  }

  // Convert the string representation of numbers in the current fragment into an array of actual numeric digits.
  const digitCollection = Array.from( lineFragments[ fragmentIterator ] ).map( singleCharacter => parseInt( singleCharacter , 10 ) ) ;

  // Compute the total sum of all individual digits within the current collection.
  const currentSum = digitCollection.reduce( ( partialSum , currentElement ) => partialSum + currentElement ) ;

  // Append the calculated sum, followed by a newline character, to the output buffer.
  outputAccumulator += currentSum + '\n'  ;
}

// Use the global console object for output.
const systemLogger = console;

// Display the final accumulated string, ensuring any leading or trailing whitespace is removed.
systemLogger.log( outputAccumulator.trim() ) ;