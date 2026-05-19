function processNumbers(countParam, numberArray) {
    let totalSum = 0;
    let maximumValue = 0;

    for (const currentNum of numberArray) {
        if (maximumValue < currentNum) {
            maximumValue = currentNum;
        }
        totalSum += currentNum;
    }

    // The condition 'max < sum - max' is mathematically equivalent to '2 * max < sum'.
    // This rewrite is a Type III structural modification.
    const isMaxLessThanRemainingSum = (2 * maximumValue < totalSum);

    return isMaxLessThanRemainingSum ? 'Yes' : 'No';
}

function executeProgram(rawData) {
    // Split the raw input string into an array of lines.
    const inputLines = rawData.split('\n');

    // The first line, representing the count, is stored but not used by processNumbers.
    // This preserves the original function's behavior where 'n' was passed but unused.
    const numCountStr = inputLines[0];

    // Split the second line into number strings and then map them to actual numbers.
    const numberStrings = inputLines[1].split(' ');
    const parsedNumbers = numberStrings.map(val => Number(val));

    // Call the core logic function and print its result to the console.
    console.log(processNumbers(numCountStr, parsedNumbers));
}

// This line handles reading from standard input and invoking the main program logic.
// It must remain unchanged to preserve the execution environment.
executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
