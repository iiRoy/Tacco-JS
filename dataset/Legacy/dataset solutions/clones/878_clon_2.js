const fileSystemModule = require('fs'); // Import the Node.js file system module.

// Determine the total byte size of the standard input stream.
const dataSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Create a new buffer to store the incoming data.
const dataBuffer = new Buffer(dataSize);

// Read the entire content from standard input into the buffer.
const readBytesCount = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);

// Convert the buffer's content to a UTF-8 string and split it into an array of lines.
const inputLines = dataBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Initiate the primary processing routine.
processSchedule();

/**
 * Converts a time string in "HH:MM" format to its equivalent in total minutes from midnight.
 * @param {string} timeString - The time string to convert.
 * @returns {number} The total number of minutes.
 */
function convertTimeToMinutes(timeString) {
  // Split the time string by the colon to separate hours and minutes.
  const timeParts = timeString.split(':');
  // Calculate total minutes: (hours * 60) + minutes. The unary plus converts string parts to numbers.
  return +timeParts[0] * 60 + +timeParts[1];
}

/**
 * The main function that processes the schedule data from the input lines.
 * It identifies potential connections based on a maximum waiting time.
 */
function processSchedule() {
  // Parse the first line of input to get the total number of entries and the maximum allowed wait time.
  let lineSegments = inputLines[0].split(' ');
  const totalEntries = +lineSegments[0]; // Number of schedule entries.
  const maxWaitTime = +lineSegments[1]; // Maximum allowed waiting time in minutes.

  // Parse the second line of input to initialize the first set of schedule details.
  lineSegments = inputLines[1].split(' ');
  let currentDepartureTime = convertTimeToMinutes(lineSegments[0]); // Departure time of the current leg.
  let currentDepartureStation = lineSegments[1]; // Departure station of the current leg.
  let previousArrivalTime = convertTimeToMinutes(lineSegments[2]); // Arrival time of the previous leg.
  let previousArrivalStation = lineSegments[3]; // Arrival station of the previous leg.

  // An array to store the identified possible connections.
  const possibleConnections = [];

  // Loop through the remaining schedule entries, starting from the third line (index 2).
  for (let entryIndex = 2; entryIndex <= totalEntries; entryIndex++) {
    lineSegments = inputLines[entryIndex].split(' '); // Split the current line into segments.
    currentDepartureTime = convertTimeToMinutes(lineSegments[0]); // Update current departure time.

    // Check if the waiting time between the previous arrival and current departure meets the criteria.
    if (maxWaitTime <= currentDepartureTime - previousArrivalTime) {
      // If the condition is met, add this connection to the list.
      possibleConnections.push([previousArrivalStation, currentDepartureTime - previousArrivalTime]);
    }

    // Update the previous leg's details for the next iteration.
    currentDepartureStation = lineSegments[1]; // Update current departure station (though not used later in loop).
    previousArrivalTime = convertTimeToMinutes(lineSegments[2]); // Update previous arrival time.
    previousArrivalStation = lineSegments[3]; // Update previous arrival station.
  }

  // Output the total count of possible connections found.
  console.log(possibleConnections.length);

  // Iterate through the found connections and print each one.
  for (let entryIndex = 0; entryIndex < possibleConnections.length; entryIndex++) {
    // Print the arrival station and the waiting duration for each connection.
    console.log(possibleConnections[entryIndex][0] + ' ' + possibleConnections[entryIndex][1]);
  }
}
