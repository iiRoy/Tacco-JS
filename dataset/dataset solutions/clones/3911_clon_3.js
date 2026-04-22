const characterAnalysisModule = (() => {

  // A private utility function designed to count the occurrences of a single target character
  // within a given sequence of characters. This promotes modularity and reusability.
  const countSpecificCharacter = (charSequence, targetChar) => {
    let currentCount = 0; // Initialize the counter for the specified character.
    // Iterate through each character in the provided sequence.
    for (const individualChar of charSequence) {
      // If the current character matches the target character, increment the count.
      if (individualChar === targetChar) {
        currentCount++;
      }
    }
    return currentCount; // Return the final tally.
  };

  /**
   * The primary function of this module. It analyzes an input string to ascertain
   * if the characters 'a', 'b', and 'c' each appear exactly once.
   *
   * @param {string} incomingText - The raw string data received for analysis.
   * @returns {void} This function prints 'Yes' or 'No' directly to the console.
   */
  const processAndValidateCharacters = (incomingText) => {

    // Robustness check: Ensure the input provided is indeed a string.
    // If not, output an error message and terminate execution for this input.
    if (typeof incomingText !== 'string') {
      console.log('Error: Supplied input is not a valid string type.');
      return;
    }

    // Preprocessing step: Remove any leading or trailing whitespace from the input string.
    // This standardizes the input and prevents issues from extraneous spaces.
    const cleanedString = incomingText.trim();

    // Optimization: If the string becomes empty after trimming,
    // it's impossible for 'a', 'b', and 'c' to each appear once.
    // An immediate 'No' can be outputted.
    if (cleanedString.length === 0) {
      console.log('No');
      return;
    }

    // Transformation: Convert the cleaned string into an array of its constituent characters.
    // This allows for easier iteration and character-by-character processing.
    const characterArray = Array.from(cleanedString);

    // Character Counting: Utilize the private helper function to determine the frequency
    // of each target character ('a', 'b', 'c') within the character array.
    const occurrencesOfA = countSpecificCharacter(characterArray, 'a');
    const occurrencesOfB = countSpecificCharacter(characterArray, 'b');
    const occurrencesOfC = countSpecificCharacter(characterArray, 'c');

    // Validation Logic: Check if each target character appeared exactly one time.
    // Store these individual validation results in boolean variables for clarity.
    const isAFoundOnce = (occurrencesOfA === 1);
    const isBFoundOnce = (occurrencesOfB === 1);
    const isCFoundOnce = (occurrencesOfC === 1);

    // Final Decision: Based on the combined validation results,
    // print the appropriate outcome to the console.
    if (isAFoundOnce && isBFoundOnce && isCFoundOnce) {
      console.log('Yes');
    } else {
      console.log('No');
    }
  };

  // Expose the main processing function as the public interface of this module.
  return {
    executeAnalysis: processAndValidateCharacters
  };

})(); // The module is defined using an Immediately-Invoked Function Expression (IIFE).


// Entry point for the application:
// This block handles reading input from the standard input stream
// and then delegates the processing to the character analysis module.
try {
  // Dynamically import the Node.js 'fs' (File System) module.
  const fileSystemUtility = require('fs');

  // Read the entire content of the standard input stream ('/dev/stdin').
  // Specify UTF-8 encoding for text interpretation and 'r' flag for read mode.
  const standardInputContent = fileSystemUtility.readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });

  // Invoke the main analysis function from our module with the content read from stdin.
  characterAnalysisModule.executeAnalysis(standardInputContent);
} catch (inputReadError) {
  // If any error occurs during the file system operation (e.g., stdin not available),
  // log the error and proceed with an empty string as a fallback to prevent application crash.
  console.error("Error encountered while attempting to read from standard input:", inputReadError.message);
  characterAnalysisModule.executeAnalysis(''); // Provide an empty string as a default input.
}