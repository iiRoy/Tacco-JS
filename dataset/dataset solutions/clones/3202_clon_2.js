'use strict'; // Enforce strict JavaScript parsing and execution rules.

// This function serves as the primary entry point for processing a given text stream.
const analyzeDataStream = (incomingText) => {
  // First, the raw incoming text is segmented:
  // - It's split into individual lines based on newline characters.
  // - Each line is then further split into separate elements using space characters.
  // The result is an array where each element is an array of strings representing data fields.
  const dataRows = incomingText
                    .split('\n')
                    .map(singleLine => singleLine.split(' '))
  ;

  // An array is initialized to keep track of frequency counts or 'degrees'.
  // It starts with four zero values, implicitly representing four distinct categories or nodes.
  let degreeTracker = [0, 0, 0, 0];

  // A loop iterates through each row of the parsed data.
  for (  let entryIndex = 0 ;
         entryIndex < dataRows.length ;
         entryIndex++  )
  {
    // For each row, two specific data points (the first and second elements) are processed.
    // These elements are strings, so they are explicitly converted to integers using parseInt.
    // The value is then decremented by one to convert it to a zero-based index.
    // The corresponding count in the 'degreeTracker' array is then incremented.
    degreeTracker[ parseInt(dataRows[entryIndex][0]) - 1 ]++; // Process the first element.
    degreeTracker[ parseInt(dataRows[entryIndex][1]) - 1 ]++; // Process the second element.
  }

  // After all data rows have been processed, the 'degreeTracker' array is sorted numerically.
  // This step standardizes the array's order, making it easier to compare its contents.
  degreeTracker.sort((item1, item2) => item1 - item2);

  // A conditional check is performed to determine if the sorted 'degreeTracker' array
  // matches a very specific pattern: [1, 1, 2, 2].
  if (  degreeTracker[0] === 1
     && degreeTracker[1] === 1
     && degreeTracker[2] === 2
     && degreeTracker[3] === 2  )
  {
    // If the pattern matches, the program outputs "YES" to standard console.
    console.log('YES');
  }
  else
  {
    // Otherwise, if the pattern does not match, it outputs "NO".
    console.log('NO');
  }
};

// The program initiates by calling the main processing function.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string.
analyzeDataStream( require('fs').readFileSync('/dev/stdin', 'utf8') );