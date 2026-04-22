function ProcessInput(rawData) {
  // Divide the incoming text by newline characters to get individual lines.
  const processedLines = rawData.split('\n');

  // Extract the first line and convert it to an integer, representing an initial quantity.
  const initialQuantity = parseInt( processedLines.shift() );

  // Filter the remaining lines to find unique entries, preserving their original order.
  const uniqueEntries = processedLines.filter( (currentElement, position) => processedLines.indexOf(currentElement) === position );
}

/*
 * This section should not be modified.
 * It handles reading input from standard I/O and invoking the primary processing function.
 */
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );