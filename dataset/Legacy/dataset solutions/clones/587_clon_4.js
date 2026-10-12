let minimumLengthFound = Infinity;

function processSequence(inputString) {
    let currentSequence = inputString;
    let reductionOccurred = true;
    const reducibleDigits = new Set(['1', '2', '3']);

    while (reductionOccurred) {
        reductionOccurred = false;
        let processedStack = []; // Stores [character, count] pairs
        let nextSequenceBuilder = [];

        for (let k = 0; k < currentSequence.length; k++) {
            let currentCharacter = currentSequence[k];

            if (processedStack.length > 0 && processedStack[processedStack.length - 1][0] === currentCharacter && reducibleDigits.has(currentCharacter)) {
                processedStack[processedStack.length - 1][1]++;
            } else {
                processedStack.push([currentCharacter, 1]);
            }

            if (reducibleDigits.has(currentCharacter) && processedStack[processedStack.length - 1][1] >= 4) {
                processedStack.pop();
                reductionOccurred = true;
            }
        }

        if (reductionOccurred) {
            nextSequenceBuilder = processedStack.map(pair => pair[0].repeat(pair[1]));
            currentSequence = nextSequenceBuilder.join('');
        }
    }
    return currentSequence.length;
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split("\n");

let currentLineIndex = 0;

while (true) {
    const elementCount = parseInt(inputLines[currentLineIndex++], 10);
    if (elementCount === 0) {
        break;
    }

    const currentElements = [];
    for (let k = 0; k < elementCount; k++) {
        currentElements.push(parseInt(inputLines[currentLineIndex++], 10));
    }

    minimumLengthFound = Infinity;

    const baseSequenceString = currentElements.join("");

    Array.from({ length: elementCount }).forEach((_, insertionPoint) => {
        // Scenario 1: Insert element from (insertionPoint + 1) at insertionPoint
        // Original: str.slice(0,i)+arr[i+1]+str.slice(i+1,str.length)
        const valueToInsert1 = currentElements[insertionPoint + 1];
        const constructedSequence1 = baseSequenceString.substring(0, insertionPoint) + String(valueToInsert1) + baseSequenceString.substring(insertionPoint + 1);
        
        const finalLength1 = processSequence(constructedSequence1);
        if (finalLength1 < minimumLengthFound) {
            minimumLengthFound = finalLength1;
        }

        // Scenario 2: Insert element from (insertionPoint - 1) at insertionPoint
        // Original: str.slice(0,i)+arr[i-1]+str.slice(i+1,str.length)
        if (insertionPoint > 0) {
            const valueToInsert2 = currentElements[insertionPoint - 1];
            const constructedSequence2 = baseSequenceString.substring(0, insertionPoint) + String(valueToInsert2) + baseSequenceString.substring(insertionPoint + 1);
            
            const finalLength2 = processSequence(constructedSequence2);
            if (finalLength2 < minimumLengthFound) {
                minimumLengthFound = finalLength2;
            }
        }
    });

    console.log(minimumLengthFound);
}
