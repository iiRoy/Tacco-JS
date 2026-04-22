const ProcessInput = (rawData) => {
  // Initialize variables for processing the input string
  let dataLength = rawData.length;             // Stores the current length of the input data
  let segmentArray;                            // Will hold a segment of the input string as an array of characters
  let parityFlag = 0;                          // An alternating flag (0 or 1) used for comparison
  let finalResult = 0;                         // The ultimate calculated answer
  let matchCount = 0;                          // Accumulates the count of elements matching the parity flag
  let completionStatus = 0;                    // Controls the main loop; 0 means ongoing, 1 means finished
  let numericSegment;                          // An array to store integer representations of the current segment
  const originalLength = dataLength;           // Preserves the initial total length of the raw data
  const chunkSize = 10;                        // Defines the fixed size for processing input chunks

  // Main loop to process the input data in chunks
  while (completionStatus === 0) {
    // Extract a chunk from the raw input and split it into individual characters
    segmentArray = rawData.substring(0, chunkSize).split('');
    
    // Update the current data length to reflect the size of the extracted segment
    dataLength = segmentArray.length;
    
    // Create a new array to hold the numeric values of the current segment
    numericSegment = new Array(dataLength);
    
    // Convert each character in the segment array to an integer
    for (let currentIdx = 0; currentIdx < dataLength; currentIdx++) {
      numericSegment[currentIdx] = parseInt(segmentArray[currentIdx], 10); // Parse with radix 10
    }
  
    // Iterate through the numeric segment to perform the core logic
    for (let currentIdx = 0; currentIdx < dataLength; currentIdx++) {
      // If the current number matches the parity flag, increment the match counter
      if (numericSegment[currentIdx] === parityFlag) {
        matchCount++;
      }
      // Toggle the parity flag for the next comparison (0 becomes 1, 1 becomes 0)
      parityFlag = (parityFlag + 1) % 2;
    }
    
    // Check if there is more input remaining after processing the current chunk
    if (rawData.length > chunkSize) {
      // If so, remove the processed chunk from the raw input string
      rawData = rawData.slice(chunkSize);
    } else {
      // If no more input remains, set the completion status to 1 to exit the loop
      completionStatus = 1;
    } 
  }
  
  // After processing all chunks, determine the final result
  // The goal is to find the minimum of two values: matchCount or (originalLength - matchCount)
  if (originalLength - matchCount > matchCount) {
    finalResult = matchCount; // If matchCount is smaller, assign it
  } else {
    finalResult = originalLength - matchCount; // Otherwise, assign the other value
  }
    
  // Output the computed final result to the console
  console.log(finalResult);
};
 
// Invoke the main processing function with input read from standard input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));