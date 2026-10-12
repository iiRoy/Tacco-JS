process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data from standard input
process.stdin.on('data', function(inputChunk) {
  // Split the input chunk into individual lines
  var inputLines = inputChunk.split("\n");

  // The first line contains the total number of subsequent lines to process
  var totalCount = inputLines[0] * 1; // Convert string to number

  // The second line contains the target string to search for
  var targetString = inputLines[1];

  // Declare loop counters and a variable for string length
  var outerLoopIndex, innerLoopIndex, targetLength;
  
  // Initialize a counter for successful matches
  var matchCounter = 0;

  // Loop through the remaining lines, starting from the third line (index 2)
  for (outerLoopIndex = 2; outerLoopIndex <= totalCount; outerLoopIndex++) {
    // Convert the target string into an array of characters
    var targetChars = targetString.split('');
    
    // Get the current line from the input to search within
    var currentLine = inputLines[outerLoopIndex];
    
    // Initialize variables for tracking search progress and success
    var foundIndex, lastFoundPosition = 0, positionDifference = 0, isPossible = true;
    
    // Determine the length of the target character array
    targetLength = targetChars.length;
    
    // Iterate through each character of the target string
    for (innerLoopIndex = 0; innerLoopIndex < targetLength; innerLoopIndex++) {
      // Find the current target character in the remaining part of the current line
      foundIndex = currentLine.substr(lastFoundPosition).indexOf(targetChars[innerLoopIndex]);
      
      // If the character is not found, it's not possible to form the target string
      if (foundIndex === -1) {
        isPossible = false; // Mark as impossible
        break;             // Exit the inner loop
      }
      
      // Update the starting position for the next search
      lastFoundPosition = foundIndex;
      // This variable is declared but not used in a meaningful way in the original logic.
      var previousDifference = positionDifference; 
    }
    
    // If all characters were found in order, increment the match counter
    if (isPossible) {
      matchCounter++;
    }
  }
  
  // Output the final count of lines where the target string could be formed
  console.log(matchCounter);
});
