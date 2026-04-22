function ProcessInput
    (
        rawData
    )
{
    // This line parses the input string into an array of numeric values.
    let numSequence = rawData
        .trim()
        .split(
            /\s|\n/
        )
        .map(
            Number
        )
    ;

    // Loop continuously until a specific termination condition is met.
    while ( true )
    {
        // Extract the first number from the sequence, representing the count for the current set.
        let currentCount = numSequence.shift();

        // If the count is zero, it signifies the end of input, so terminate the processing loop.
        if ( currentCount === 0 ) {
            break;
        }

        // Initialize an array to store the data points for the current set.
        let dataPoints = new Array( currentCount );

        // Initialize a variable to accumulate the sum of data points.
        let totalSum = 0.0;

        // Initialize a variable to accumulate the sum of squared differences from the mean.
        let squaredDiffSum = 0.0;

        // Iterate through the input sequence to populate the data points array and calculate their sum.
        for ( let idx = 0 ; idx < currentCount ; idx ++ )
        {
            // Assign the next number from the sequence to the current data point.
            dataPoints[ idx ] = numSequence.shift();

            // Add the current data point's value to the running total.
            totalSum += dataPoints[ idx ];
        }

        // Calculate the arithmetic mean (average) of the data points.
        totalSum /= currentCount;

        // Iterate again to calculate the sum of squared differences from the mean.
        for ( let idx = 0 ; idx < currentCount ; idx ++ )
        {
            // Add the square of the difference between each data point and the mean to the accumulator.
            squaredDiffSum += Math.pow(
                dataPoints[ idx ] - totalSum,
                2
            );
        }

        // Output the standard deviation, calculated as the square root of the variance.
        console.log(
            Math.sqrt(
                squaredDiffSum / currentCount
            )
        );
    }
}

// Invoke the main processing function with content read from standard input.
ProcessInput
    (
        require(
            "fs"
        )
        .readFileSync(
            "/dev/stdin",
            "utf8"
        )
    );