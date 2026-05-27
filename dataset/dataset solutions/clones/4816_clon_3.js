const printToConsole = (message) => {
    console.log(message);
};

const parseNumericStringToArray = (numberString) => {
    return numberString.split(" ").map(Number);
};

const countElementFrequencies = (sourceArray) => {
    const frequencyMap = {};
    for (const itemValue of sourceArray) {
        if (frequencyMap[itemValue] === undefined) {
            frequencyMap[itemValue] = 1;
        } else if (frequencyMap[itemValue] === 1) {
            frequencyMap[itemValue]++;
        }
    }
    return frequencyMap;
};

const getUniqueSortedElements = (sourceArray) => {
    const temporaryArray = [...sourceArray];
    temporaryArray.sort();
    const uniqueElements = temporaryArray.filter((element, index, selfReference) => {
        return selfReference.indexOf(element) === index;
    });
    return uniqueElements;
};

function processInputData(rawInputContent) {
    const cleanedInput = rawInputContent.trim();
    const inputLinesArray = cleanedInput.split("\n");

    const totalInputLength = parseInt(inputLinesArray[0], 10);
    const initialNumericValues = parseNumericStringToArray(inputLinesArray[1]);

    const elementFrequencyMap = countElementFrequencies(initialNumericValues);

    const distinctSortedValues = getUniqueSortedElements(initialNumericValues);

    let finalCalculatedResult = 1;
    const isTotalLengthOdd = (totalInputLength % 2 !== 0);

    for (let currentIndex = 0; currentIndex < distinctSortedValues.length; currentIndex++) {
        const currentUniqueValue = distinctSortedValues[currentIndex];
        const currentObservedFrequency = elementFrequencyMap[currentUniqueValue];

        if (isTotalLengthOdd && currentUniqueValue === 0) {
            if (currentObservedFrequency !== 1) {
                printToConsole("0");
                return;
            }
            continue;
        }

        if (currentObservedFrequency !== 2) {
            printToConsole("0");
            return;
        }
    }

    let effectiveUniqueValues = [...distinctSortedValues];
    if (isTotalLengthOdd) {
        effectiveUniqueValues.shift();
    }

    finalCalculatedResult = Math.pow(2, effectiveUniqueValues.length);

    printToConsole(finalCalculatedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
