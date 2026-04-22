function processData(inputString) {
    const allLines = inputString.trim().split('\n');
    const totalQuantity = parseInt(allLines[0], 10);
    const dataSegments = allLines.slice(1);

    const transformedSegments = dataSegments.map((segmentLine, originalPosition) => {
        const parts = segmentLine.split(' ');
        const componentA = parseInt(parts[0], 10);
        const componentB = parseInt(parts[1], 10);
        return {
            elementA: componentA,
            elementB: componentB,
            elementSum: componentA + componentB,
            initialIndex: originalPosition
        };
    });

    const orderedSegments = transformedSegments.sort((itemAlpha, itemBeta) => {
        if (itemAlpha.elementSum !== itemBeta.elementSum) {
            return itemAlpha.elementSum - itemBeta.elementSum;
        }
        return itemAlpha.initialIndex - itemBeta.initialIndex; // Preserve initial order for stable sort behavior
    });

    const finalAccumulation = Array.from({ length: totalQuantity }).reduce((currentStatus, _, roundCounter) => {
        const { currentAvailableElements, playerAlphaScore, playerBetaScore } = currentStatus;

        if (currentAvailableElements.length === 0) {
            return currentStatus;
        }

        const primaryValue = currentAvailableElements[0].elementSum;
        const candidatesForSelection = currentAvailableElements.filter(el => el.elementSum === primaryValue);

        const isAlphaTurn = (roundCounter % 2 === 0);
        const selectionCriterion = isAlphaTurn ? 'elementA' : 'elementB';

        let selectedElement = candidatesForSelection.reduce((bestFound, currentEl) => {
            if (currentEl[selectionCriterion] > bestFound[selectionCriterion]) {
                return currentEl;
            }
            return bestFound;
        }, candidatesForSelection[0]);

        const nextAlphaScore = isAlphaTurn ? playerAlphaScore + selectedElement.elementA : playerAlphaScore;
        const nextBetaScore = !isAlphaTurn ? playerBetaScore + selectedElement.elementB : playerBetaScore;

        const indexOfChosen = currentAvailableElements.indexOf(selectedElement);
        const nextAvailableElements = [
            ...currentAvailableElements.slice(0, indexOfChosen),
            ...currentAvailableElements.slice(indexOfChosen + 1)
        ];

        return {
            currentAvailableElements: nextAvailableElements,
            playerAlphaScore: nextAlphaScore,
            playerBetaScore: nextBetaScore
        };
    }, { currentAvailableElements: orderedSegments, playerAlphaScore: 0, playerBetaScore: 0 });

    console.log(finalAccumulation.playerAlphaScore - finalAccumulation.playerBetaScore);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));