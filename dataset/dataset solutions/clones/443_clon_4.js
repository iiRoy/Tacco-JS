function* enumeratePrimesUpTo(ceiling) {
    if (ceiling < 2) return;
    const compositeMarkers = new Uint8Array(ceiling + 1); // 0 = potentially prime, 1 = composite

    for (let currentNumber = 2; currentNumber <= ceiling; currentNumber++) {
        if (compositeMarkers[currentNumber] === 0) {
            yield currentNumber;
            for (let multiple = currentNumber * currentNumber; multiple <= ceiling; multiple += currentNumber) {
                compositeMarkers[multiple] = 1;
            }
        }
    }
}

const maximumPossibleValue = 1000000;
const primeCollection = new Set();
for (const pVal of enumeratePrimesUpTo(maximumPossibleValue)) {
    primeCollection.add(pVal);
}

const parseNumericalLine = (lineContent) =>
    lineContent.split(" ").map(Number);

const computeAttainableTotals = (elements, capTotal) => {
    const currentAttainable = new Set([0]);

    for (const currentElement of elements) {
        const newlyGeneratedSums = new Set();
        for (const existingTotal of currentAttainable) {
            const nextTotal = existingTotal + currentElement;
            if (nextTotal <= capTotal) {
                newlyGeneratedSums.add(nextTotal);
            }
        }
        for (const newTotal of newlyGeneratedSums) {
            currentAttainable.add(newTotal);
        }
    }
    return currentAttainable;
};

const rawDataString = '4 15000\n305\n260\n129\n500\n3 400\n10\n20\n30\n3 200909\n5\n9\n12\n0 0\n';

let remainingInputLines = rawDataString.trim().split("\n");

while (true) {
    const parameters = parseNumericalLine(remainingInputLines.shift());
    const countElements = parameters[0];
    const desiredSumThreshold = parameters[1];

    if (countElements === 0 && desiredSumThreshold === 0) {
        break;
    }

    const inputNumberList = [];
    for (let k = 0; k < countElements; k++) {
        inputNumberList.push(parseInt(remainingInputLines.shift(), 10));
    }

    const allPossibleSums = computeAttainableTotals(inputNumberList, maximumPossibleValue);

    let resultPrimeSum = "NA";

    const sortedSums = Array.from(allPossibleSums)
        .filter(s => s <= desiredSumThreshold)
        .sort((a, b) => b - a);

    for (const potentialSum of sortedSums) {
        if (primeCollection.has(potentialSum)) {
            resultPrimeSum = potentialSum;
            break;
        }
    }
    console.log(resultPrimeSum);
}