let totalSecondsInDay = 24 * 60 * 60; // Calculate the total number of seconds in a day.

/* The main function to process time event data. */
function processTimeEvents() {
    let numberOfEntries; // Declaration of variable to hold event count.

    // This outer loop continually processes input blocks.
    // It breaks only when an input of '0' is encountered for the number of entries.
    while (true) {
        // Synchronously read a line of input and parse it as an integer.
        // This mimics Python's `int(raw_input())`.
        let rawInputLine = getSynchronousInput();
        numberOfEntries = parseInt(rawInputLine);


        // Check for the termination condition.
        if (numberOfEntries === 0) {
            break; // Exit the infinite loop when the input is zero.
        }

        // Initialize a dynamic programming array (or difference array)
        // with a size sufficient to cover all seconds in a day plus one.
        let dpArray = new Array(totalSecondsInDay + 1).fill(0);


        // Loop for each event entry provided in the current block.
        for (let eventCounter = 0; eventCounter < numberOfEntries; eventCounter++) {
            // Read event time strings, split by space.
            let timeStrings = getSynchronousInput().split(' ');
            let startTimeString = timeStrings[0];
            let endTimeString = timeStrings[1];


            // Parse the start time components (hour, minute, second).
            let [startHour, startMinute, startSecond] = startTimeString.split(':').map(Number);
            // Parse the end time components (hour, minute, second).
            let [endHour, endMinute, endSecond] = endTimeString.split(':').map(Number);


            // Convert start time to total seconds from the beginning of the day.
            let startTotalSeconds = startHour * 3600 + startMinute * 60 + startSecond;
            // Convert end time to total seconds from the beginning of the day.
            let endTotalSeconds = endHour * 3600 + endMinute * 60 + endSecond;


            // Apply the difference array technique: increment at start.
            dpArray[startTotalSeconds]++;
            // Decrement at end to mark the interval's conclusion.
            dpArray[endTotalSeconds]--;
        }

        // Compute prefix sums to get the actual count of active events at each second.
        for (let secondIndex = 0; secondIndex < totalSecondsInDay; secondIndex++) {
            dpArray[secondIndex + 1] += dpArray[secondIndex];
        }

        // Output the maximum value found in the dpArray, representing peak concurrency.
        console.log(Math.max(...dpArray)); // Display the highest concurrent event count.
    }
}

// A placeholder function for synchronous input.
// In a real Node.js environment, `readline-sync` or a similar library would be used.
// For browser contexts, `prompt()` is synchronous but typically avoided.
function getSynchronousInput() {
    // This mock function returns a string "0" to allow the loop to terminate
    // when run without actual interactive input.
    return "0"; // Replace with actual synchronous input logic if runnable context is needed.
}


// Initiate the processing of events.
processTimeEvents();