const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim(); // Read input from standard input, trim leading/trailing whitespace
const dataRows = rawData.split('\n'); // Split the raw input string into an array of strings, one for each line

// Iterate through each line of the input data
for (let idx = 0; idx < dataRows.length; ++idx) {
    // Convert the current line string to a numeric value
    let currentVal = Number(dataRows[idx]);

    // Only proceed if the numeric value is not zero
    if (currentVal !== 0) {
        // Initialize the minimum sum found so far with the current input value
        let minimumSum = currentVal;

        // Calculate the maximum possible integer value for 'z' such that z^3 does not exceed currentVal
        let maxZVal = Math.floor(Math.cbrt(currentVal));

        // Loop for 'z' coordinate, starting from 0 up to maxZVal
        for (let zCoord = 0; zCoord <= maxZVal; zCoord++) {
            // Calculate the maximum possible integer value for 'y' such that y^2 does not exceed (currentVal - zCoord^3)
            let maxYVal = Math.floor(Math.sqrt(currentVal - zCoord * zCoord * zCoord));

            // Loop for 'y' coordinate, starting from 0 up to maxYVal
            for (let yCoord = 0; yCoord <= maxYVal; yCoord++) {
                // Calculate the 'x' coordinate based on currentVal, zCoord, and yCoord
                let xCoord = currentVal - zCoord * zCoord * zCoord - yCoord * yCoord;

                // Check if the sum of xCoord, yCoord, and zCoord is less than the current minimumSum
                if (xCoord + yCoord + zCoord < minimumSum) {
                    // If it is, update minimumSum to this new smaller sum
                    minimumSum = xCoord + yCoord + zCoord;
                }
            }
        }
        // After checking all possible combinations for the currentVal, print the smallest sum found
        console.log(minimumSum);
    }
}
