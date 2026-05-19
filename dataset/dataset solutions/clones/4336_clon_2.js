function ProcessInput(rawData) {
    // Split the raw input by newline characters
    let parsedData = rawData.split('\n');

    // Remove the last element, which is often an empty string from a trailing newline
    parsedData.pop();

    // Take the first line of input and split it by spaces
    parsedData = parsedData[0].split(' ');

    // Extract numerical values from the parsed data
    const firstVal = parsedData[0];
    const secondVal = parsedData[1];
    const targetVal = parsedData[2];

    // Check for direct divisibility conditions
    if (targetVal % firstVal === 0 || targetVal % secondVal === 0) {
        console.log('Yes');
        return;
    }

    // Check if the target value is smaller than both primary values
    if (targetVal < secondVal && targetVal < firstVal) {
        console.log('No');
        return;
    }

    // First set of nested loops for a specific calculation pattern
    for (let outerIdx = 1; outerIdx <= secondVal; outerIdx++) {
        for (let innerIdx = 1; innerIdx <= firstVal; innerIdx++) {
            // Evaluate a complex expression and compare with the target value
            if (targetVal == (outerIdx * secondVal + innerIdx * (firstVal - 2 * outerIdx))) {
                console.log('Yes');
                return;
            }
        }
    }

    // Second set of nested loops, with swapped bounds for outer and inner indices
    for (let outerIdx = 1; outerIdx <= firstVal; outerIdx++) {
        for (let innerIdx = 1; innerIdx <= secondVal; innerIdx++) {
            // Evaluate another complex expression and compare with the target value
            if (targetVal == (outerIdx * firstVal + innerIdx * (secondVal - 2 * outerIdx))) {
                console.log('Yes');
                return;
            }
        }
    }

    // If no conditions are met after all checks, output 'No'
    console.log('No');
    return;
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
