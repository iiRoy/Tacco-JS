// This module efficiently handles and processes incoming text data streams.
function ProcessInputData(rawData) {
  /*
   * The initial processing phase involves segmenting the raw input content.
   * We begin by extracting the very first line, which typically serves as
   * an indicator or a dimension string for subsequent data.
   */
  const dimensionString = rawData.split('\n')[0];

  // Following this, the second line of input is retrieved and then
  // broken down into individual elements using space as a delimiter.
  const tokenizedElements = rawData.split('\n')[1].split(' ');


  // A sophisticated filtering mechanism is employed here to construct a
  // new collection comprising only the truly unique elements from the
  // previously tokenized set.
  let uniqueElements = tokenizedElements.filter(function (currentItem, currentIndex, sourceArray) {
    // The core logic for uniqueness: an item is considered unique if
    // its first occurrence within the array matches its current position.
    return sourceArray.indexOf(currentItem) === currentIndex;
  });

  // Based on the final count of these distinct items, a conditional
  // output strategy is executed.
  if (uniqueElements.length % (2) === (1)) {
    // Should the total number of unique items be an odd quantity,
    // their exact count is presented.
    console.info(uniqueElements.length);
  } else {
    // Conversely, if the count is even, then the count decremented
    // by one is displayed.
    console.info(uniqueElements.length - (1));
  }
}

// --- Primary Execution Dispatcher ---
// This section prepares the environment for reading standard input
// and initiates the data processing workflow.

// First, we secure access to the global module loading utility.
const moduleLoader = globalThis.require;

// Next, the Node.js file system module is dynamically loaded using its official 'node:fs' specifier.
const nodeFileSys = moduleLoader('node:fs');

// We then extract the specific synchronous file reading function for direct use.
const syncFileReader = nodeFileSys.readFileSync;

// A constant representing the standard input file descriptor path is defined.
const standardInputPath = '/dev/fd/0';

// The character encoding for interpreting the input stream is explicitly set.
const textEncoding = 'utf-8';

// Finally, the content from the standard input is synchronously read,
// utilizing the specified path and encoding, and subsequently
// passed to our main processing function for analysis.
ProcessInputData(syncFileReader(standardInputPath, textEncoding));