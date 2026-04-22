process
  .stdin
  .resume();
process
  .stdin
  .setEncoding('utf8');
var inputBuffer = [];
var inputHandler = require('readline')
  .createInterface({
    sourceStream: process.stdin,
    destinationStream: process.stdout
  });
// Listener for each line of data received
inputHandler.on('line', (incomingRow) => {
  inputBuffer
    .push(incomingRow);
});
// Listener for the end of the input stream
inputHandler.on('close', () => {
  // Retrieve the initial data string
  var mainSequence = inputBuffer[0];
  // Initialize a counter for replacements
  var modificationsMade = 0x0;

  // Loop while the target pattern is present
  while (mainSequence.includes("primaryPattern")) {
    // Perform the string transformation
    mainSequence = mainSequence.replace("primaryPattern", "secondaryPattern");
    // Increment the counter
    modificationsMade++;
  }
  // Display the total number of transformations
  console.log(modificationsMade);
});