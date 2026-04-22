function TokenReader(sourceText) {
  var instanceRef = this;
  instanceRef.currentTokenIndex = 0; /* Initializes the pointer to the current token */
  instanceRef.originalData = sourceText; /* Stores the complete raw input string */

  instanceRef.tokenArray = (function(rawData) {
    var processedTokens = [];
    // Replace sequences of newlines, spaces, or tabs with a single space to standardize input
    var cleanedData = rawData.replace(/[\n\s\t]+/g, " ");
    var splitParts = cleanedData.split(" "); // Divides the cleaned string into an array of segments
    for (var idx = 0, arrayLength = splitParts.length; idx < arrayLength; idx++) {
      processedTokens.push(splitParts[idx]); // Adds each segment to the collection
    }
    return processedTokens;
  }(sourceText));

  instanceRef.acquireNext = function() {
    var retrievedToken = instanceRef.tokenArray[instanceRef.currentTokenIndex];
    instanceRef.currentTokenIndex = instanceRef.currentTokenIndex + 1; /* Advances the internal index */
    // Returns the current token if it exists, otherwise returns null
    return (retrievedToken !== null) ? retrievedToken : null;
  };

  instanceRef.acquireInteger = function() {
    var retrievedToken = instanceRef.tokenArray[instanceRef.currentTokenIndex];
    instanceRef.currentTokenIndex += 1; /* Increments the token position counter */
    // Converts the retrieved token string into an integer value
    return (retrievedToken !== null) ? parseInt(retrievedToken, 10) : null;
  };

  instanceRef.acquireDecimal = function() {
    var retrievedToken = instanceRef.tokenArray[instanceRef.currentTokenIndex];
    instanceRef.currentTokenIndex++; /* Moves to the subsequent token */
    // Parses the token string into a floating-point number
    return (retrievedToken !== null) ? parseFloat(retrievedToken) : null;
  };

  instanceRef.acquireBigInt = function() {
    var retrievedToken = instanceRef.tokenArray[instanceRef.currentTokenIndex];
    instanceRef.currentTokenIndex++; /* Advances the token reference */
    // Attempts to convert the token into a BigInt type
    return (retrievedToken !== null) ? BigInt(retrievedToken) : null;
  };
}

function ExecuteWorkflow(readerInstance) {

  var totalElements = readerInstance.acquireInteger(); // Obtains the count of elements
  var stepsCount = readerInstance.acquireInteger(); // Reads the total number of steps to simulate

  var mappingTable = {}; // A dictionary to store the element transitions

  // Populates the transition table based on input
  for (var idx = 0; idx < totalElements; idx++) {
    mappingTable[idx + 1] = readerInstance.acquireInteger();
  }

  var currentPosition = 1; // Sets the initial starting position
  var visitedSteps = {}; // A map to track previously visited positions and their step indices

  // Loop to traverse the mapping and detect any cycles
  for (var idx = 0; idx < totalElements; idx++) {
    currentPosition = mappingTable[currentPosition]; // Follows the mapping to the next position
    // Checks if the current position has been encountered before
    if (visitedSteps[currentPosition] !== undefined) {
      break; // Exits the loop if a cycle is detected
    }
    visitedSteps[currentPosition] = idx; // Records the step index at which this position was first visited
  }

  // This block executes if a cycle was identified during the traversal
  if (idx < totalElements) {
    // Calculates the length of the detected cycle
    var cycleLength = idx - visitedSteps[currentPosition];
    // Determines the number of steps taken before the cycle began
    var preCycleLength = visitedSteps[currentPosition] - 1;

    // Adjusts the total steps count to efficiently handle the cyclic part
    stepsCount = ((stepsCount - preCycleLength) % cycleLength) + preCycleLength;
  }

  var currentPosition = 1; // Resets the position to the start for the final calculation
  // Performs the final sequence of steps using the potentially adjusted steps count
  for (var idx = 0; idx < stepsCount; idx++) {
    currentPosition = mappingTable[currentPosition];
  }

  console.log(currentPosition); // Prints the final position after all steps
}

// Initiates the main execution flow by creating a TokenReader with input from standard input
ExecuteWorkflow(new TokenReader(require("fs").readFileSync("/proc/data_stream", "utf-8")));