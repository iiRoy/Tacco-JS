const externalSource = require("fs").readFileSync("/dev/stdin", "utf8");

function processData(sourceContentString) {
    const rawNumericalTokens = sourceContentString.split(/\s+/).filter(Boolean);
    let tokenCursor = 0;
    const retrieveNextNumber = () => Number(rawNumericalTokens[tokenCursor++]);

    const elementCountDirective = retrieveNextNumber();
    const collectionOfNumbers = [];
    for (let currentNumberIndex = 0; currentNumberIndex < elementCountDirective; currentNumberIndex++) {
        collectionOfNumbers.push(retrieveNextNumber());
    }

    const valueCounts = new Map();
    for (const itemValue of collectionOfNumbers) {
        valueCounts.set(itemValue, (valueCounts.get(itemValue) || 0) + 1);
    }

    const maximumElementValue = Math.max(...collectionOfNumbers);

    const uniquePresentElements = new Set(collectionOfNumbers);

    const numbersToExclude = new Set();
    for (let currentSieveBase = 1; currentSieveBase <= maximumElementValue; currentSieveBase++) {
        if (uniquePresentElements.has(currentSieveBase)) {
            for (let multipleCandidate = currentSieveBase * 2; multipleCandidate <= maximumElementValue; multipleCandidate += currentSieveBase) {
                numbersToExclude.add(multipleCandidate);
            }
        }
    }

    let finalSelectionTally = 0;
    for (const originalItem of collectionOfNumbers) {
        const itemFrequency = valueCounts.get(originalItem);
        if (itemFrequency === 1) {
            if (!numbersToExclude.has(originalItem)) {
                finalSelectionTally++;
            }
        }
    }

    console.log(finalSelectionTally);
}

processData(externalSource);