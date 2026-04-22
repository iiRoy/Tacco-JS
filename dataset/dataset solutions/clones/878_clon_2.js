// This script processes time-based event data from standard input.
// It identifies specific conditions based on time differences.

const fileSystemModule = require('fs');
let totalInputSize = fileSystemModule.fstatSync(process.stdin.fd).size;
let dataContainer = new Buffer(totalInputSize);
let octetsProcessed = fileSystemModule.readSync(process.stdin.fd, dataContainer, 0, totalInputSize, 0);
let textLines = dataContainer.toString('utf8', 0, octetsProcessed).split('\n');

processInputData(); // Invoke the primary execution routine

/*
 * Converts a time string "HH:MM" into total minutes from midnight.
 * @param {string} timeExpression - The time string to convert.
 * @returns {number} The total minutes.
 */
function convertTimeToMinutes(timeExpression) {
  let timeParts = timeExpression.split(':');
  // Using parseInt for explicit type conversion from string to integer
  return parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10);
}

function processInputData() {
  const initialTokens = textLines[0].split(' ');
  let numberOfEntries = Number(initialTokens[0]); // Explicit Number conversion for the first value
  let maximumAllowedDelay = Number(initialTokens[1]); // Explicit Number conversion for the second value

  const secondLineTokens = textLines[1].split(' ');
  let firstMoment = convertTimeToMinutes(secondLineTokens[0]);
  let firstLocation = secondLineTokens[1];
  let secondMoment = convertTimeToMinutes(secondLineTokens[2]);
  let secondLocation = secondLineTokens[3];

  let collectedResults = []; // Array to store matching entries

  // Iterate through subsequent data records starting from the third line
  for (let recordIndex = 2; recordIndex <= numberOfEntries; recordIndex++) {
    const currentRecordFields = textLines[recordIndex].split(' ');
    firstMoment = convertTimeToMinutes(currentRecordFields[0]);

    // Check if the maximum allowed delay condition is met
    if (maximumAllowedDelay <= firstMoment - secondMoment) {
      collectedResults.push([secondLocation, firstMoment - secondMoment]);
    }
    firstLocation = currentRecordFields[1];
    secondMoment = convertTimeToMinutes(currentRecordFields[2]);
    secondLocation = currentRecordFields[3];
    // console.debug(`Debug: ${firstMoment}, ${firstLocation}, ${secondMoment}, ${secondLocation}`);
  }

  // Output the total count of identified result sets
  console.log(collectedResults.length);

  // Display each result set on a new line, separated by a space
  for (let j = 0; j < collectedResults.length; j++) {
    console.log(`${collectedResults[j][0]} ${collectedResults[j][1]}`); // Using template literals for clarity
  }
} // End of processInputData function