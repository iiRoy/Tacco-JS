var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire all input data from the standard input stream.
var dataRows = rawData.split('\n'); // Divide the raw input into an array of individual lines.

var currentLine = null; // Declare a variable to hold the line currently being processed.

// Iterate through each line of the input data until an empty line or '0' is encountered.
while (currentLine = dataRows.shift()) {
    var entryCount = parseInt(currentLine); // Convert the current line to an integer, representing the number of subsequent entries.

    // If the parsed number is zero, it signals the end of the input sequence.
    if (entryCount === 0) {
        break; // Terminate the main processing loop.
    }

    var timeSlots = []; // Initialize an array to store the time interval pairs for the current test case.

    // Loop to read and parse the specified number of time interval entries.
    for (var idxA = 0; idxA < entryCount; idxA++) {
        currentLine = dataRows.shift(); // Retrieve the next line, which contains the start and end times.

        // Split the time string by space and convert each time component into a numerical timestamp.
        var timePoints = currentLine.split(' ').map(function(timeStr) {
            // Create a Date object with a fixed date and the given time string, then convert to milliseconds.
            return +(new Date('2000-01-01 ' + timeStr));
        });
        timeSlots.push(timePoints); // Add the resulting start and end timestamps to the collection.
    }

    var maxConcurrentTrains = 1; // Initialize the maximum number of overlapping trains found for this set of intervals.

    // Iterate through each time slot to determine the maximum concurrency starting from that slot.
    for (var idxA = 0; idxA < timeSlots.length; idxA++) {
        var currentSlot = timeSlots[idxA]; // Select the current time slot for comparison.

        var concurrentTrains = 1; // Start counting concurrent trains, including the current slot itself.
        var slotsToRemove = []; // An array to temporarily store indices of slots that overlap with 'currentSlot'.

        // Compare 'currentSlot' with all subsequent time slots in the array.
        for (var idxB = idxA + 1; idxB < timeSlots.length; idxB++) {
            var nextSlot = timeSlots[idxB]; // Get the next time slot for overlap checking.

            // Check if 'currentSlot' and 'nextSlot' do NOT overlap.
            // Overlap occurs if (currentSlot.start < nextSlot.end AND currentSlot.end > nextSlot.start).
            // The condition below checks for non-overlap:
            // (currentSlot ends before nextSlot starts) OR (nextSlot starts before currentSlot starts).
            if (currentSlot[1] <= nextSlot[0] || nextSlot[0] <= currentSlot[0]) {
                // No overlap, proceed to the next slot.
            } else {
                // Overlap detected: mark 'nextSlot' for conceptual removal in this iteration.
                slotsToRemove.push(idxB);
                concurrentTrains++; // Increment the count of concurrent trains.
            }
        }

        // For each slot identified as overlapping, set its entry in the main array to null.
        slotsToRemove.forEach(function(removeIdx) {
            timeSlots[removeIdx] = null;
        });

        // Filter out all null entries from the 'timeSlots' array, effectively 'removing' them.
        timeSlots = timeSlots.filter(function(processedSlot) { return processedSlot !== null; });

        // Update the overall maximum concurrent trains if the current count is higher.
        maxConcurrentTrains = Math.max(maxConcurrentTrains, concurrentTrains);
    }
    console.log(maxConcurrentTrains); // Output the calculated maximum concurrent trains for the current test case.
}
