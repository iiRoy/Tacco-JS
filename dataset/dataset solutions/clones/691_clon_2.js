let cubedValues = []; // Array to store cubes of numbers
// Pre-calculate cubes for efficiency up to a certain limit
for (let index = 0; index <= 1111; index++) {
    cubedValues[index] = Math.pow(index, 3);
}

// Read all input from standard input as a string
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input string into an array of lines, removing any leading/trailing whitespace
let inputLinesArray = rawInputData.trim().split("\n");

// Process each line of input until a zero is encountered
while (true) {
    // Get the next number from the input array and convert it to a numeric type
    let targetNumber = inputLinesArray.shift() - 0;

    // If the target number is zero, terminate the processing loop
    if (targetNumber === 0) {
        break;
    }

    // Initialize the minimum difference found so far to a very large value
    let minimumDifference = Infinity;

    // Iterate downwards from (targetNumber - 1) for the first cube
    for (let firstCubeIndex = targetNumber - 1; firstCubeIndex > 0; firstCubeIndex--) {
        // Iterate downwards from firstCubeIndex for the second cube
        for (let secondCubeIndex = firstCubeIndex; secondCubeIndex > 0; secondCubeIndex--) {
            // Calculate the difference: (cube of targetNumber) - (cube of firstCubeIndex) - (cube of secondCubeIndex)
            let currentCalculatedDifference = cubedValues[targetNumber] - cubedValues[firstCubeIndex] - cubedValues[secondCubeIndex];

            // If the difference is positive and smaller than the current minimum, update the minimum
            if (currentCalculatedDifference > 0 && minimumDifference > currentCalculatedDifference) {
                minimumDifference = currentCalculatedDifference;
            }
        }
    }
    // Output the smallest positive difference found for the current target number
    console.log(minimumDifference);
}
