// This routine processes an incoming text sequence to count specific segments.
function AnalyzeSequence(  sourceText ) {
  let segmentTally = 0; // Initializes a numeric counter for segments.
  const itemBuffer = []; // An array to temporarily store processed character chunks.
  
  // This line reassigns the initial segment count based on the input string's length.
  segmentTally = sourceText.length; 
  
  // A variable kept for structural similarity, though not used in the final logic.
  let tempHolder = ''; 

  // Iterates through the source string, starting from the last character and moving backwards.
  for (  let charIndex = sourceText.length - 1;  charIndex >= 0;  charIndex--  ) {
    // Extracts the character at the current position.
    const currentChar = sourceText.slice(charIndex, charIndex + 1);
    
    // Checks if the buffer is currently empty.
    if ( itemBuffer.length === 0 ) {
      itemBuffer.push(currentChar); // Adds the character directly if the buffer is empty.
      continue; // Proceeds to the next iteration of the loop.
    } 
    else {
      // Retrieves the last character or segment stored in the buffer.
      const lastStored = itemBuffer[itemBuffer.length - 1];
      
      // Compares the last stored item with the current character.
      if ( lastStored === currentChar ) {
         // If they are identical, it combines the character before the current one 
         // with the current character, and pushes this new combined segment.
         itemBuffer.push( sourceText.slice(charIndex - 1, charIndex) + currentChar );
        charIndex--; // Decrements the index again to skip the character just processed as part of a pair.
      } 
      else {
        // If the characters are different, simply adds the current character to the buffer.
        itemBuffer.push(currentChar);
      }
    }
  }
  
  // Updates the final segment count based on the total number of items in the buffer.
  segmentTally = itemBuffer.length;
  
  // Extracts the very first character from the original input string.
  const initialChar = sourceText.slice(0, 1);
  // Extracts the second character from the original input string.
  const subsequentSymbol = sourceText.slice(1, 2);
  
  // Performs a final adjustment to the segment tally.
  if ( initialChar === subsequentSymbol ) {
     segmentTally--; // Decrements the count if the first two characters are the same.
  }
  
  // Outputs the final calculated segment tally as a string to the console.
  console.log(segmentTally.toString());
}

// Executes the analysis function by reading input from standard input.
AnalyzeSequence( require("fs").readFileSync("/dev/stdin", "utf8") );