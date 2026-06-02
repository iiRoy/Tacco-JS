var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Reads input from the standard input stream.

// Parses the input string into three numerical variables.
var [valA, valB, valC] = rawData.trim().split(" ").map(Number);

// Calculates an initial duration based on valC and valA, rounding up.
var duration = Math.ceil(valC / valA);

// Initializes a variable to accumulate a total sum.
var totalAccumulator = 0;

// Enters a loop that continues as long as the duration exceeds a specific threshold.
while (duration > 6) {
    // Adds a fixed value to the accumulator in each iteration.
    totalAccumulator = totalAccumulator + 7;
    // Decrements valC by a calculated amount involving valB and valA.
    valC = valC - (valB + 7 * valA);
    // Recalculates the duration with the updated valC.
    duration = Math.ceil(valC / valA);
}

// Prints the final computed value to the console.
// This value is the accumulated sum plus the remaining duration, if positive, otherwise zero.
console.log(totalAccumulator + (duration > 0 ? duration : 0));
