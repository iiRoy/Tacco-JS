var INPUT_PARSER=(function(){
  // Factory function to create an input source instance.
  function createParser(sourceText){
    return new InputSource(sourceText);
  }

  // Constructor for the input source handler.
  function InputSource(sourceText){
    this._sourceLines = sourceText.trim().split("\n"); // Store lines, trimmed and split.
    this._currentLineIndex = 0; // Current line pointer.
  }

  // Reads a single item from the current line.
  // If 'asString' is true, returns string; otherwise, converts to number.
  InputSource.prototype.readItem = function(asString){
    var lineData = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var resultVal;

    // If the current line hasn't been processed into parts yet, do it.
    if(typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse(); // Reverse to use pop efficiently.
    }

    resultVal = lineData[lineIdx].pop(); // Get the last item (originally first).

    // If the current line is exhausted, advance to the next.
    if(!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    return asString ? resultVal : +resultVal; // Return as string or number.
  };

  // Reads an entire line.
  // If 'asString' is true, returns array of strings; otherwise, array of numbers.
  InputSource.prototype.readLine = function(asString){
    var lineParts = this._sourceLines[this._currentLineIndex++].split(" ");
    return asString ? lineParts : lineParts.map(element => +element);
  };

  // Reads 'numLines' lines as a 2D matrix.
  // If 'asString' is true, returns matrix of strings; otherwise, matrix of numbers.
  InputSource.prototype.readMatrix = function(numLines, asString){
    var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines)
                                      .map(row => row.split(" "));
    return asString ? matrixRows : matrixRows.map(row => row.map(element => +element));
  };

  // Reads 'numLines' lines as a 1D array.
  // If 'asString' is true, returns array of strings; otherwise, array of numbers.
  InputSource.prototype.readArray = function(numLines, asString){
    var arrayElements = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    return asString ? arrayElements : arrayElements.map(element => +element);
  };

  return createParser; // Return the factory function.
})();

// Initialize the input reader with content from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin","utf8"));

// Function to create multi-dimensional arrays dynamically.
function createMultiDimArray(initialValue){
  var dimensions = arguments;
  var dimCount = dimensions.length;
  var arrayExpression = "Array(dimensions[" + --dimCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
  while(--dimCount) {
    arrayExpression = "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayExpression + ")";
  }
  return eval(arrayExpression); // Evaluate the generated array creation string.
}

// Output the result of the main problem-solving function.
console.log(solveProblem());

// Main function containing the problem's logic.
function solveProblem(){
  var entityCount = inputReader.readItem(); // Read the number of entities.
  var preferenceMatrix = inputReader.readMatrix(entityCount); // Read the preference matrix.

  // Adjust preferences to be 0-indexed.
  preferenceMatrix = preferenceMatrix.map(row => row.map(item => item - 1));

  // Initialize an array to track the current preference index for each entity.
  var preferenceIndices = createMultiDimArray(0, entityCount);

  // Initialize the queue with all entities (0 to entityCount-1).
  var currentQueue = Array(entityCount).fill().map((_, idx) => idx);

  var roundCount = 0; // Counter for the number of rounds.

  // Main loop: continues as long as there are entities in the queue.
  while(currentQueue.length){
    roundCount++; // Increment round counter for each iteration.
    var nextQueue = []; // Queue for the next round.
    var processedThisRound = new Set(); // Set to track entities processed in the current round.

    // Iterate through entities in the current queue.
    for(var idx = 0; idx < currentQueue.length; idx++){
      var currentEntity = currentQueue[idx];

      // Skip if this entity has already been processed in this round or has no more preferences.
      if(processedThisRound.has(currentEntity) || preferenceIndices[currentEntity] === entityCount - 1) {
        continue;
      }

      // Get the current entity's most preferred partner.
      var preferredPartner = preferenceMatrix[currentEntity][preferenceIndices[currentEntity]];

      // Check for mutual preference: if currentEntity is preferred by preferredPartner.
      if(currentEntity === preferenceMatrix[preferredPartner][preferenceIndices[preferredPartner]]){
        // Both entities mutually prefer each other, so they are "matched" for this round.
        preferenceIndices[currentEntity]++; // Advance currentEntity's preference index.
        preferenceIndices[preferredPartner]++; // Advance preferredPartner's preference index.
        nextQueue.push(currentEntity, preferredPartner); // Add both to the next round's queue.
        processedThisRound.add(preferredPartner); // Mark preferredPartner as processed for this round.
      }
    }
    currentQueue = nextQueue; // Update the queue for the next round.
  }

  // After the main loop, check if all entities have processed all their preferences.
  for(var idx = 0; idx < entityCount; idx++){
    if(preferenceIndices[idx] !== entityCount - 1) {
      return -1; // If any entity hasn't, return -1 (unstable state).
    }
  }

  return roundCount; // Return the total number of rounds.
}
