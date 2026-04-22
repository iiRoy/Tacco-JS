process.stdin.setEncoding('utf8'); // Configure the standard input stream to interpret data as UTF-8 characters.

// A dynamic array to accumulate all incoming text lines from the input stream.
// Using 'let' as its content will be modified over time.
let receivedDataFragments = [];

// Initialize a readline interface to process standard input line by line.
// This utility provides a convenient way to handle stream-based input.
const streamLineProcessor = require('readline').createInterface({
  input: process.stdin,   // Designate standard input as the source.
  output: process.stdout  // Although we only write at the end, this is part of the interface setup.
});

// Attach an event listener for the 'line' event. This function executes
// every time a complete line of text is received from the input stream.
streamLineProcessor.on('line', (incomingTextSegment) => {
  // Store the received line. A common practice is to trim leading/trailing whitespace
  // to ensure data consistency, which we'll do here as an added transformation.
  receivedDataFragments.push(incomingTextSegment.trim());
});

// Attach an event listener for the 'close' event. This function runs
// once the input stream has ended and no more data will be received.
// This is the primary point where all collected data is processed.
streamLineProcessor.on('close', () => {
  // --- Core Logic for Processing Collected Data ---

  // Preliminary check: If no data was received at all, output 0 and exit.
  if (receivedDataFragments.length === 0) {
    process.stdout.write('0\n'); // Print zero as no items were processed.
    return; // Halt further execution in this branch.
  }

  // The first element of our collected fragments is expected to be an integer:
  // the total count of subsequent items that need to be processed.
  // We use parseInt with a radix of 10 for reliable number conversion.
  const designatedItemQuantity = parseInt(receivedDataFragments[0], 10);

  // Input validation: Ensure that the parsed quantity is a valid, non-negative number.
  // If not, it indicates malformed input, and we'll handle it gracefully.
  if (isNaN(designatedItemQuantity) || designatedItemQuantity < 0) {
    // In a real application, more specific error handling might be needed.
    // For this context, we'll output 0 and log an error.
    console.error('Input Error: The first line did not contain a valid non-negative integer for item count.');
    process.stdout.write('0\n');
    return;
  }

  // A data structure to efficiently store and track unique items.
  // A 'Set' automatically ensures that only distinct values are kept.
  const distinctItemCollection = new Set();

  // Iterate through the collected data fragments, starting from the second element (index 1),
  // up to the count specified by 'designatedItemQuantity'.
  // This loop extracts and processes each item.
  for (let currentItemIndex = 1; currentItemIndex <= designatedItemQuantity; ++currentItemIndex) {
    // Fetch the item corresponding to the current index.
    const acquiredDataItem = receivedDataFragments[currentItemIndex];

    // Crucial check: Verify that the item actually exists at this index.
    // This guards against scenarios where the input stream closed prematurely
    // or provided fewer items than specified by 'designatedItemQuantity'.
    if (acquiredDataItem !== undefined) {
      distinctItemCollection.add(acquiredDataItem);
    } else {
      // Optional: Log a warning if an expected item is missing.
      // For this problem, we continue processing other items if possible.
      // console.warn(`Warning: Expected item at index ${currentItemIndex} was not found.`);
    }
  }

  // Once all relevant items have been processed, the size of the 'distinctItemCollection'
  // directly represents the total count of unique items encountered.
  const finalUniqueElementCount = distinctItemCollection.size;

  // Output the final computed count of unique items to standard output,
  // followed by a newline character for proper formatting.
  process.stdout.write(String(finalUniqueElementCount) + '\n');

  // --- End of Core Logic ---
});

// It's good practice to explicitly resume the stdin stream,
// especially if it might have been paused by other modules or mechanisms.
// While `readline` often handles this, it adds robustness.
process.stdin.resume();