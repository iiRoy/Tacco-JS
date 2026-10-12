// This function processes the provided text data.
function ProcessInput(rawData) {
    // Split the entire input into individual lines.
    let processedData = rawData.split("\n");

    // Extract the first line and split it by spaces.
    let parts = processedData[0].split(" ");

    // Convert string parts to integer values using base 10.
    const firstNum = parseInt(parts[0], 10);
    const secondNum = parseInt(parts[1], 10);
    const thirdNum = parseInt(parts[2], 10);

    // Determine the largest of the three numbers.
    let greatestValue = Math.max(firstNum, secondNum, thirdNum);

    // Check which number is the maximum and perform the calculation.
    if (firstNum === greatestValue) {
        console.log('%d', ((firstNum * 10) + secondNum + thirdNum));
        return; // Exit after printing the result.
    }

    if (secondNum === greatestValue) {
        console.log('%d', ((secondNum * 10) + firstNum + thirdNum));
        return; // Exit after printing the result.
    }

    if (thirdNum === greatestValue) {
        console.log('%d', ((thirdNum * 10) + firstNum + secondNum));
        return; // Exit after printing the result.
    }
}

// The following line handles reading from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
