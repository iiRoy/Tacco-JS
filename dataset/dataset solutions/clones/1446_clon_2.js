function ProcessInput (rawData) {
    // Initialize an array by processing the raw input string.
    // It trims whitespace, splits by space or newline, and converts each part to a number.
    var numericValues = rawData.trim().split(/\s|\n/).map(Number);

    // Begin an indefinite processing loop.
    while (1) {
        // Extract the first number from the array, which represents the count of elements for the current set.
        let countOfElements = numericValues.shift();

        // If the count is zero, it signifies the end of input, so break the loop.
        if (countOfElements === 0) {
            break;
        }

        // Declare an array to hold the data points for the current set.
        let dataPoints = new Array(countOfElements);
        // Initialize a variable to accumulate the sum of data points.
        let totalSum = 0;
        // Initialize a variable to accumulate the sum of squared differences from the mean.
        let varianceSum = 0;

        // Loop through to populate the dataPoints array and calculate the initial sum.
        for (let idx = 0; idx < countOfElements; idx++) {
            // Assign the next number from the input array to the current data point.
            dataPoints[idx] = numericValues.shift();
            // Add the current data point to the running total.
            totalSum += dataPoints[idx];
        }

        // Calculate the mean (average) of the data points.
        totalSum /= countOfElements;

        // Loop again to calculate the sum of squared differences from the mean.
        for (let idx = 0; idx < countOfElements; idx++) {
            // Add the square of the difference between the current data point and the mean to varianceSum.
            varianceSum += Math.pow(dataPoints[idx] - totalSum, 2);
        }

        // Calculate the standard deviation and print it to the console.
        // The standard deviation is the square root of the average of the squared differences.
        console.log(Math.sqrt(varianceSum / countOfElements));
    }
}

// Read the input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
