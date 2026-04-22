/*
 * This module handles the primary computation logic.
 * It processes raw text input to produce a specific numerical output.
 */
function calculateResult(receivedText)
{
   // Remove any leading or trailing whitespace from the received string data.
   receivedText = receivedText.trim();

   // Split the cleaned string by a space delimiter and convert each resulting segment into a numeric value.
   const numberArray = receivedText.split(" ").map(Number);

   // Compute the sum of the first two elements and then find the remainder when divided by 24, displaying the final value.
   console.log((numberArray[0] + numberArray[1]) % 24);
}

// Initial invocation: obtain content from standard input using the Node.js 'fs' module and pass it to the main processing function.
calculateResult(require('fs').readFileSync('/dev/stdin', 'utf8'));