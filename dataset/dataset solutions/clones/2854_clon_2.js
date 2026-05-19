function ProcessInput(rawData) {
    // Divide the incoming string into individual components using space as a delimiter.
    let parsedValues = rawData.split(" ");

    // Convert the string representations of numbers into actual integer values.
    const firstNum = parseInt(parsedValues[0], 10);
    const secondNum = parseInt(parsedValues[1], 10);
    const thirdNum = parseInt(parsedValues[2], 10);

    // Compute three distinct sums based on the input numbers.
    let sumOne = firstNum + secondNum;
    let sumTwo = secondNum + thirdNum;
    let sumThree = thirdNum + firstNum;

    // Evaluate which of the three sums is the smallest and output it.
    if (sumOne >= sumTwo) {
        if (sumTwo >= sumThree) {
            console.log(sumThree); // If sumOne >= sumTwo and sumTwo >= sumThree, then sumThree is the minimum.
        } else {
            console.log(sumTwo);   // If sumOne >= sumTwo but sumTwo < sumThree, then sumTwo is the minimum.
        }
    } else if (sumOne >= sumThree) {
        console.log(sumThree);     // If sumOne < sumTwo but sumOne >= sumThree, then sumThree is the minimum.
    } else {
        console.log(sumOne);       // If sumOne < sumTwo and sumOne < sumThree, then sumOne is the minimum.
    }
}

// This section is responsible for reading input from the standard input stream
// and passing it to the primary processing function. It must remain unchanged.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
