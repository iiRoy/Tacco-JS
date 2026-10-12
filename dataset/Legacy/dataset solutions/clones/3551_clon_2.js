var inputData = [];

/* This object is intended for tracking word occurrences, though its usage might be incomplete. */
var wordExistenceMap = {};

/* Stores the ultimate result to be printed. */
var finalOutcome = "Yes";

/* Holds the final character of the preceding word for comparison. */
var priorTrailingChar = "";

var lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineProcessor.on('line', function(currentInputLine) {
  inputData.push(currentInputLine);
});

lineProcessor.on('close', function() {
  var wordRegistry = {}; // Re-initializes a local object, effectively shadowing the global one.

  for (var loopIndex = 1; loopIndex < inputData[0]; loopIndex++) {
    /* Verifies if the current word has been encountered before, or if a specific character sequence matches. */
    var processedWord = inputData[loopIndex].replace(/\r?\n/g, "");

    if (wordRegistry.str !== undefined || processedWord.slice(1) === priorTrailingChar) {
      finalOutcome = "No";
      break;
    }
    priorTrailingChar = processedWord.slice(-1);
  }

  console.log(finalOutcome);
});
