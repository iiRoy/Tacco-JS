'use strict';

function ExecuteCalculation(rawText)
{
    // The objective is to calculate the total positive increments
    // across a sequence of numeric values.
    // If a value is less than its predecessor, it doesn't contribute
    // positively to the running total; instead, it establishes a new lower baseline.

    const dataRows = rawText.split
    (
        '\n'
    );

    const totalElements = parseInt(dataRows[0], 10);
    const elementMeasurements = dataRows[1]
        .split(' ')
        .map(
            (val) => { return Number(val); }
        );

    let lastMeasurement = 0;
    let accumulatedDifference = 0; // This variable stores the final aggregate.

    // Iterate through each individual measurement within the collection.
    elementMeasurements.forEach(
        currentMeasurement =>
        {
            if (currentMeasurement < lastMeasurement)
            {
                // Should the present measurement be less than the prior one,
                // we simply update the 'last measurement' to this new, lower value
                // and skip any summation for this particular step.
                lastMeasurement = currentMeasurement;
                return;
            }

            // If the current measurement is equal to or greater than the previous,
            // we compute the positive difference and add it to our growing sum.
            accumulatedDifference += (currentMeasurement - lastMeasurement);
            lastMeasurement = currentMeasurement;
        }
    );

    console.log(accumulatedDifference);
}

// Invoke the primary processing function with input read from standard input.
ExecuteCalculation
(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
);

// Example test case for local development:
// ExecuteCalculation(`7
// 1 5 2 6 3 7 4`);