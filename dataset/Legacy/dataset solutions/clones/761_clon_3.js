const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputData.trim().split("\n");

while (true) {
    const currentLineFromInput = processedLines.shift();
    const numberOfElementsInSet = Number(currentLineFromInput);

    if (numberOfElementsInSet === 0) {
        break;
    }

    const elementsForProcessing = processedLines.shift().split(" ");
    let winnerDeclared = false;
    const elementFrequencyMap = {};

    const totalElementsToProcess = numberOfElementsInSet;

    for (let iterationIndex = 0; iterationIndex < totalElementsToProcess; iterationIndex++) {
        const currentElementValue = elementsForProcessing[iterationIndex];
        
        // Increment count for the current element, or initialize if not present
        elementFrequencyMap[currentElementValue] = (elementFrequencyMap[currentElementValue] || 0) + 1;

        const frequencyList = [];
        for (const elementKey in elementFrequencyMap) {
            // Ensure the property belongs to the object itself, not its prototype chain
            if (Object.prototype.hasOwnProperty.call(elementFrequencyMap, elementKey)) {
                frequencyList.push([elementFrequencyMap[elementKey], elementKey]);
            }
        }

        // Sort the list in descending order of frequency
        const sortFrequenciesDescending = (itemA, itemB) => itemB[0] - itemA[0];
        frequencyList.sort(sortFrequenciesDescending);

        const remainingElementsInCurrentInput = elementsForProcessing.length - (iterationIndex + 1);
        
        const topFrequencyCount = frequencyList[0][0];
        // Determine the second highest frequency, defaulting to 0 if only one element type exists
        const secondTopFrequencyCount = frequencyList.length > 1 ? frequencyList[1][0] : 0;

        if (topFrequencyCount === secondTopFrequencyCount) {
            continue; // No clear leader yet, continue to next element
        }

        // Check if the current leader has an insurmountable lead
        if (topFrequencyCount > secondTopFrequencyCount + remainingElementsInCurrentInput) {
            const winningElementIdentifier = frequencyList[0][1];
            const winningIterationNumber = iterationIndex + 1;
            console.log(winningElementIdentifier, winningIterationNumber);
            winnerDeclared = true;
            break; // A winner is found for this set, move to the next set
        }
    }

    if (!winnerDeclared) {
        console.log("TIE");
    }
}
