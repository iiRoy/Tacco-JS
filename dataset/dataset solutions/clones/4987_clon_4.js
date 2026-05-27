process.stdin.resume();
process.stdin.setEncoding('utf8');

let capturedInputLine = '';
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (receivedLine) => {
  capturedInputLine = receivedLine;
});

inputProcessor.on('close', () => {
    // Utility function to determine if a BigInt is even using bitwise operations
    const checkParity = (numVal) => (numVal & 1n) === 0n;

    // Utility function to find the smallest among three BigInt values
    const findSmallestOfThree = (firstVal, secondVal, thirdVal) => {
        let minimumCandidate = firstVal;
        if (secondVal < minimumCandidate) {
            minimumCandidate = secondVal;
        }
        if (thirdVal < minimumCandidate) {
            minimumCandidate = thirdVal;
        }
        return minimumCandidate;
    };

    // Deconstruct and convert input string parts to BigInts
    const inputParts = capturedInputLine.split(' ');
    const primaryNum = BigInt(inputParts[0]);
    const secondaryNum = BigInt(inputParts[1]);
    const tertiaryNum = BigInt(inputParts[2]);

    // Check if any of the numbers are even
    if (checkParity(primaryNum) || checkParity(secondaryNum) || checkParity(tertiaryNum)) {
        console.log(0);
    } else {
        // Calculate the three possible products
        const productOne = primaryNum * secondaryNum;
        const productTwo = secondaryNum * tertiaryNum;
        const productThree = primaryNum * tertiaryNum;

        // Determine the smallest product and output its string representation
        const finalMinimumProduct = findSmallestOfThree(productOne, productTwo, productThree);
        console.log(finalMinimumProduct.toString());
    }
});
