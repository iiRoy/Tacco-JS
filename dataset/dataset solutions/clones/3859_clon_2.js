// This JavaScript module processes numerical input to find a sequence of specific numbers.
console.log((
    // An immediately invoked function expression (IIFE) handles the core logic.
    // It accepts a string argument, which represents the initial input value.
    inputStringData =>
    {
        // Convert the incoming string data into an integer.
        // This integer determines how many special numbers to collect.
        const targetValueCount = inputStringData | 0;

        // Establish an upper boundary for the number search.
        // A large array is initialized with 'true' to signify potential primality.
        const primeIndicatorFlags = Array(55555).fill(true);

        // This dynamic array will accumulate numbers that meet the specified criteria.
        const gatheredNumericSequence = [];

        // Begin an iteration from the first prime number (2) up to the defined limit.
        // This loop is the primary mechanism for a modified sieve process.
        for (
            let currentIterationNumber = 2;
            currentIterationNumber < 55555;
            currentIterationNumber++
        )
        {
            // If the current number has already been marked as composite (not prime),
            // bypass further processing for this number and proceed to the next.
            if ( !primeIndicatorFlags[currentIterationNumber] )
            {
                continue;
            }

            // For numbers identified as prime, iterate through their multiples.
            // Mark these multiples as composite (false) in the indicator array.
            for (
                let currentMultipleIndex = currentIterationNumber + currentIterationNumber;
                currentMultipleIndex < 55555;
                currentMultipleIndex += currentIterationNumber
            )
            {
                primeIndicatorFlags[currentMultipleIndex] = false;
            }

            // After sieve processing, apply an additional conditional check.
            // Only numbers that yield a remainder of 1 when divided by 5 are considered.
            if ( currentIterationNumber % 5 === 1 )
            {
                // If the condition is met, add this qualifying number to our collection.
                gatheredNumericSequence.push(currentIterationNumber);

                // Verify if the required quantity of numbers has been collected.
                if ( gatheredNumericSequence.length === targetValueCount )
                {
                    // If the target count is reached, terminate the main search loop.
                    break;
                }
            }
        }

        // Concatenate all collected numbers into a single string,
        // with each number separated by a single space character.
        return gatheredNumericSequence.join` `;
    }
)(
    // Obtain the initial input data by reading the content of standard input.
    require('fs').readFileSync('/dev/stdin', 'utf8')
));