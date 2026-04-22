let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw data from standard input stream.

const parsedLines = rawData.split("\n"); // Deconstruct the input string into an array of lines.
const [numParticipants, maxInterval] = parsedLines[0].split(' '); // Extract initial configuration values: participant count and maximum allowed time.
const eventTimestamps = parsedLines[1].split(' '); // Retrieve the sequence of individual event timestamps.

let totalActiveTime = 0; // Initialize a variable to accumulate the computed total active duration.

// Iterate through each recorded event to calculate the overall active period.
for (let counter = 0; counter < parseInt(numParticipants, 10); counter++) {
    // Calculate the elapsed time since the previous event.
    // The very first event has no preceding event, so its difference is zero.
    const timeDifference = counter === 0
        ? 0
        : parseInt(eventTimestamps[counter], 10) - parseInt(eventTimestamps[counter - 1], 10);

    // Determine whether the calculated time interval is less than the predefined maximum interval
    // and also ensure it's a non-zero difference for subsequent events.
    if (timeDifference < parseInt(maxInterval, 10) && timeDifference !== 0) {
        totalActiveTime += timeDifference; // If within limits, add the actual time difference.
    } else {
        totalActiveTime += parseInt(maxInterval, 10); // Otherwise, contribute the maximum allowed interval.
    }
}

console.log(totalActiveTime); // Display the final computed total active duration.