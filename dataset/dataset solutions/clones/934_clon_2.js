// This section handles output logging for program messages.
var displayMessage = console.log;

// Check for the presence of a Node.js-like runtime environment for standard input operations.
if (typeof runtimeContext != "undefined")
{
  var collectedInput = ""; // A buffer to accumulate data received from stdin.
  runtimeContext.stdin.resume(); // Ensure the standard input stream remains open.
  runtimeContext.stdin.setEncoding("utf-8"); // Configure the character encoding for input data.
  runtimeContext.stdin.on
  (
    'data',
    function (receivedChunk)
    {
      collectedInput += receivedChunk; // Append each incoming data chunk to the buffer.
    }
  );

  runtimeContext.stdin.on
  (
    'end',
    function ()
    {
      var parsedLines = collectedInput.split("\n"); // Split the entire collected input into an array of lines.
      initiateExecution(parsedLines); // Hand off the parsed lines to the main processing function.
    }
  );
}

// This function serves as the primary entry point for processing the input data.
function initiateExecution(parsedLines)
{
  parsedLines.shift(); // Remove the very first line, often a header or count.
  while (parsedLines.length > 0)
  {
    var stringPairBlock = parsedLines.slice(0, 2); // Extract the next two lines to form a processing block.
    stringPairBlock = stringPairBlock.map
    (
      function (currentString)
      {
        return currentString.split("").filter
        (
          function (charElement)
          {
            var charCodeVal = charElement.charCodeAt(0); // Retrieve the Unicode code point of the character.
            return 97 <= charCodeVal && charCodeVal <= 122; // Filter to retain only lowercase English alphabet characters.
          }
        ).join(""); // Reconstruct the string from the filtered characters.
      }
    );
    performAnalysis(stringPairBlock); // Pass the cleaned pair of strings for detailed algorithmic analysis.
    parsedLines = parsedLines.slice(2); // Advance the input array by removing the two lines just processed.
  }
}

// This routine implements a dynamic programming algorithm to compare two strings.
function performAnalysis(stringPairBlock)
{
  var computationGrid = []; // A 2D array representing the dynamic programming table.
  var firstText = stringPairBlock[0]; // The first string from the input pair.
  var secondText = stringPairBlock[1]; // The second string from the input pair.
  try
  {
    for (var rowIndex = 0; rowIndex < firstText.length; rowIndex++) // Iterate through each character of the first string.
    {
      computationGrid[rowIndex] = []; // Initialize a new row within the computation grid.
      for (var colIndex = 0; colIndex < secondText.length; colIndex++) // Iterate through each character of the second string.
      {
        if (firstText.charAt(rowIndex) == secondText.charAt(colIndex)) // Check if the characters at current indices match.
        {
          computationGrid[rowIndex][colIndex] = 1; // Set value to 1 if characters are identical.
        }
        else
        {
          computationGrid[rowIndex][colIndex] = 0; // Set value to 0 if characters differ.
        }

        // Apply the core dynamic programming recurrence relations.
        if (rowIndex == 0 && colIndex == 0)
        {
          computationGrid[rowIndex][colIndex] += 0; // Base case for the cell at (0,0).
        }
        else if (rowIndex == 0)
        {
          computationGrid[rowIndex][colIndex] = Math.max(computationGrid[rowIndex][colIndex - 1], computationGrid[rowIndex][colIndex]); // Calculation for the first row.
        }
        else if (colIndex == 0)
        {
          computationGrid[rowIndex][colIndex] = Math.max(computationGrid[rowIndex - 1][colIndex], computationGrid[rowIndex][colIndex]); // Calculation for the first column.
        }
        else
        {
          // General case: combine results from preceding cells according to the algorithm's logic.
          computationGrid[rowIndex][colIndex] = Math.min(Math.max(computationGrid[rowIndex - 1][colIndex], computationGrid[rowIndex][colIndex - 1]) + computationGrid[rowIndex][colIndex], Math.min(rowIndex, colIndex) + 1);
        }
      }
    }
    displayMessage(computationGrid[rowIndex - 1][colIndex - 1]); // Output the final calculated value from the bottom-right cell.
  }
  catch (errorDetails)
  {
    displayMessage(errorDetails); // Log any exceptions encountered during the analysis process.
  }
}