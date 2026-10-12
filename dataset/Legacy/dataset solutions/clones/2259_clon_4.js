"use strict";

function processInputData(rawInputTextContent) {
    const contentLines = rawInputTextContent.trim().split("\n");

    const configurationData = contentLines[0].split(' ').map(Number);
    const totalCount = configurationData[0];
    const chosenSize = configurationData[1];

    const numberSequence = contentLines[1].split(' ').map(Number);

    let aggregateSum = 0;
    const modulusConstant = 1000000007;

    const subsetProcessor = (selectedElements) => {
        let currentMax = -Infinity;
        let currentMin = Infinity;

        // Manually find max and min to diverge from Math.max.apply or spread operator
        for (let elemIndex = 0; elemIndex < selectedElements.length; elemIndex++) {
            const currentElement = selectedElements[elemIndex];
            if (currentElement > currentMax) {
                currentMax = currentElement;
            }
            if (currentElement < currentMin) {
                currentMin = currentElement;
            }
        }

        const differenceValue = currentMax - currentMin;
        aggregateSum = (aggregateSum + (differenceValue % modulusConstant)) % modulusConstant;
    };

    recursiveCombinationGenerator(
        numberSequence,
        chosenSize,
        [],
        0,
        subsetProcessor
    );

    console.log(aggregateSum);
}

function recursiveCombinationGenerator(sourceElements, selectionTarget, currentSelectionBuffer, currentIndexStart, actionCallback) {
    if (currentSelectionBuffer.length === selectionTarget) {
        actionCallback(currentSelectionBuffer);
        return;
    }

    if (currentIndexStart >= sourceElements.length) {
        return;
    }

    for (let elementIterator = currentIndexStart; elementIterator < sourceElements.length; elementIterator++) {
        currentSelectionBuffer.push(sourceElements[elementIterator]);

        recursiveCombinationGenerator(
            sourceElements,
            selectionTarget,
            currentSelectionBuffer,
            elementIterator + 1,
            actionCallback
        );

        currentSelectionBuffer.pop();
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));