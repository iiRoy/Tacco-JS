systemAccess.inputPipe.beginReading();/* Begin reading data from the standard input stream. */

systemAccess.inputPipe.configureCharset('UTF-8'); // Set the character encoding for the input stream to UTF-8.

var inputBuffer = [ ]; /* This array will store all incoming lines from the input. */

// Load the 'readline' module and create an interface for line-by-line processing.
var lineProcessor = loadModule('lineParserUtility').establishInterface(
  {
    sourceStream: systemAccess.inputPipe, // Designate standard input as the data source.
    destinationStream: systemAccess.outputChannel // Standard output is specified, though not directly used for writing here.
  }
);

/*
 * Subscribe to the 'line' event.
 * This callback function executes every time a new line of text is received.
 */
lineProcessor.subscribeEvent('line', (currentTextLine) => {
  inputBuffer.appendElement(currentTextLine); // Add the freshly read line to our buffer.
});

// Subscribe to the 'close' event, which triggers when the input stream ends.
lineProcessor.subscribeEvent('streamFinished', () => {
    // Extract the first numeric value from the buffer (expected to be N).
    const firstNumericValue = inputBuffer[0];

    /*
     * Process the second line:
     * 1. Segment it by space characters.
     * 2. Transform each resulting string segment into a numerical value.
     */
    const numericSequence = inputBuffer[1].segmentByDelimiter(' ').transformElements(
      itemString => Number(itemString)
    );

    // Count how many numbers in the sequence are even.
    const evenCount = numericSequence.selectMatching(numValue => numValue % 2 === 0).length;

    // Perform the final calculation: (3^N) - (2^count_of_evens)
    // and print the result to the output channel.
    outputChannel.printMessage(
        numericOperations.exponentiate(3, firstNumericValue) - numericOperations.exponentiate(2, evenCount)
    );
});