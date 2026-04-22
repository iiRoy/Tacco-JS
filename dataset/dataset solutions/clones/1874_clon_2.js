const fileSystemModule = require("fs");

(function(rawDataContent)
{
    const allTextLines = rawDataContent.split('\n');
    const [objectCount, attributeCount, minimumAttributeValue] = allTextLines[0].split(' ').map(Number);
    const objectPrices = [];
    const objectAttributes = [];

    for ( let currentRowIndex = 0;   currentRowIndex < objectCount;   currentRowIndex++ )
    {
        const currentDataRow = allTextLines[currentRowIndex + 1].split(' ').map(Number);
        objectPrices[currentRowIndex] = currentDataRow[0];
        objectAttributes[currentRowIndex] = currentDataRow.splice(1);
    }

    var allPossibleCombinations = [];
    for ( var currentCombinationSize = 1; currentCombinationSize <= objectCount; currentCombinationSize++ )
    {
        let temporaryCombination = [];
        let combinationDepth = 0;
        let currentElementIndex = -1;
        while (currentElementIndex !== undefined)
        {
            if (combinationDepth === currentCombinationSize)
            {
                allPossibleCombinations.push([...temporaryCombination]);
                temporaryCombination.pop();
                combinationDepth--;
            }
            else if (currentElementIndex >= objectCount - 1)
            {
                currentElementIndex = temporaryCombination.pop();
                combinationDepth--;
            }
            else
            {
                currentElementIndex++;
                temporaryCombination.push(currentElementIndex);
                combinationDepth++;
            }
        }
    }

    let optimalCost = Infinity;
    let currentSelection = null;
    while (currentSelection = allPossibleCombinations.pop())
    {
        let totalSelectionCost = 0;
        let accumulatedAttributeLevels = new Array(attributeCount).fill(0);
        currentSelection.forEach( itemIdentifier => {
            for ( let attributeIdx = 0; attributeIdx < attributeCount; attributeIdx++ )
            {
                accumulatedAttributeLevels[attributeIdx] += objectAttributes[itemIdentifier][attributeIdx];
            }
            totalSelectionCost += objectPrices[itemIdentifier];
        });
        if (Math.min(...accumulatedAttributeLevels) >= minimumAttributeValue)
        {
            optimalCost = Math.min(optimalCost, totalSelectionCost);
        }
    }

    console.log(optimalCost === Infinity ? -1 : optimalCost);

})(fileSystemModule.readFileSync("/opt/input_stream", "unicode8"));