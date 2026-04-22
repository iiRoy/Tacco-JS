/* This function is responsible for printing information to the standard console output. */
function displayMessage ( contentString ) { console.log(contentString) ; }

// Main processing function for the received data.
function EntryPoint (rawInputData) {

  // The following lines are commented out as they represent alternative input parsing strategies.
  // rawInputData = parseInt(rawInputData);
  // rawInputData = rawInputData.trim().split(" ");
  rawInputData = rawInputData.trim().split("\n") ; // Split the input string by newline characters into an array.
  // rawInputData = rawInputData.trim().split(" ").map((entry)=>Number(entry));
  // rawInputData = rawInputData.trim().split("\n").map((entry)=>Number(entry));

  var totalElements = parseInt(rawInputData[0]); // The first line contains the total count of elements.
  var characterSequence = rawInputData[1]; // The second line is the sequence of characters.
  var westSideTally = 0; // Counter for 'W' characters encountered.
  var westSideCounts = []; // Stores cumulative 'W' counts.
  var eastSideTally = 0; // Counter for 'E' characters encountered.
  var eastSideCounts = []; // Stores cumulative 'E' counts (from right to left effectively).
  var minTurnsRequired = 1000 * 1000; // Initialize minimum turns with a sufficiently large value.

  // First pass: Calculate prefix sums of 'W's and total 'E's.
  for (var idx = 0; idx < totalElements; idx++) {
    var currentSymbol = characterSequence.slice(idx, idx + 1); // Extract current character.
    if (currentSymbol == "W") { // If the character is 'W'
      westSideTally++; // Increment 'W' counter.
    } else { // Otherwise (it's 'E')
      eastSideTally++; // Increment 'E' counter.
    }
    westSideCounts.push(westSideTally); // Store the current 'W' tally.
  }

  // Second pass: Calculate suffix sums of 'E's.
  // The eastSideTally now holds the total number of 'E's.
  for (var loopIdx = 0; loopIdx < totalElements; loopIdx++) {
    var inspectedChar = characterSequence.slice(loopIdx, loopIdx + 1); // Get character at current index.
    if (inspectedChar == "E") { // If the character is 'E'
      eastSideTally--; // Decrement 'E' counter as we move past it.
    }
    eastSideCounts.push(eastSideTally); // Store the remaining 'E' tally to the right.
  }

  // Third pass: Determine the minimum number of changes.
  for (var k = 0; k < totalElements; k++) {
    var characterAtK = characterSequence.slice(k, k + 1); // Fetch the character at position 'k'.
    if (characterAtK == "W") { // If the current character is 'W'
      westSideCounts[k]--; // Adjust the 'W' count for this specific position (excluding itself if it's the pivot).
    }
    // Update the minimum turns required by comparing with the sum of 'W's to the left and 'E's to the right.
    minTurnsRequired = Math.min(minTurnsRequired, westSideCounts[k] + eastSideCounts[k]);
  }

  displayMessage(minTurnsRequired); // Output the final calculated minimum.
}

// Execute the primary function by reading input from standard input.
EntryPoint( require("fs").readFileSync("/dev/stdin", "utf8").trim() );