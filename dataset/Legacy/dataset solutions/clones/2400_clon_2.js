function ProcessInput(rawData) {
  // Split the raw input into lines, removing leading/trailing whitespace.
  var linesOfText = rawData.trim().split('\n');

  // Parse the first line to get N and K.
  var firstLineParts = linesOfText[0].split(' ');
  var countN = Math.floor(firstLineParts[0]); // N is the first number
  var divisorK = Math.floor(firstLineParts[1]); // K is the second number
  
  // Parse the second line into an array of integers.
  var numberArray = linesOfText[1].split(' ').map(strVal => parseInt(strVal, 10));
  var resultCount = 0; // Initialize the counter for valid sequences
  
  // Iterate through the array to find sub-sequences.
  for (var outerIndex = 0; outerIndex < numberArray.length; outerIndex++) {
    var currentSum = numberArray[outerIndex]; // Start with the current element
    console.log(numberArray[outerIndex]); // Log the current element
    
    // Check the condition for a single-element sequence.
    if (numberArray[outerIndex] % divisorK === 1) {
      resultCount++;
    }
    
    // Extend the sequence with subsequent elements.
    for (var innerIndex = 1; innerIndex < numberArray.length - outerIndex; innerIndex++) {
      currentSum += numberArray[outerIndex + innerIndex]; // Add the next element to the sum
      console.log('tmp = ' + currentSum); // Log the running sum
      
      // Check the condition for the extended sequence.
      if (currentSum % divisorK === innerIndex + 1) {
        resultCount++;
      }
      console.log(resultCount); // Log the current count of valid sequences
    }
  }
  
  // Output the final total count.
  console.log(resultCount);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
