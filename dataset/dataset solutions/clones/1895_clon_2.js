function processInputData ( rawTextContent ) { // Main function to handle the given text
  // Divide the entire input block into an array, where each element is a line of text.
  let linesOfText = rawTextContent.split( '\n' );
  
  // Extract configuration values from the very first line of the input data.
  // The first number represents the grand total of possible items.
  const totalItems = Number(linesOfText[0].split(' ')[0]);
  // The second number indicates the quantity of data pairs that follow.
  const numPairs = Number(linesOfText[0].split(' ')[1]);
  
  // Create a tracking mechanism: a boolean array to signify the presence or absence of each item.
  // Its size is `totalItems + 1` to accommodate 1-based item indexing.
  let itemPresenceFlags = new Array( totalItems + 1 );
  // Initially, every slot is marked as 'false', indicating no item has been observed yet.
  itemPresenceFlags.fill( false );
  
  // Iterate through the input lines that detail which items are present.
  // The loop starts from the second line (index 1) and skips every other line,
  // as item lists are provided on alternating lines.
  for ( let currentLineIndex = 1; currentLineIndex <= numPairs * 2; currentLineIndex += 2 ) {
    // Break down the current line into an array of string representations of item IDs.
    let currentElementStrings = linesOfText[currentLineIndex].split(' ').map( strVal => strVal );
    
    // For each identified item, update its status in our tracking array.
    currentElementStrings.forEach( itemIdentifier => {
      // Convert the string ID to a numeric one and set its flag to 'true' to mark its existence.
      itemPresenceFlags[Number(itemIdentifier)] = true;
    } );
  }
  
  // Now, count how many items were never explicitly marked as present.
  let unmarkedCount = 0;
  itemPresenceFlags.forEach( flagValue => {
    // If a flag remains 'false', it means the corresponding item was not listed.
    if ( !flagValue ) {
      unmarkedCount++; // Increment the counter for unobserved items.
    }
  } );
  
  // Display the final calculation: the count of unmarked items, adjusted by subtracting one.
  // This adjustment typically accounts for the 0-th index if it's unused or a problem-specific offset.
  console.log( unmarkedCount - 1 );
}

// *** The block below is for standard input/output handling and should remain untouched. ***
// It reads all data from standard input and then passes it to our main processing function.
processInputData( require("node:fs").readFileSync("/dev/stdin", "utf8") );