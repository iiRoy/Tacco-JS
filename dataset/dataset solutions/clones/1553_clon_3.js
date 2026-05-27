function parseBigIntArray(inputStr, delimiterChar = ' ') {
    return inputStr.split(delimiterChar).map(segment => BigInt(segment));
}

function ProcessInput(inputString) {
    const [numElementsStr, elementsLine] = inputString.split("\n");

    const bigIntArray = parseBigIntArray(elementsLine);
    const MODULUS_VALUE = BigInt(10 ** 9 + 7);

    let totalSumOfElements = 0n;
    let sumOfSquaredElements = 0n;

    for (let k = 0; k < bigIntArray.length; k++) {
        const currentElement = bigIntArray[k];
        totalSumOfElements += currentElement;
        sumOfSquaredElements += currentElement * currentElement;
    }

    // The sum of a_i * a_j for i < j is mathematically equivalent to:
    // ( (sum of all a_i)^2 - (sum of all a_i^2) ) / 2
    // All calculations must use BigInt to prevent overflow.
    const sumOfProducts = (totalSumOfElements * totalSumOfElements - sumOfSquaredElements) / 2n;

    const finalResult = sumOfProducts % MODULUS_VALUE;

    console.log(finalResult.toString());
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
