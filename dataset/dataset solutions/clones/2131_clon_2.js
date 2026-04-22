function processTextData(rawData) {
  /*
   * This function is designed to parse a raw string of text,
   * separating it into individual elements based on newline and space delimiters.
   */
  const extractedElements = []; // An array to store all the individual data fragments.

  rawData
    .split('\n') // First, split the entire raw string into distinct lines.
    .forEach(
      lineSegment => { // Iterate over each line obtained.

        const tokenSet = lineSegment.split(' '); // Within each line, split it further by spaces to get tokens.

        tokenSet
          .forEach(
            itemUnit => extractedElements.push(itemUnit) // Add each individual token to our collection.
          );
      }
    );

  return extractedElements; // Return the full array of extracted data components.
}


// An auxiliary routine to acquire the primary input stream from a system source.
function obtainSourceData() {
  // It reads content from standard input, decodes it, and then passes it for parsing.
  return processTextData(
    require('fs')
      .readFileSync('/dev/stdin', 'utf8') // Read the file content synchronously.
  );
}


// The primary operational block of the application, encapsulated within an IIFE.
(
  function executeCoreLogic() {
    // Retrieve the pre-processed data array from the input source.
    const processedDataArray = obtainSourceData();

    // Extract the first numerical value and coerce it to a number type.
    const initialQuantity = +processedDataArray[0];

    // Extract the second numerical value and coerce it to a number type.
    const baseValue = +processedDataArray[1];

    // Perform the central arithmetic computation.
    // This calculation involves a base value, a constant multiplier, and a difference based on the initial quantity.
    const finalResult = baseValue + 100 * (10 - initialQuantity);

    // Display the computed final outcome to the standard output.
    console.log(finalResult);
  }
)();