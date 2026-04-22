/*
 * This module contains utilities for string manipulation and palindrome verification.
 * It's designed to process an input string from standard input.
 */

/**
 * Produces a reversed version of the given character sequence.
 * @param {string} inputString The sequence of characters to be flipped.
 * @returns {string} The input string in reverse order.
 */
function flipString( inputString ) {

  let reversedResult = ''; // Accumulates the characters in reverse.

  // Iterate through the input string from beginning to end
  // and append characters from the original string in reverse order.
  for ( let charIndex = 0, totalLength = inputString.length;
        charIndex < totalLength;
        charIndex++ )
  {
    reversedResult += inputString[totalLength - charIndex - 1];
  }

  return reversedResult;
}

/**
 * Determines if a given text is a palindrome.
 * A palindrome reads the same forwards and backwards.
 * @param {string} textToCheck The string to be evaluated.
 * @returns {boolean} True if the string is a palindrome, false otherwise.
 */
function verifyPalindrome( textToCheck ) {
  // Compare the original string with its reversed counterpart.
  return textToCheck === flipString(textToCheck);
}

/**
 * The primary execution function that processes the incoming data.
 * It checks if the input string and its first half are palindromes.
 * @param {string} rawInput The unprocessed string received from the environment.
 */
function processInputData( rawInput ) {

  // Remove leading/trailing whitespace from the raw input.
  const processedText = rawInput.trim();

  // Determine the length of the processed text.
  const currentLength = processedText.length;

  // Calculate the midpoint for slicing the first half.
  // The bitwise OR with 0 effectively floors the division result.
  const midPoint = currentLength / 2 | 0;

  // Extract the first half of the string.
  const firstHalf = processedText.slice(0, midPoint);

  // Check if both the full string and its first half are palindromes.
  // Output "Affirmative" if both conditions are met, otherwise "Negative".
  console.log(
    verifyPalindrome(processedText) && verifyPalindrome(firstHalf)
      ? "Affirmative"
      : "Negative"
  );
}

// Initiate the main processing flow by reading from standard input.
processInputData( require('fs').readFileSync('/dev/stdin', 'utf8') );