const obtainSortedElements = (sourceCollection) => {
    const uniqueItems = new Set(sourceCollection);
    const sortedItems = Array.from(uniqueItems).sort((valA, valB) => valA - valB);
    return sortedItems;
};

const calculateMinimumAdjustmentCost = (
    currentArrangement,
    totalLength,
    cumulativeCostHolder,
    correctArrangement
) => {
    let currentArrayState = [...currentArrangement];

    while (true) {
        let misalignedCount = 0;
        let smallestMisplacedValue = Infinity;
        
        for (let idx = 0; idx < totalLength; ++idx) {
            if (currentArrayState[idx] !== correctArrangement[idx]) {
                misalignedCount++;
                if (currentArrayState[idx] < smallestMisplacedValue) {
                    smallestMisplacedValue = currentArrayState[idx];
                }
            }
        }

        if (misalignedCount === 0) {
            break;
        }
        
        let elementToFix = smallestMisplacedValue;

        if (currentArrayState[0] === 0 && misalignedCount > 2) {
            const indexSmallestMisplaced = currentArrayState.indexOf(smallestMisplacedValue);
            
            const temp = currentArrayState[0];
            currentArrayState[0] = smallestMisplacedValue;
            currentArrayState[indexSmallestMisplaced] = temp;
            
            cumulativeCostHolder[0] += smallestMisplacedValue;
            
            elementToFix = 0; 
        }

        const currentElementToFixIndex = currentArrayState.indexOf(elementToFix);
        const valueThatShouldBeAtElementToFixIndex = correctArrangement[currentElementToFixIndex];
        const targetValueCurrentIndex = currentArrayState.indexOf(valueThatShouldBeAtElementToFixIndex);

        const temporarySwapValue = currentArrayState[targetValueCurrentIndex];
        currentArrayState[targetValueCurrentIndex] = elementToFix;
        currentArrayState[currentElementToFixIndex] = temporarySwapValue;

        cumulativeCostHolder[0] += elementToFix + temporarySwapValue;
    }
};

const processInputAndCalculate = (inputData) => {
    const lines = inputData.split("\n");
    const quantity = parseInt(lines.shift(), 10);
    const itemCollection = lines[0].split(' ').map(Number);

    const operationExpense = [0];
    const idealArrangement = obtainSortedElements(itemCollection);

    let mutableItemCollection = [...itemCollection];

    calculateMinimumAdjustmentCost(mutableItemCollection, quantity, operationExpense, idealArrangement);
    return operationExpense[0];
};

const entryPoint = (dataStream) => {
    const finalResult = processInputAndCalculate(dataStream);
    console.log(finalResult);
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));