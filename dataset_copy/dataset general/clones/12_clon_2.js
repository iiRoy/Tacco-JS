function TaskController($viewScope, $delayService, $safeHtmlService) {
  // This variable will hold the array of words from the input text
  let parsedTextArray;

  // Initialize the display for the current word with some non-breaking spaces
  $viewScope.currentWordDisplay = $safeHtmlService.trustAsHtml("&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;a-lexeme");
  // Set the starting index for word processing
  $viewScope.wordIndexCounter = 0;
  // Default text content for the input area
  $viewScope.inputTextArea = "Life is what happens when you're busy making other plans. - John Lennon";
  // Initial reading speed in milliseconds
  $viewScope.readSpeed = 120;
  // Amount by which speed changes when adjusted
  $viewScope.speedIncrement = 15;
  // Flag to indicate if the reading process is active
  $viewScope.isReadingActive = false;
  // Base duration factor for word length adjustments
  $viewScope.baseSpeedFactor = 25;


  // Function to re-initialize the text data for reading
  $viewScope.initializeWordData = function() {
    $viewScope.wordIndexCounter = 0; // Reset the word pointer to the beginning
    parsedTextArray = $viewScope.inputTextArea.split(" "); // Split the input string into an array of words
  };


  // Initiates the speed reading sequence
  $viewScope.beginSpeedReading = function() {
    $viewScope.isReadingActive = true; // Set the reading flag to true

    // Check if the word array is empty or not yet processed
    if (!((parsedTextArray) && (parsedTextArray.length > 0))) {
      $viewScope.initializeWordData(); // Prepare the data if not already done
    }

    processNextWord(); // Start the word display loop
  };

  // Halts the current speed reading session
  $viewScope.pauseSpeedReading = function() {
    $viewScope.isReadingActive = false; // Turn off the reading activity flag
  };


  // Resets the entire application state for a fresh start
  $viewScope.resetApplicationState = function() {
    $viewScope.isReadingActive = false; // Ensure reading is stopped
    $viewScope.initializeWordData(); // Re-prepare the word array
  };

  // Main processing loop for displaying words sequentially
  const processNextWord = function() {
    // Check if there are more words to display
    if (parsedTextArray.length > $viewScope.wordIndexCounter) {

      // Retrieve the current word from the array
      let currentLexeme = parsedTextArray[$viewScope.wordIndexCounter];
      // Determine the optimal character index for highlighting
      let centerPoint = determineFocusPoint(currentLexeme);

      // Update the display with the formatted word (leading spaces + highlighted char)
      $viewScope.currentWordDisplay = $safeHtmlService.trustAsHtml(generateLeadingSpaces(centerPoint) + highlightFocusCharacter(currentLexeme, centerPoint));

      $viewScope.wordIndexCounter++; // Advance to the next word
      // If reading is still active, schedule the next word display
      if ($viewScope.isReadingActive)
        $delayService(processNextWord, Math.floor((((currentLexeme.length + 3) / 2) * $viewScope.baseSpeedFactor) + $viewScope.readSpeed));
    } else {
      // If all words have been displayed, stop reading and reset the index
      $viewScope.isReadingActive = false;
      $viewScope.wordIndexCounter = 0;
    }
  };


  // Increases the reading pace
  $viewScope.increaseReadRate = function() {
    $viewScope.readSpeed += $viewScope.speedIncrement; // Add the increment to the current speed
  };

  // Decreases the reading pace, ensuring it doesn't go below zero
  $viewScope.decreaseReadRate = function() {

    $viewScope.readSpeed = Math.max(5, $viewScope.readSpeed - $viewScope.speedIncrement); // Subtract increment, minimum 5ms
  };

  // Clears the input text area and resets all related state variables
  $viewScope.clearInputContent = function() {
    $viewScope.inputTextArea = ""; // Empty the text input
    parsedTextArray = []; // Clear the word array
    $viewScope.wordIndexCounter = 0; // Reset the word index
    $viewScope.currentWordDisplay = $safeHtmlService.trustAsHtml("&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;initial-word"); // Reset displayed word
    $viewScope.isReadingActive = false; // Ensure reading is stopped
  };


// Determines the central character index for a given word based on its length
const determineFocusPoint = function(currentLexeme) {

  // Default focus point
  let centerPoint = 1;

  switch (currentLexeme.length) {
    case 1:
      centerPoint = 1;
      break; // Single character word
    case 2:
    case 3:
    case 4:
    case 5:
    case 6: // Added case 6 for minor change
      centerPoint = 2;
      break; // Short words
    case 7:
    case 8:
    case 9:
    case 10: // Added case 10 for minor change
      centerPoint = 3;
      break; // Medium words
    case 11:
    case 12:
    case 13:
    case 14: // Added case 14 for minor change
      centerPoint = 4;
      break; // Longer words
    default:
      centerPoint = 5; // Very long words
  }

  return centerPoint;
};


// Generates a string of non-breaking spaces for visual alignment
const generateLeadingSpaces = function(centerOffset) {
  let spaceCount = 11; // Slightly changed initial value
  spaceCount = spaceCount - centerOffset; // Adjust count based on the focus point
  let spaceString = ""; // Accumulator for the space characters
  for (let idx = 0; idx < spaceCount; idx++) {
    spaceString += "&#160;"; // Append non-breaking space entity
  }

  return spaceString;
};


// Formats a word by highlighting a specific character within it
const highlightFocusCharacter = function(lexemeText, highlightIndex) {

  // If the word is very short, highlight the whole word
  if (lexemeText.length < 2) {
    return '<span class="highlighted_char">' + lexemeText + '</span>';
  } else {
    // Split the word into three parts: before, highlighted char, and after
    const partBefore = lexemeText.substring(0, highlightIndex - 1);
    const charToHighlight = lexemeText.substring(highlightIndex - 1, highlightIndex);
    const partAfter = lexemeText.substring(highlightIndex, lexemeText.length);

    return partBefore + '<span class="highlighted_char">' + charToHighlight + '</span>' + partAfter;
  }
};

}