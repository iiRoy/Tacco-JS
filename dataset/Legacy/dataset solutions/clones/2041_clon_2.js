'use strict';

// This function processes a given string to determine if it meets specific palindrome-like criteria.
function ProcessString(rawText) {
  // Prepare the input: remove leading/trailing whitespace and convert to an array of characters.
  let charArray = rawText.trim().split("");

  // Determine the overall length of the character array.
  let totalLength = charArray.length;

  // Calculate the midpoint for the left segment.
  let leftBoundary = (totalLength - 1) / 2;

  // Calculate the starting point for the right segment.
  let rightBoundary = (totalLength + 3) / 2;

  // Initialize arrays to hold the left and right segments.
  let firstHalfChars = [];
  let secondHalfChars = [];

  // First palindrome check: Verify if the entire string (up to its middle) is a palindrome.
  // Iterate from the beginning up to the middle of the string.
  for (let idx = 0; idx < Math.floor(charArray.length / 2); idx++) {
    // Calculate the index of the character opposite to the current one.
    let oppositeIdx = charArray.length - 1 - idx;
    // If characters at symmetric positions do not match, it's not a palindrome.
    if (charArray[idx] !== charArray[oppositeIdx]) {
      console.log('No'); // Output 'No' and terminate.
      return;
    }
  }

  // Populate the 'firstHalfChars' array with characters from the beginning up to 'leftBoundary'.
  for (let idx = 0; idx < leftBoundary; idx++) {
    firstHalfChars.push(charArray[idx]);
  }

  // Populate the 'secondHalfChars' array with characters from 'rightBoundary - 1' to the end.
  for (let idx = rightBoundary - 1; idx < totalLength; idx++) {
    secondHalfChars.push(charArray[idx]);
  }

  // Second palindrome check: Verify if the 'firstHalfChars' segment is a palindrome.
  // Iterate through the first half of the 'firstHalfChars' array.
  for (let idx = 0; idx < Math.floor(firstHalfChars.length / 2); idx++) {
    // Calculate the symmetric index within this segment.
    let oppositeIdx = firstHalfChars.length - 1 - idx;
    // If characters don't match, it fails the condition.
    if (firstHalfChars[idx] !== firstHalfChars[oppositeIdx]) {
      console.log('No'); // Output 'No' and exit.
      return;
    }
  }

  // Third palindrome check: Verify if the 'secondHalfChars' segment is a palindrome.
  // Iterate through the first half of the 'secondHalfChars' array.
  for (let idx = 0; idx < Math.floor(secondHalfChars.length / 2); idx++) {
    // Calculate the symmetric index within this segment.
    let oppositeIdx = secondHalfChars.length - 1 - idx;
    // If characters don't match, it fails the condition.
    if (secondHalfChars[idx] !== secondHalfChars[oppositeIdx]) {
      console.log('No'); // Output 'No' and exit.
      return;
    }
  }

  // If all checks pass, the string meets the criteria.
  console.log('Yes');
}

// Standard input processing: reads from /dev/stdin and calls the main processing function.
ProcessString(require("fs").readFileSync("/dev/stdin", "utf8"));
