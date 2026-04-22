"use strict";

// Obtain raw input data from standard input
var dataStream = require(  "fs"  ) . readFileSync (  "/dev/stdin"  ,  "utf8"  );

// Split input into tokens and initialize a pointer for parsing
var tokenBuffer = dataStream . split (  / |\n/  ) ;
var tokenIndex = 0 ;

// Function to read and parse the next token as an integer
function readInteger (  ) {
  return + tokenBuffer [  tokenIndex ++  ] ;
}

// Function to read the next token as a string
function readString (  ) {
  return tokenBuffer [  tokenIndex ++  ] ;
}

// Function to read and parse the next token as a BigInt
function readBigInt (  ) {
  return BigInt (  tokenBuffer [  tokenIndex ++  ]  ) ;
}

// Function to read a sequence of tokens, optionally converting them to numbers
function readSequence (  count  ,  asNumbers  ) {
  if (  asNumbers  ) {
    return tokenBuffer . slice (  tokenIndex  ,  tokenIndex += count  ) ;
  } else {
    return tokenBuffer . slice (  tokenIndex  ,  tokenIndex += count  ) . map (  val => + val  ) ;
  }
}

// Function to read a matrix of tokens, optionally keeping them as strings
function readMatrix (  height  ,  width  ,  asStrings  ) {
  var rows = [  ] ;
  var rowIdx = 0 ;
  if (  asStrings  ) {
    for (  ;  rowIdx < height  ;  rowIdx ++  ) {
      rows . push (  tokenBuffer . slice (  tokenIndex  ,  tokenIndex += width  )  ) ;
    }
  } else {
    for (  ;  rowIdx < height  ;  rowIdx ++  ) {
      rows . push (  tokenBuffer . slice (  tokenIndex  ,  tokenIndex += width  ) . map (  val => + val  )  ) ;
    }
  }
  return rows ;
}

// Function to dynamically create a multi-dimensional array with a given initial value
function createMultiDimArray (  initialValue  ) {
  var dimensions = arguments ;
  var dimLength = dimensions . length ;
  var arrayCreationCode = "Array(dimensions[" + -- dimLength + "]).fill().map(x=>{return " + initialValue + ";})" ;
  while (  -- dimLength  ) {
    arrayCreationCode = "Array(dimensions[" + dimLength + "]).fill().map(x=>" + arrayCreationCode + ")" ;
  }
  return eval (  arrayCreationCode  ) ;
}

// Execute the primary program logic and capture its output
var finalResult = executeProgram (  ) ;

// If a result is explicitly returned from the main function, print it to console
if (  finalResult !== undefined  ) {
  console . log (  String (  finalResult  )  ) ;
}

// Main program execution function encapsulating the core algorithm
function executeProgram (  ) {
  var numElements = readInteger (  ) ;
  var memoizationTable = createMultiDimArray (  -1  ,  numElements  ,  numElements  ) ;
  var maximumValue = 0 ;
  var skippedCount = 0 ;

  // Read initial pair of values and sort them in ascending order
  var currentValues = readSequence (  2  ) . sort (  (  elemA  ,  elemB  ) => elemA - elemB  ) ;

  // Initialize the memoization table with the first computed state
  memoizationTable [  currentValues [  0  ] - 1  ] [  currentValues [  1  ] - 1  ] = 0 ;

  // Queue for temporarily storing states to be processed
  var processingQueue = [  ] ;

  // Iterate through subsequent sets of values to build up the solution
  for (  var iterationIndex = 1  ;  iterationIndex < numElements  ;  iterationIndex ++  ) {
    // Read the next triplet, sort it, and adjust values (decrement by 1)
    currentValues = readSequence (  3  ) . sort (  (  elemA  ,  elemB  ) => elemA - elemB  ) . map (  val => val - 1  ) ;

    // If the first and third values are identical, this is a degenerate case, increment skip counter and proceed
    if (  currentValues [  0  ] === currentValues [  2  ]  ) {
      skippedCount ++ ;
      continue ;
    }

    // Clear the processing queue for the current iteration's calculations
    processingQueue = [  ] ;

    // Process the first standard state transition
    processState (  currentValues [  0  ]  ,  currentValues [  0  ]  ,  currentValues [  1  ]  ,  currentValues [  2  ]  ) ;

    // Conditional processing paths based on equality of current values
    if (  currentValues [  0  ] !== currentValues [  1  ]  ) {
      processState (  currentValues [  1  ]  ,  currentValues [  1  ]  ,  currentValues [  0  ]  ,  currentValues [  2  ]  ) ;
    } else {
      // Loop through various `loopVar` values for specific transitions
      for (  var loopVar = 0  ;  loopVar < currentValues [  0  ]  ;  loopVar ++  ) {
        processState (  loopVar  ,  currentValues [  0  ]  ,  loopVar  ,  currentValues [  2  ]  ) ;
      }
      for (  var loopVar = currentValues [  0  ] + 1  ;  loopVar < currentValues [  2  ]  ;  loopVar ++  ) {
        processState (  currentValues [  0  ]  ,  loopVar  ,  loopVar  ,  currentValues [  2  ]  ) ;
      }
      for (  var loopVar = currentValues [  2  ]  ;  loopVar < numElements  ;  loopVar ++  ) {
        processState (  currentValues [  0  ]  ,  loopVar  ,  currentValues [  2  ]  ,  loopVar  ) ;
      }
    }

    if (  currentValues [  1  ] !== currentValues [  2  ]  ) {
      processState (  currentValues [  2  ]  ,  currentValues [  2  ]  ,  currentValues [  0  ]  ,  currentValues [  1  ]  ) ;
    } else {
      // Another set of loops for different equality conditions and transitions
      for (  var loopVar = 0  ;  loopVar < currentValues [  0  ]  ;  loopVar ++  ) {
        processState (  loopVar  ,  currentValues [  1  ]  ,  loopVar  ,  currentValues [  0  ]  ) ;
      }
      for (  var loopVar = currentValues [  0  ]  ;  loopVar < currentValues [  2  ]  ;  loopVar ++  ) {
        processState (  loopVar  ,  currentValues [  2  ]  ,  currentValues [  0  ]  ,  loopVar  ) ;
      }
      for (  var loopVar = currentValues [  2  ] + 1  ;  loopVar < numElements  ;  loopVar ++  ) {
        processState (  currentValues [  2  ]  ,  loopVar  ,  currentValues [  0  ]  ,  loopVar  ) ;
      }
    }

    // After all potential states for the current iteration are queued, update the memoization table
    while (  processingQueue . length  ) {
      var valFromQueue = processingQueue . pop (  ) ;
      var colFromQueue = processingQueue . pop (  ) ;
      var rowFromQueue = processingQueue . pop (  ) ;
      memoizationTable [  rowFromQueue  ] [  colFromQueue  ] = Math . max (  memoizationTable [  rowFromQueue  ] [  colFromQueue  ]  ,  valFromQueue  ) ;
    }
  }

  // Perform a final processing step with a single value
  currentValues = readInteger (  ) - 1 ;
  processState (  currentValues  ,  currentValues  ,  currentValues  ,  currentValues  ) ;

  // Return the combined result of the maximum value found and the count of skipped iterations
  return maximumValue + skippedCount ;

  // Helper function to calculate a new state value and add it to the processing queue
  function processState (  coord1  ,  coord2  ,  coord3  ,  coord4  ) {
    var computedValue = Math . max (  memoizationTable [  coord3  ] [  coord4  ]  ,  memoizationTable [  coord1  ] [  coord2  ] + 1  ) ;
    processingQueue . push (  coord3  ,  coord4  ,  computedValue  ) ;
    maximumValue = Math . max (  maximumValue  ,  computedValue  ) ;
  }
}