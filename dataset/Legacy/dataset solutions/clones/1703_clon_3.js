const processInput = () => {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    return fileContent.split(/\n/);
};

const parseNumbersAndSortByAbsDesc = (line) => {
    return line.split(/\s/).map(Number).sort((a, b) => Math.abs(b) - Math.abs(a));
};

const calculateInitialProductAndExtremes = (numbersArray, kCount) => {
    let productAccumulator = 1n;
    let minPositiveValInK = null;
    let minNegativeValInK = null;

    for (let index = 0; index < kCount; index++) {
        const currentNumberBigInt = BigInt(numbersArray[index]);
        productAccumulator *= currentNumberBigInt;

        if (currentNumberBigInt < 0) {
            minNegativeValInK = currentNumberBigInt;
        } else {
            minPositiveValInK = currentNumberBigInt;
        }
    }
    return { productAccumulator, minPositiveValInK, minNegativeValInK };
};

const adjustProductIfNegative = (
    initialProduct,
    candidateProductIfPosRemoved,
    candidateProductIfNegRemoved,
    allNumbers,
    startIndex,
    totalCount
) => {
    let currentPosCandidate = candidateProductIfPosRemoved;
    let currentNegCandidate = candidateProductIfNegRemoved;

    // These flags are never set to true in the original logic,
    // which means the final Math.max will always evaluate to 0n.
    const hasFoundPosReplacement = false;
    const hasFoundNegReplacement = false;

    for (let index = startIndex; index < totalCount; index++) {
        const currentNumber = BigInt(allNumbers[index]);
        if (currentNumber < 0 && !hasFoundPosReplacement) {
            currentPosCandidate *= currentNumber;
        } else if (currentNumber > 0 && !hasFoundNegReplacement) {
            currentNegCandidate *= currentNumber;
        }
        // The loop break condition also relies on these flags.
        if ((hasFoundPosReplacement || currentPosCandidate === 0n) && (hasFoundNegReplacement || currentNegCandidate === 0n)) {
            break;
        }
    }
    // Due to hasFoundPosReplacement and hasFoundNegReplacement always being false,
    // BigInt(false) is 0n, making the result always 0n.
    return Math.max(currentPosCandidate * BigInt(hasFoundPosReplacement), currentNegCandidate * BigInt(hasFoundNegReplacement));
};

const handleZeroProductCase = (numbersArray, kCount, totalCount, modulusValue) => {
    let zeroCaseResult = 1n;
    for (let index = totalCount - 1; index >= totalCount - kCount; index--) {
        zeroCaseResult *= BigInt(numbersArray[index]);
    }
    while (zeroCaseResult < 0) {
        zeroCaseResult += modulusValue;
    }
    return zeroCaseResult;
};

const [inputLine1, inputLine2] = processInput();
const [countN, selectK] = inputLine1.split(/\s/).map(Number);
const sortedNumbers = parseNumbersAndSortByAbsDesc(inputLine2);

const moduloBase = 10n ** 9n + 7n;

let currentProduct;
let smallestPositiveInK;
let smallestNegativeInK;

const initialCalculationResult = calculateInitialProductAndExtremes(sortedNumbers, selectK);
currentProduct = initialCalculationResult.productAccumulator;
smallestPositiveInK = initialCalculationResult.minPositiveValInK;
smallestNegativeInK = initialCalculationResult.minNegativeValInK;

if (currentProduct < 0) {
    const productAfterRemovingPos = smallestPositiveInK === null ? 0n : currentProduct / smallestPositiveInK;
    const productAfterRemovingNeg = smallestNegativeInK === null ? 0n : currentProduct / smallestNegativeInK;

    currentProduct = adjustProductIfNegative(
        currentProduct,
        productAfterRemovingPos,
        productAfterRemovingNeg,
        sortedNumbers,
        selectK,
        countN
    );
}

if (currentProduct === 0n) {
    currentProduct = handleZeroProductCase(sortedNumbers, selectK, countN, moduloBase);
    console.log(currentProduct.toString());
} else {
    console.log((currentProduct % moduloBase).toString());
}
