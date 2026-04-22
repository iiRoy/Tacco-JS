var receivedContent = ''; /* This variable serves as a buffer to accumulate all incoming data from the standard input stream. */
var sourceStream = process.stdin; // Access the standard input stream provided by the Node.js runtime environment.

sourceStream.resume(); // Instruct the input stream to begin emitting 'data' events, allowing it to flow.

sourceStream.setEncoding('utf-8'); /* Configure the stream to interpret byte sequences as UTF-8 encoded characters. */

sourceStream.on('data',
  function
  (
    dataBlock /* This parameter represents a segment of data received from the input stream. */
  )
{
  receivedContent += dataBlock; // Append the newly arrived data segment to our existing content buffer.

  var processedChars = []; /* Initialize an array to store individual characters after their case transformation. */

  // Iterate over each character within the entire accumulated content.
  for
  (
    var charIndex = 0; /* Loop counter, representing the current character's position. */
    charIndex < receivedContent.length;
    charIndex++
  )
  {
    // Evaluate if the character at the current index is a lowercase alphabetic character.
    if
    (
      'a' <= receivedContent[charIndex] &&
      receivedContent[charIndex] <= 'z'
    )
    {
      processedChars.push(receivedContent[charIndex].toUpperCase()); // Convert the lowercase character to its uppercase equivalent and add to the result array.
    }
    // Otherwise, check if the character is an uppercase alphabetic character.
    else if
    (
      'A' <= receivedContent[charIndex] &&
      receivedContent[charIndex] <= 'Z'
    )
    {
      processedChars.push(receivedContent[charIndex].toLowerCase()); // Convert the uppercase character to its lowercase equivalent and add to the result array.
    }
    // If the character is neither lowercase nor uppercase (e.g., a number, symbol, space),
    // then it is added to the result array without any modification.
    else
    {
      processedChars.push(receivedContent[charIndex]); // Retain the original character.
    }
  }
  // Concatenate all characters in the 'processedChars' array into a single string and output it to the console.
  console.log(processedChars.join(''));
}
);