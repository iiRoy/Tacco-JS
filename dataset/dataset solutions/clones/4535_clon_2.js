// This module defines a function for processing specific text input.
// It aims to balance parentheses within a given string segment.
function processInput( rawDataString )
{
  // Divide the complete raw data into distinct line segments.
  let lineSegments = rawDataString.split("\n");

  // The first segment often contains a numerical indicator,
  // which will be used as the starting point for the first iteration.
  let initialLengthIndicator = lineSegments[0];

  // The second segment is the primary string that requires balancing.
  let originalStringValue = lineSegments[1];

  // Convert the primary string into a mutable array of characters for in-place manipulation.
  let workingCharacterArray = lineSegments[1].split("");

  // Initialize two accumulators: one for necessary opening parentheses at the start,
  // and another for necessary closing parentheses at the end.
  let prefixParentheses = "";
  let suffixParentheses = "";

  // Begin a reverse iteration to identify and remove perfectly matched parenthesis pairs.
  // This strategy helps in cleaning up the string by eliminating inner, balanced structures first.
  for (let outerIndexCounter = initialLengthIndicator; outerIndexCounter >= 0; outerIndexCounter -= 1)
  {
    // If a closing parenthesis is encountered, search backwards for its matching opening counterpart.
    if (workingCharacterArray[outerIndexCounter] === ")")
    {
      for (let innerIndexCounter = outerIndexCounter - 1; innerIndexCounter >= 0; innerIndexCounter -= 1)
      {
        // Upon finding an opening parenthesis that matches the current closing one,
        // remove both from the array. The order of removal is crucial to prevent index issues.
        if (workingCharacterArray[innerIndexCounter] === "(")
        {
          workingCharacterArray.splice(outerIndexCounter, 1);
          workingCharacterArray.splice(innerIndexCounter, 1);
          break; // A pair has been removed; exit the inner loop to continue searching for more pairs.
        }
      }
    }
  }

  // After the initial cleanup, iterate through the remaining characters in the array.
  // Any character left is an unmatched parenthesis that needs balancing.
  for (let outerIndexCounter = 0, currentArrayLength = workingCharacterArray.length; outerIndexCounter < currentArrayLength; outerIndexCounter += 1)
  {
    // If a closing parenthesis remains, it means an opening one is missing at the beginning.
    if (workingCharacterArray[outerIndexCounter] === ")")
    {
      prefixParentheses += "(";
    }
    // If an opening parenthesis remains, it means a closing one is missing at the end.
    else
    {
      suffixParentheses += ")";
    }
  }

  // Output the final balanced string, composed of the generated prefix, the original string,
  // and the generated suffix.
  console.info( prefixParentheses + originalStringValue + suffixParentheses );
}

// Invoke the primary processing function with data read from standard input.
// This setup is common in competitive programming environments.
processInput( require("fs").readFileSync("/dev/stdin", "utf8") );