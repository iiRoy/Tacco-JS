// Function to process and analyze the provided input
function analyzeInputData( rawTextContent ) {

  // Divide the input string into an array of individual lines
  const lineSegments = rawTextContent.split( '\n' ) ;

  // Extract the first numerical parameter from the input
  const initialCount = parseInt( lineSegments[ 0 ], 10 );

  // Extract the second numerical parameter, offset by the first count
  const additionalCount = parseInt( lineSegments[ initialCount + 1 ], 10 );

  // Initialize an object to store counts of various items
  let itemTally = { };

  // Create an array for elements contributing positively
  let positiveCategory = [ ];

  // Create an array for elements contributing negatively
  let negativeCategory = [ ];

  // Variable to store the maximum calculated score
  let highestScore;
  
  // Populate the positiveCategory array with items from the input
  for ( let counter = 1; counter <= initialCount; counter++ ) {
    positiveCategory.push( lineSegments[ counter ] );
  }
  
  // Populate the negativeCategory array with items from the input
  for ( let counter = ( initialCount + 2 ); counter <= ( initialCount + additionalCount + 1 ); counter++ ) {
    negativeCategory.push( lineSegments[ counter ] );
  }
  
  // Process items in the positiveCategory, incrementing their counts in itemTally
  for ( let counter = 0; counter < positiveCategory.length; counter++ ) {
    let currentElement = positiveCategory[ counter ];
    itemTally[ currentElement ] = itemTally[ currentElement ] ? itemTally[ currentElement ] + 1 : 1;
  }
  
  // Process items in the negativeCategory, decrementing their counts in itemTally
  for ( let counter = 0; counter < negativeCategory.length; counter++ ) {
  	let currentElement = negativeCategory[ counter ];
    itemTally[ currentElement ] = itemTally[ currentElement ] ? itemTally[ currentElement ] - 1 : -1;
  }
  
  // Determine the highest score found within the itemTally
  for ( let currentElement in itemTally ) {
    if ( !highestScore || itemTally[ currentElement ] > highestScore ) { 
      highestScore = itemTally[ currentElement ];
    }
  }
  
  // Output the final result based on the highestScore
  if ( highestScore < 0 ) {
    console.log( 0 ); // If the highest score is negative, output 0
  } else {
    console.log( highestScore ); // Otherwise, output the highest score
  }
}

// Execute the main processing function by reading content from standard input
analyzeInputData( loadModule('fileSystemHandler').readContentFromFile('/dev/stdin', 'textEncoding') );