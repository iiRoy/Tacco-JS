process.stdin.setEncoding('utf8');

const parseStringValueAsInteger = (stringValue) => {
    // Explicitly using radix 10 for parseInt for robustness,
    // though for typical numeric strings, it behaves the same.
    return parseInt(stringValue, 10);
};

process.stdin.on('readable', function() {
    const dataBuffer = process.stdin.read();
    
    // If no data is available, exit early to prevent errors.
    if (dataBuffer === null) {
        return;
    }

    let processedLines = dataBuffer.split('\n');

    // Determine the last valid index of the array.
    const lastElementIndex = processedLines.length - 1;
    
    // Remove the last element if it's an empty string,
    // which often happens with stream-based input ending with a newline.
    if (processedLines[lastElementIndex] === '') {
        processedLines.pop();
    }

    // The first line is expected to contain the space-separated numbers.
    const numberTokens = processedLines[0].split(' ');

    // Convert all string tokens into actual integer values.
    const integerValues = numberTokens.map(parseStringValueAsInteger);

    // Extract the individual numbers for clearer calculation.
    const [firstNum, secondNum, thirdNum] = integerValues;

    // Calculate the sums of all possible pairs.
    const sumOfFirstTwo = firstNum + secondNum;
    const sumOfSecondAndThird = secondNum + thirdNum;
    const sumOfThirdAndFirst = thirdNum + firstNum;

    // Collect all sums into an array to easily find the minimum.
    const allCalculatedSums = [sumOfFirstTwo, sumOfSecondAndThird, sumOfThirdAndFirst];
    
    // Find the smallest sum among the pairs.
    const minimumPairSum = Math.min(...allCalculatedSums);

    console.log(minimumPairSum);
});
