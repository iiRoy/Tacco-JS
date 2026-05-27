var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
// Parse the input string into three numbers
var [valA, valB, valC] = rawData.trim().split(" ").map(Number);

// Initialize counters and a running total
var counter1 = 0;
var counter2 = 0;
var totalValue = 0;

// Loop indefinitely until a condition is met
while (true) {
    // Check if the target value has been reached or exceeded
    if (valC <= totalValue) {
        break; // Exit the loop
    }

    // Increment both counters
    counter1++;
    counter2++;

    // Add the first value to the running total
    totalValue += valA;

    // Check if the second counter has reached a specific threshold
    if (counter2 === 7) {
        // If so, add the second value to the total and reset the second counter
        totalValue += valB;
        counter2 = 0;
    }
}

// Output the final value of the first counter
console.log(counter1);
