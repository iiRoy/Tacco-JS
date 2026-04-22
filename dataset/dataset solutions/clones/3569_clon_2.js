/*
 * This routine computes a specific numerical aggregation based on provided string data.
 */
function SolveProblem(rawData)
{
    // Separate the incoming string by its delimiter to get individual components.
    let parsedNumbers = rawData.split(' ');

    // Convert the string components into integer values for processing.
    let limitValue = parseInt(parsedNumbers[0]);
    let divisorVal = parseInt(parsedNumbers[1]);

    // Initialize a counter to accumulate the final result.
    let totalCount = 0;

    // Begin the primary iteration loop for the first operand.
    for (let firstNum = 1; firstNum <= limitValue; firstNum++)
    {
        // Determine an initial value for the second operand using the modulo operator.
        let secondNum = firstNum % divisorVal;

        // If the modulo result is zero, reassign it to the divisor value.
        if (secondNum == 0)
            secondNum = divisorVal;

        // Enter a nested loop for the second operand, continuing as long as it's within bounds.
        while (secondNum <= limitValue)
        {
            // Calculate an initial value for the third operand, again using modulo.
            let thirdNum = firstNum % divisorVal;

            // Apply the same zero-check and reassignment for the third operand.
            if (thirdNum === 0)
                thirdNum = divisorVal;

            // Commence the innermost loop for the third operand.
            while (thirdNum <= limitValue)
            {
                // Evaluate a compound condition based on the sums of pairs of operands,
                // checking if they are all perfectly divisible by the divisor value.
                if ((firstNum + secondNum) % divisorVal === 0 &&
                    (firstNum + thirdNum) % divisorVal === 0 &&
                    (thirdNum + secondNum) % divisorVal === 0)
                {
                    // If all conditions are met, increment the main result counter.
                    totalCount++;
                }
                // Advance the third operand by the divisor value for the next iteration.
                thirdNum += divisorVal;
            }
            // Advance the second operand by the divisor value for its next iteration.
            secondNum += divisorVal;
        }
    }

    // Display the final computed aggregation to the console.
    console.log(totalCount);
}

// The following line is essential for input handling and should not be altered.
SolveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));