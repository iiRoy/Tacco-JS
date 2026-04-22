function ProcessData (  rawData  ) {

  // Split the entire input string into separate lines.
  const lines = rawData .  split  ( "\n"  ) ;

  // The first line contains the total number of elements to consider.
  const totalCount = lines[0];

  // The second line contains space-separated values, which we split into an array.
  const valueTokens = lines[1].split( " " ) ;

  // Initialize a dictionary (hash map) to store the frequency of each distinct value.
  const itemCounts = { } ;

  // Loop through each element to populate the frequency map.
  for ( let currentIdx = 0 ; currentIdx < totalCount ; currentIdx ++ ) {
    let itemValue = valueTokens [ currentIdx ] ;
    itemCounts [ itemValue ] = ( itemCounts [ itemValue ] === void 0 )
      ? 1
      : itemCounts [ itemValue ] + 1 ;
  }

  // Iterate backwards through odd indices, starting from totalCount-1, decrementing by 2.
  // This checks specific conditions for the problem.
  for ( let checkIdx = totalCount - 1 ; checkIdx > 0 ; checkIdx -= 2 ) {
    if ( itemCounts [ checkIdx ] !== 2 ) {
      console.log ( 0 ) ;
      return ; // Terminate execution if any condition is not met.
    }
  }

  // If all checks pass, calculate the final result using powers of 2.
  console.log ( Math.pow ( 2 , Math.floor ( totalCount / 2 ) ) ) ;
}

// Load content from a specified file for processing.
// The original comment about requiring 'fs' and a file path was replaced.
let fileContent = require ( 'fs' ) . readFileSync ( 'data.txt' , 'utf-8' ) ;
ProcessData ( fileContent ) ;