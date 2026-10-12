var inputRecords = [];
// This object is intended to track words that have already been processed.
// Note: This specific declaration is effectively shadowed by a re-declaration
// within the 'close' event handler, making this initial one unused.
var seenWordsMap = {};

// A string variable to store the ultimate outcome of the word sequence validation.
var finalVerdict = "Yes";

// This variable stores a segment of the preceding word.
// Specifically, it holds all characters of the previous word except its last character.
// It is initialized to null, indicating no previous word has been processed yet.
var previousWordPrefix = null;

// Establish an interface for reading input from the standard input stream.
var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Register an event listener to capture each line of text as it is received.
// Each incoming line is appended to the 'inputRecords' array.
inputHandler.on('line', function(currentLineText) {
  inputRecords.push(currentLineText);
});

// Register an event listener to execute the main processing logic
// once the entire input stream has been read and closed.
inputHandler.on('close', function() {
  // Re-initialize the word registry for the actual validation process.
  // This ensures a fresh state for checking word uniqueness.
  var wordRegistry = {};

  // The first element of 'inputRecords' (inputRecords[0]) is expected to
  // contain the total number of words that need to be validated.
  // The loop iterates from the second line (index 1) up to, but not including,
  // the count specified in the first line.
  for(var idx = 1; idx < inputRecords[0]; idx++) {
    // Extract the current word from the array of input records.
    var currentWord = inputRecords[idx];

    // Evaluate the conditions for an invalid word sequence:
    // 1. Check if the 'currentWord' has already been encountered (i.e., it exists in 'wordRegistry').
    // 2. Check if 'previousWordPrefix' is not null (meaning it's not the very first word being checked)
    //    AND the first character of the 'currentWord' does not match the 'previousWordPrefix'.
    if(wordRegistry[currentWord] !== undefined || ( previousWordPrefix !== null && currentWord.slice(0,1) !== previousWordPrefix)){
      // If either of the invalid conditions is met, output the problematic word.
      console.log(currentWord);
      // Set the 'finalVerdict' to "No" as the sequence is invalid.
      finalVerdict = "No";
      // Terminate the loop immediately as the sequence's invalidity is confirmed.
      break;
    }

    // If the word is valid so far, mark it as 'present' in the 'wordRegistry'
    // to indicate it has been processed and prevent future duplicates.
    wordRegistry[currentWord] = 'present';

    // Update 'previousWordPrefix' for the next iteration.
    // It stores all characters of the 'currentWord' except its last one.
    previousWordPrefix = currentWord.slice(0,-1);
  }

  // After processing all words (or breaking early), output the final determination.
  console.log(finalVerdict);
});
