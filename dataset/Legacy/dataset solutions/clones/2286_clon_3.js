const calculateGcd = (firstNum, secondNum) => secondNum === 0 ? firstNum : calculateGcd(secondNum, firstNum % secondNum);

const calculateLcmPair = (numA, numB) => {
    // Ensure numbers are non-zero to avoid division by zero if GCD is 0,
    // though for positive integers, GCD is never 0 unless one number is 0.
    // The original code implicitly handles this for positive integers.
    if (numA === 0 || numB === 0) return 0; // LCM with 0 is 0
    return (numA * numB) / calculateGcd(numA, numB);
};

function computeLeastCommonMultiple(inputNumbers) {
    // The original code assumes inputNumbers is not empty.
    // If it were empty, inputNumbers[0] would cause an error.
    // We maintain this behavior.
    if (inputNumbers.length === 0) {
        // Depending on context, one might throw an error or return 0/1.
        // To strictly match original behavior, we let it error if original would.
        // For typical competitive programming, input is guaranteed valid.
        return undefined; // Or let it throw on inputNumbers[0]
    }

    let resultantLcm = inputNumbers[0];

    for (let index = 1; index < inputNumbers.length; index++) {
        const currentElement = inputNumbers[index];
        resultantLcm = calculateLcmPair(resultantLcm, currentElement);
    }
    return resultantLcm;
}

function processInput(rawData) {
    const firstLineContent = rawData[0];
    const firstLineParts = firstLineContent.split(" ");

    const countN = parseInt(firstLineParts[0], 10);
    const upperBound = parseInt(firstLineParts[1], 10);

    const secondLineContent = rawData[1];
    const numberSequence = secondLineContent.split(" ").map(valStr => parseInt(valStr, 10));

    const calculatedLcm = computeLeastCommonMultiple(numberSequence);

    const halfLcmValue = calculatedLcm / 2;

    const firstTruncatedTerm = Math.trunc(upperBound / halfLcmValue);
    const secondTruncatedTerm = Math.trunc(upperBound / calculatedLcm);

    const finalResult = firstTruncatedTerm - secondTruncatedTerm;

    console.log(finalResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
