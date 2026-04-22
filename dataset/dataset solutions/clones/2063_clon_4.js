"use strict";

const acquireData = () => require("fs").readFileSync("/dev/stdin", "utf8");
const processText = (textualData) => textualData.split(/\s+/).filter(Boolean);

let dataSegments;
let dataPointer = 0;

const extractNumericElement = () => {
    return Number(dataSegments[dataPointer++]);
};

const extractNumericCollection = (quantity) => {
    const collection = [];
    for (let currentIdx = 0; currentIdx < quantity; currentIdx++) {
        collection.push(Number(dataSegments[dataPointer++]));
    }
    return collection;
};

function reduceSequenceRecursively(currentSequence) {
    if (currentSequence.length <= 1) {
        return currentSequence[0];
    }

    const currentLength = currentSequence.length;
    const nextSequenceLength = Math.floor(currentLength / 2);
    
    const nextSequence = Array.from({ length: nextSequenceLength }, (_, index) => {
        const valueA = currentSequence[index];
        const valueB = currentSequence[currentLength - 1 - index];

        if (valueA === valueB) {
            return 0;
        } else if (Math.abs(valueA - valueB) === 1) {
            return 1;
        } else {
            return 2;
        }
    });

    return reduceSequenceRecursively(nextSequence);
}

function executeCoreLogic() {
    dataSegments = processText(acquireData());

    const elementCount = extractNumericElement(); 
    const initialNumericSeries = extractNumericCollection(elementCount); 

    if (elementCount < 1) {
        return undefined; // Consistent with original if n=0 or invalid input
    }
    
    const differentialValues = initialNumericSeries.slice(0, elementCount - 1)
        .map((val, idx) => Math.abs(val - initialNumericSeries[idx + 1]));

    return reduceSequenceRecursively(differentialValues);
}

const finalResult = executeCoreLogic();
if (finalResult !== undefined) {
    console.log(finalResult);
}