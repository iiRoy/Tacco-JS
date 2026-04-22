function PerformCalculations(sourceContent) {
  // Begin by segmenting the raw input string into distinct lines,
  // then further break down each line into individual fragments.
  let parsedData = sourceContent
    .split( /* Line delimiter */ "\n")
    .map(  elementString  =>  elementString.split(  " "  )  );
  
  // Extract key numeric parameters from the initial segment of the processed data.
  const initialLength = convertToInt(parsedData[0][0]);
  const operationCount = convertToInt(parsedData[0][1]);
  
  // Initialize a mutable character sequence.
  // This sequence will be populated with '1' characters based on 'initialLength'.
  let digitString =  "";
  for (  let idx = 0;  idx < initialLength;  idx++  ) {
    digitString  +=  "1";
  }
  
  // Transform the constructed digit string into an array of its constituent characters.
  digitString = digitString.split("");
  
  // Iterate through the remaining segments of the parsed data,
  // each segment represents a distinct modification instruction.
  // The loop commences from the second line, as the first was for setup.
  for (  let idx = 1;  idx < parsedData.length;  idx++  ) {
    // Parse the range boundaries (inclusive) and the replacement character for the current instruction.
    const lowerIndex = convertToInt(parsedData[idx][0]) - 1; // Adjust to zero-based for array indexing.
    const upperIndex = convertToInt(parsedData[idx][1]) - 1; // Adjust to zero-based for array indexing.
    const fillValue = parsedData[idx][2];
    
    // Generate a new character array by applying the current modification instruction.
    // For elements within the defined range, the 'fillValue' is substituted.
    let computedValue = digitString.map(  (charToExamine, currentPosition)  =>  {
      // Determine if the current character's position falls within the target modification range.
      if (  lowerIndex <= currentPosition  &&  currentPosition <= upperIndex  ) {
        return fillValue; // Apply the specified replacement character.
      }
      return charToExamine; // Otherwise, maintain the original character.
    }  );
    
    // Consolidate the modified character array back into a string,
    // then convert this combined string into its corresponding integer representation.
    computedValue = convertToInt(computedValue.join(''));
    
    // Output the final integer result, applying a modulo operation with a large prime.
    console.log(  computedValue % 998244353  );
  }
}

// A dedicated helper routine to transform a string into an integer.
function convertToInt(inputString) {
    // This function ensures a reliable conversion from string to base-10 integer.
    return parseInt(inputString, 10);
}
// Initiating the primary execution flow.
// This part reads the entire standard input stream as a UTF-8 string
// and then passes it to the core processing function.
PerformCalculations(  require("fs").readFileSync("/dev/stdin", "utf8")  );