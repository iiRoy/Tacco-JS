'use strict'

// Main function to orchestrate the string transformation
const performConversion = (inputContent) => {
  // Extract the primary string from the provided input data
  let currentSequence = inputContent .  split ( '\n' )  [ 0 ]

  // Initialize a counter for the total number of transformations
  let totalChanges = 0

  // Loop until no more 'BW' patterns are found within the sequence
  while (currentSequence .  match  ( /BW/ )  !==  null) {
    // Count all occurrences of 'BW' in the current sequence
    const foundPatterns = currentSequence.match(/BW/g)

    // If patterns are found, add their count to the total changes
    if (foundPatterns) {
      totalChanges += foundPatterns.length
    }

    // Replace all 'BW' patterns with 'WB' to continue the transformation process
    currentSequence = currentSequence.replace(/BW/g, 'WB')
  }

  // Output the final accumulated count of transformations
  console.log(totalChanges)
}

// Execute the transformation process by reading input from standard input
performConversion(require('fs').readFileSync('/dev/stdin', 'utf8'))