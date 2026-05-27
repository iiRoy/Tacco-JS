var fs = require('fs');
var fileSize = fs.fstatSync(process.stdin.fd).size;
var dataBuffer = new Buffer(fileSize);
var readBytesCount = fs.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);
var inputLines = dataBuffer.toString('utf8', 0, readBytesCount).split('\n');

runSimulation();

function runSimulation() {
    // Array representing the occupancy status of 17 chairs.
    // A value of 0 means the chair is empty. A positive value indicates
    // the remaining time (in minutes) until the chair becomes empty.
    var chairOccupancy = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // Sizes of different party groups that will arrive.
    var partySizes = [2, 5, 2, 2, 2];
    // Durations (in minutes) for which each party type will occupy a seat.
    var mealDurations = [19, 39, 25, 36, 22, 42];

    // Index of the party currently waiting to be seated.
    // -1 indicates no party is currently waiting.
    var currentPartyIndex = -1;
    // Total minutes elapsed since the simulation began.
    var elapsedTime = 0;
    // Array to store the wait time for each party, indexed by party number.
    // Initialized for up to 100 parties.
    var partyWaitTimes = new Array(100).fill(0);
    // Counter for the number of parties remaining to be seated.
    var remainingParties = 100;

    // Main simulation loop, continues until all parties are seated.
    while (true) {
        // --- Step 1: Update chair occupancy (parties finishing their meals) ---
        var seatIdx;
        for (seatIdx = 17; seatIdx--;) { // Iterate through all 17 chairs
            // Decrement the occupancy timer for each chair.
            // Ensure the value does not go below zero (chair becomes empty).
            chairOccupancy[seatIdx] = getMaximum(--chairOccupancy[seatIdx], 0);
        }

        // --- Step 2: Check for new party arrival ---
        // If no party is currently waiting and 5 minutes have passed since the last check.
        if (currentPartyIndex === -1 && elapsedTime % 5 === 0) {
            // A new party arrives; its index is determined by the elapsed time.
            currentPartyIndex = elapsedTime / 5;
        }

        // --- Step 3: Attempt to seat the waiting party ---
        // This loop continues as long as there's a party waiting to be seated
        // and the seat index is not 17 (meaning we haven't exhausted all seating checks
        // without finding a spot in the previous iteration of the inner loop).
        while (currentPartyIndex !== -1 && seatIdx !== 17) {
            // Determine the number of consecutive chairs required for the current party.
            var requiredChairs = partySizes[currentPartyIndex % 5];
            var consecutiveEmptyChairs = 0; // Counter for available sequential empty chairs.
            var startChairIndex = -1; // Starting index of the found block of chairs.

            // Iterate through all chairs to find a suitable block for the party.
            for (seatIdx = 0; seatIdx < chairOccupancy.length; seatIdx++) {
                // If the current chair is empty, increment the consecutive counter.
                // Otherwise, reset the counter as the sequence is broken.
                consecutiveEmptyChairs = chairOccupancy[seatIdx] === 0 ? consecutiveEmptyChairs + 1 : 0;

                // If enough sequential empty chairs are found for the party.
                if (consecutiveEmptyChairs === requiredChairs) {
                    // Calculate the actual starting index of this block of chairs.
                    startChairIndex = seatIdx - (requiredChairs - 1);

                    // Record the wait time for this party.
                    partyWaitTimes[currentPartyIndex] = elapsedTime - (currentPartyIndex * 5);

                    // Occupy the found seats for the party's meal duration.
                    for (var chairIterator = startChairIndex; chairIterator < (requiredChairs + startChairIndex); chairIterator++) {
                        chairOccupancy[chairIterator] = mealDurations[currentPartyIndex % 6];
                    }

                    // Update the current party index:
                    // If the next party's arrival time has already passed, move to the next party.
                    // Otherwise, set to -1, indicating no party is currently waiting to be seated.
                    currentPartyIndex = (((currentPartyIndex + 1) * 5) <= elapsedTime) ? currentPartyIndex + 1 : -1;

                    // Decrement the count of remaining parties.
                    // If all 100 parties have been seated, the simulation ends.
                    if (!(--remainingParties)) {
                        return; // Exit the runSimulation function.
                    }
                    break; // Break from the inner 'for' loop (seats iteration) as the party is seated.
                }
            }
        }

        // Increment the total elapsed time for the next minute.
        elapsedTime++;
    }

    // --- Step 4: Output results based on input queries ---
    // Iterate through the input lines (excluding the last one, which might be empty).
    for (var queryIdx = 0; queryIdx < (inputLines.length - 1); queryIdx++) {
        // Parse the input line as an integer (party number) and print its recorded wait time.
        console.log(partyWaitTimes[parseInt(inputLines[queryIdx], 10)]);
    }
}

// Custom function to find the maximum of two numbers using bitwise operations.
// This avoids conditional branching, which can sometimes be slightly faster.
function getMaximum(valA, valB) {
    var diffVal = (valA - valB);
    // If valA >= valB, diffVal is non-negative, (diffVal >> 31) is 0. Result: valA - 0 = valA.
    // If valA < valB, diffVal is negative, (diffVal >> 31) is -1 (for 32-bit signed int).
    // The expression `diffVal & (diffVal >> 31)` effectively becomes `diffVal` if diffVal is negative,
    // and `0` if diffVal is non-negative.
    // So, if valA < valB, it's `valA - diffVal` which is `valA - (valA - valB) = valB`.
    // If valA >= valB, it's `valA - 0 = valA`.
    return valA - (diffVal & (diffVal >> 31));
}
