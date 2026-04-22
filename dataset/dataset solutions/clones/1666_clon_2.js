const processNumericalData = function (       incomingPayload     ) {
    /*
     * This module processes incoming numerical data to determine divisibility counts.
     * It reads a single line of input containing three space-separated integers:
     * a lower bound, an upper bound, and a divisor.
     * The program then counts how many numbers within the inclusive range [lower bound, upper bound]
     * are perfectly divisible by the specified divisor.
     */

    // First, prepare the raw text payload.
    // Trim extraneous whitespace, split into lines, then split each line by spaces.
    let  processedRecords = incomingPayload
                                .trim()
                                .split(        "\n"        )
                                .map(      function(  singleLineContent  ) {
                                                                            return singleLineContent.split(  " "  )
                                                                        }
                                    );

    // Extract the numerical parameters from the first processed record.
    const startingValue = parseInt(    processedRecords[0][0],      10      );
    const endingValue   = parseInt(    processedRecords[0][1],      10      );
    const divisorFactor = parseInt(    processedRecords[0][2],      10      );

    // Initialize a counter for numbers meeting the divisibility criterion.
    let matchingElementCount = 0;

    // Iterate through all integers from the starting value up to and including the ending value.
    for ( let       currentIterationNumber = startingValue;      currentIterationNumber <= endingValue;      currentIterationNumber++    )
    {
        // Check if the current number is perfectly divisible by the divisor factor.
        // A remainder of zero indicates perfect divisibility.
        if (      currentIterationNumber % divisorFactor   ===   0       )
        {
            matchingElementCount++; // Increment the counter if divisible.
        }
    }

    // Output the final tally to the standard console.
    console.log(matchingElementCount);
};

// Execute the main processing function with data read from standard input.
// This simulates reading from a file named /dev/stdin in a Unix-like environment.
processNumericalData( require("fs") . readFileSync( "/dev/stdin", "utf8" ) );