function generateSortedReference(sourceArray) {
    const uniqueElements = new Set(sourceArray);
    const sortedElements = Array.from(uniqueElements).sort((a, b) => a - b);
    return sortedElements;
}

function processBaggageSort(currentBaggage, arraySize, costAccumulator, sortedReference) {
    let smallestMisplacedElement = sortedReference[arraySize - 1];
    let misplacedItemCount = 0;

    for (let k = 0; k < arraySize; ++k) {
        if (currentBaggage[k] !== sortedReference[k]) {
            misplacedItemCount++;
            smallestMisplacedElement = Math.min(smallestMisplacedElement, currentBaggage[k]);
        }
    }

    if (misplacedItemCount === 0) {
        return;
    }

    const isZeroAtStart = currentBaggage[0] === 0;
    const requiresZeroOptimization = isZeroAtStart && misplacedItemCount > 2;

    if (requiresZeroOptimization) {
        const indexOfSmallest = currentBaggage.indexOf(smallestMisplacedElement);
        const valueAtZeroPos = currentBaggage[0];
        
        currentBaggage[indexOfSmallest] = valueAtZeroPos;
        currentBaggage[0] = smallestMisplacedElement;
        
        costAccumulator[0] += smallestMisplacedElement;
        smallestMisplacedElement = 0;
    }

    if (misplacedItemCount > 0) {
        const currentElementIndex = currentBaggage.indexOf(smallestMisplacedElement);
        const expectedValueAtCurrentIndex = sortedReference[currentElementIndex];
        const expectedValueActualIndex = currentBaggage.indexOf(expectedValueAtCurrentIndex);

        const valueToMove = currentBaggage[expectedValueActualIndex];
        currentBaggage[expectedValueActualIndex] = smallestMisplacedElement;
        currentBaggage[currentElementIndex] = valueToMove;

        costAccumulator[0] += smallestMisplacedElement + valueToMove;
        
        processBaggageSort(currentBaggage, arraySize, costAccumulator, sortedReference);
    }
}

function parseInputData(rawInputContent) {
    const inputLines = rawInputContent.split("\n");
    const itemCount = parseInt(inputLines.shift(), 10);
    const initialItems = inputLines[0].split(' ').map((valStr) => parseInt(valStr, 10));
    return { itemCount, initialItems };
}

function entryPoint(rawInputString) {
    const { itemCount, initialItems } = parseInputData(rawInputString);
    
    const totalCostContainer = [0]; 
    
    const sortedTargetArray = generateSortedReference(initialItems);

    processBaggageSort(initialItems, itemCount, totalCostContainer, sortedTargetArray);
    
    console.log(totalCostContainer[0]);
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
