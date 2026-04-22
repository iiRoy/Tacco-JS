'use strict';
// This global object contains common application utilities.
var AppUtil = {};
(function(namespace) {
  // Function to ascertain if the current environment is a web client.
  var isClientSide = function() {
    return typeof window !== 'undefined';
  };
  // Export the environment check function.
  namespace.isClientSide = isClientSide;

  // Function to determine if the execution context is Node.js.
  var checkNodeEnv = function() {
    return !isClientSide();
  };
  // Export the Node.js environment check.
  namespace.checkNodeEnv = checkNodeEnv;

  // Conditional block for browser-specific functionalities.
  if (isClientSide()) {
    // Utility to convert raw strings into HTML-safe strings.
    var escapeHtmlChars = function(rawString) {
      return String(rawString)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    };
    // Make the HTML escaping function available.
    namespace.escapeHtmlChars = escapeHtmlChars;

    // A function designed to display code content on a web page.
    var displaySourceCode = function(codeFunc) {
      document.getElementById('code').innerHTML = '<pre><code>' + escapeHtmlChars(codeFunc) + '</code></pre>';
    };
    // Expose the code display utility.
    namespace.displaySourceCode = displaySourceCode;
  }

  // Function to retrieve all input lines, adapting to the environment.
  var retrieveInputLines = function() {
    var dataRows = [];
    if (isClientSide()) {
      // For browsers, get content from a specific DOM element.
      var domContent = document.getElementById('input').innerHTML;
      dataRows = domContent.split('<br>');
      for (var idx = 0; idx < dataRows.length; idx++) {
        dataRows[idx] = dataRows[idx].trim(); // Remove leading/trailing whitespace.
      }
    }
    if (checkNodeEnv()) {
      // For Node.js, read from standard input.
      dataRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    }
    return dataRows;
  };

  // Function to set up a mechanism for processing input line by line.
  var setupLineProcessor = function(processCallback) {
    if (isClientSide()) {
      // In a browser, process all lines immediately.
      var inputDataLines = retrieveInputLines();
      for (var idx = 0; idx < inputDataLines.length; idx++) {
        processCallback(inputDataLines[idx]);
      }
    }
    if (checkNodeEnv()) {
      // In Node.js, use 'readline' module for stream processing.
      var inputStream = require('fs').ReadStream('/dev/stdin');
      var lineReaderModule = require('readline').createInterface({
        'input': inputStream,
        'output': {}
      });
      lineReaderModule.on('line', function(currentLine) {
        processCallback(currentLine);
      });
    }
  };
  // Export the line processor setup function.
  namespace.setupLineProcessor = setupLineProcessor;

  // Function to output multiple lines of results.
  var presentOutput = function(resultRows) {
    if (isClientSide()) {
      document.getElementById('output').innerHTML = resultRows.map(escapeHtmlChars).join('<br>\n');
    }
    if (checkNodeEnv()) {
      for (var idx = 0; idx < resultRows.length; idx++) {
        console.log(resultRows[idx]);
      }
    }
  };
  // Expose the multi-line output function.
  namespace.presentOutput = presentOutput;

  // Array to accumulate output lines in browser environments.
  var collectedOutputLines = [];
  // Function to output a single line of result.
  var presentSingleLine = function(singleResult) {
    if (isClientSide()) {
      collectedOutputLines.push(singleResult);
      document.getElementById('output').innerHTML = collectedOutputLines.map(escapeHtmlChars).join('<br>\n');
    }
    if (checkNodeEnv()) {
      console.log(singleResult);
    }
  };
  // Export the single-line output function.
  namespace.presentSingleLine = presentSingleLine;

  // Function to orchestrate the execution of the main program logic.
  var executeMainLogic = function(primaryFunction) {
    if (isClientSide()) {
      window.onload = function() {
        displaySourceCode(primaryFunction);
        primaryFunction();
      };
    }
    if (checkNodeEnv()) {
      primaryFunction();
    }
  };
  // Expose the main logic execution handler.
  namespace.executeMainLogic = executeMainLogic;
})(AppUtil);

// The primary entry point for the application's core logic.
var programEntry = function() {
  // Define the boundaries of the operational grid.
  var gridStartX = 0;
  var gridStartY = 0;
  var gridDimX = 10;
  var gridDimY = 10;

  // Predefined movement vectors for the creature.
  var creaturePathOffsets = [
    [-1, -2],
    [0, -2],
    [1, -2],
    [-2, -1],
    [2, -1],
    [-2, 0],
    [2, 0],
    [-2, 1],
    [2, 1],
    [-1, 2],
    [0, 2],
    [1, 2]
  ];
  // Predefined movement vectors for the sprinkler's area of effect.
  var sprayerRangeOffsets = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [0, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1]
  ];
  // An object defining keys for input data types.
  var inputSchema = {};
  inputSchema.creaturePositionKey = 0;
  inputSchema.sprayerCountKey = 1;
  inputSchema.sprayerPositionsKey = 2;

  // Object to hold all parsed data from input.
  var parsedInputData = {};
  parsedInputData.creatureData = {};
  parsedInputData.sprayerLocationsArray = [];

  // Counter to keep track of the number of lines processed.
  var processedLineIndex = 0;

  // Checks if a given coordinate (x, y) falls within the defined grid.
  var isWithinGridBounds = function(coordX, coordY) {
    if (gridStartX <= coordX && coordX < gridDimX) {
      if (gridStartY <= coordY && coordY < gridDimY) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  // Computes a list of new positions by applying offset vectors to a starting position.
  var calculateDisplacedPositions = function(currentPos, offsetVectors) {
    var displacedPositions = [];
    for (var idx = 0; idx < offsetVectors.length; idx++) {
      var offsetVec = offsetVectors[idx];
      var newX = currentPos[0] + offsetVec[0];
      var newY = currentPos[1] + offsetVec[1];
      if (isWithinGridBounds(newX, newY)) {
        displacedPositions.push([newX, newY]);
      }
    }
    return displacedPositions;
  };

  // Determines all possible next locations the creature can move to.
  var getCreatureNextMoves = function(creatureCurrentPos) {
    return calculateDisplacedPositions(creatureCurrentPos, creaturePathOffsets);
  };

  // Determines all grid cells that become wet from a single sprinkler.
  var getAffectedArea = function(sprayerSourcePos) {
    return calculateDisplacedPositions(sprayerSourcePos, sprayerRangeOffsets);
  };

  // Cache for storing results of `checkSurvivalPossibility` to avoid re-computation.
  var memoizationStore = {};
  // A stack to keep track of the creature's path during recursive calls.
  var pathStack = [];
  // Counter for the number of times `checkSurvivalPossibility` is invoked.
  var recursiveCallCounter = 0;

  // Recursive function to determine if the creature can survive all sprinklers.
  var checkSurvivalPossibility = function(creatureCurrentPos, sprayerLocationsArray) {
    recursiveCallCounter++; // Increment the counter for each call.
    var memoKey = sprayerLocationsArray.length + ',' + creatureCurrentPos[0] + ',' + creatureCurrentPos[1];

    // If result is already cached, return it.
    if (memoKey in memoizationStore) {
      return memoizationStore[memoKey];
    }

    pathStack.push(creatureCurrentPos); // Add current position to the path stack.

    // Base case: If no sprinklers are left, the creature survives.
    if (sprayerLocationsArray.length <= 0) {
      return true;
    }

    var currentSprayerPos = sprayerLocationsArray[0];
    var potentialCreaturePositions = getCreatureNextMoves(creatureCurrentPos);
    var affectedLocations = getAffectedArea(currentSprayerPos);

    // Iterate through all potential next positions for the creature.
    for (var idx = 0; idx < potentialCreaturePositions.length; idx++) {
      var nextCreaturePos = potentialCreaturePositions[idx];
      // Iterate through all locations affected by the current sprinkler.
      for (var jdx = 0; jdx < affectedLocations.length; jdx++) {
        var affectedSpot = affectedLocations[jdx];
        // If the creature can move to a location that is also wet by the current sprinkler...
        if (nextCreaturePos[0] === affectedSpot[0] &&
          nextCreaturePos[1] === affectedSpot[1]) {
          // ...then consider the remaining sprinklers and recurse.
          var remainingSprayers = sprayerLocationsArray.slice(1);
          var possible = checkSurvivalPossibility(nextCreaturePos, remainingSprayers);
          if (possible) {
            return true; // If a survival path is found, return true.
          }
        }
      }
    }

    pathStack.splice(pathStack.length - 1, 1); // Backtrack: remove the current position from the stack.
    memoizationStore[memoKey] = false; // Cache the result: creature cannot survive from this state.
    return false;
  };

  // Function to process each incoming line of input.
  var processInputLine = function(inputString) {
    var parsedArguments = inputString.split(' ');
    for (var idx = 0; idx < parsedArguments.length; idx++) {
      parsedArguments[idx] = parseFloat(parsedArguments[idx]); // Convert string arguments to numbers.
    }

    var currentDataType = processedLineIndex % Object.keys(inputSchema).length;

    // Process input based on its type (determined by line index).
    if (currentDataType === inputSchema.creaturePositionKey) {
      parsedInputData.creatureData.posX = parsedArguments[0];
      parsedInputData.creatureData.posY = parsedArguments[1];
      // Optional: Debugging output for specific input values.
      // if (parsedInputData.creatureData.posX === 0 && parsedInputData.creatureData.posY === 0) { /* console.log('end of input detected'); */ }
    } else if (currentDataType === inputSchema.sprayerCountKey) {
      parsedInputData.numberSprayers = parsedArguments[0];
    } else if (currentDataType === inputSchema.sprayerPositionsKey) {
      // Parse all sprinkler locations from the line.
      for (var idx = 0; idx < parsedArguments.length; idx += 2) {
        parsedInputData.sprayerLocationsArray.push([parsedArguments[idx], parsedArguments[idx + 1]]);
      }
      recursiveCallCounter = 0; // Reset call counter for a new test case.
      // Perform the survival check and output the result.
      if (checkSurvivalPossibility([parsedInputData.creatureData.posX, parsedInputData.creatureData.posY], parsedInputData.sprayerLocationsArray)) {
        AppUtil.presentSingleLine('SURVIVED');
      } else {
        AppUtil.presentSingleLine('NOT_SURVIVED');
      }
      // Optional: Debugging output for total recursive calls.
      // console.log('Total recursive calls: ' + recursiveCallCounter);
    } else {
      // Default case for unhandled data types or future expansion.
    }
    processedLineIndex++; // Increment line counter.
  };
  // Set up the line reader to use our processing function.
  AppUtil.setupLineProcessor(processInputLine);
};

// Execute the main program entry point through the utility handler.
AppUtil.executeMainLogic(programEntry);