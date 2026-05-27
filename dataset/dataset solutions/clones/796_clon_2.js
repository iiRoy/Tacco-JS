var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input from standard input
var dataLines = rawData.split('\n'); // Split the input string into an array of lines

var currentLine = null; // Initialize a variable to hold the current line being processed
while ( (currentLine = dataLines.shift()) ) { // Loop through each line of input data
    var countOfItems = parseInt(currentLine); // Parse the current line as an integer, representing the number of subsequent items

    if (countOfItems === 0) { // If the parsed number is zero, it signifies the end of input
        break; // Exit the processing loop
    }

    var timeSlots = []; // Initialize an array to store time slot pairs for the current test case

    for (var idxA = 0; idxA < countOfItems; idxA++) { // Loop to read 'countOfItems' number of time slots
        currentLine = dataLines.shift(); // Get the next line, which contains two time strings
        var timeValues = currentLine.split(' ').map(function(timeStr) { // Split the line by space and convert time strings to numeric timestamps
            // Convert time string (e.g., "HH:MM") into a numeric timestamp by creating a Date object
            // using a fixed date and then getting its numeric value.
            return +(new Date('2000-01-01 ' + timeStr));
        });
        timeSlots.push(timeValues); // Add the processed time pair (start and end timestamps) to the array
    }

    var maxTrainsNeeded = 1; // Initialize the maximum number of trains required for this set of slots to at least 1

    // This nested loop structure aims to find the maximum number of overlapping intervals.
    // It simulates assigning trains by iteratively removing intervals that can be covered by the current train.
    for (var idxA = 0; idxA < timeSlots.length; idxA++) { // Iterate through each time slot
        var currentSlot = timeSlots[idxA]; // Get the current time slot being evaluated

        var currentTrainCount = 1; // Initialize train count for the current slot's "train path"
        var indicesToRemove = []; // Array to store indices of slots that overlap with 'currentSlot' and need to be "removed"

        for (var idxB = idxA + 1; idxB < timeSlots.length; idxB++) { // Compare current slot with subsequent slots
            var subsequentSlot = timeSlots[idxB]; // Get a subsequent time slot

            // Check for non-overlapping conditions:
            // If currentSlot ends before or at subsequentSlot starts (currentSlot[1] <= subsequentSlot[0]), OR
            // If subsequentSlot starts before or at currentSlot starts (subsequentSlot[0] <= currentSlot[0]),
            // then these slots do not overlap in a way that requires a new train for the 'currentSlot' logic.
            if (currentSlot[1] <= subsequentSlot[0] || subsequentSlot[0] <= currentSlot[0]) {
                // No overlap or subsequent slot is entirely before current slot, so do nothing.
            } else {
                // If they overlap, increment the train count and mark the subsequent slot for removal.
                indicesToRemove.push(idxB); // Mark this slot's index for removal
                currentTrainCount++; // Increment the count of trains needed for this specific 'currentSlot'
            }
        }

        // After checking all subsequent slots, "remove" the overlapping ones by setting them to null.
        indicesToRemove.forEach(function(removedIdx) {
            timeSlots[removedIdx] = null; // Set overlapping slots to null
        });

        // Filter out all null entries from the timeSlots array.
        // This effectively removes the slots that were covered by the current "train path".
        timeSlots = timeSlots.filter(function(potentialSlot) {
            return potentialSlot !== null; // Keep only non-null slots
        });

        // Update the overall maximum trains needed if the current train count is higher.
        maxTrainsNeeded = Math.max(maxTrainsNeeded, currentTrainCount);
    }

    console.log(maxTrainsNeeded); // Output the result for the current set of time slots
}
