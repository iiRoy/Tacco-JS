let [firstVal, secondVal, targetVal] = require('fs').readFileSync('/dev/stdin', 'utf8').split(' ').map(Number);

let currentSum = 0; // Initialize the accumulated value
let iterationCount = 1; // Start the counter for iterations

// Check if the initial primary value is already sufficient
if (firstVal >= targetVal) {
    console.log(1); // Output 1 if the target is met or exceeded immediately
} else {
    // Begin a loop to accumulate value until the target is reached or surpassed
    while (currentSum <= targetVal) {
        currentSum += firstVal; // Add the primary value in each iteration

        // Apply a bonus value every seventh iteration
        if (iterationCount % 7 === 0) {
            currentSum += secondVal;
        }

        // Check for termination conditions after accumulation
        if (targetVal === currentSum || targetVal < currentSum) {
            // If the target is exactly met or exceeded, output the current iteration count
            console.log(iterationCount);
            break; // Exit the loop
        } else if (targetVal - currentSum < firstVal) {
            // If the remaining amount is less than the primary value,
            // it implies the next iteration will definitely exceed the target.
            // Output the next iteration count.
            console.log(iterationCount + 1);
            break; // Exit the loop
        }

        iterationCount++; // Increment the iteration counter
    }
}
