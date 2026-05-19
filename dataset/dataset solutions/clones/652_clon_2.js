let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
let [initialValue, bonusValue, targetValue] = rawData.trim().split(" ").map(Number); // Parse input values
let [dayCounter, currentTotal] = [1, initialValue]; // Initialize day count and accumulated total

// Loop indefinitely until the target is reached
while (true) {
    // Check if the current total has met or exceeded the target
    if (targetValue <= currentTotal) {
        console.log(dayCounter); // Output the number of days
        break; // Exit the loop
    }

    // Increment the day counter for the next iteration
    ++dayCounter;

    // Add the base value for the current day
    currentTotal += initialValue;

    // If it's a multiple of 7, add the bonus value
    if (dayCounter % 7 === 0) {
        currentTotal += bonusValue;
    }
}
