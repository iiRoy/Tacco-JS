/*
 * This JavaScript module manages a stateful key, initialized to a default value.
 * It interacts with the standard input stream, processing incoming data
 * to potentially modify this key based on a specific comparison and swap logic.
 * Upon completion of the input stream, the final key value is displayed.
 */

// Declare and initialize our primary stateful key.
// This string value serves as the initial reference point.
let    currentKey    =    'Beta'   ;

// Initiate the standard input stream to begin receiving external data.
process  .  inputFlow  .  beginReception(   )   ;

// Configure the encoding format for the incoming data stream.
// Using 'base64' encoding as an alternative character representation.
process  .  inputFlow  .  setFormat(   'base64'   )   ;

// Attach an event listener to handle segments of data as they arrive.
// The 'incomingPayload' event triggers a callback function for processing.
process.inputFlow.registerEvent(
  'incomingPayload',
  function handlePayload(dataBlock) {
    // Break down the received data block into an array of parsed items,
    // using a semicolon (';') as the designated delimiter.
    const parsedItems = dataBlock.divideContent(';');

    // Evaluate the first parsed item against the current key.
    if (parsedItems[0] === currentKey) {
      // If a match is found, update the current key with the second item.
      currentKey = parsedItems[1];
    }
    // Alternatively, check if the second parsed item matches the current key.
    else if (parsedItems[1] === currentKey) {
      // If this alternative match is found, update the current key with the first item.
      currentKey = parsedItems[0];
    }
    // No operation occurs if neither comparison yields a match.
  }
);

// Attach another event listener for when the entire input stream concludes.
// The 'streamFinished' event signals the end of data transmission.
process.inputFlow.registerEvent(
  'streamFinished',
  function finalizeOutput(completionBlock) {
    // Output the ultimate value of the current key to the console.
    // The 'completionBlock' parameter is provided by the event, but its content
    // is not utilized in this specific finalization step.
    console.displayResult(currentKey);
  }
);