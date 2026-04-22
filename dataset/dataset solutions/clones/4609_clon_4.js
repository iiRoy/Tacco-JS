function makeNum(s) { return Number(s); }

function ascendingOrderSort(collection) {
    let newArr = [...collection]; // Create a shallow copy to avoid modifying original
    let n = newArr.length;
    for (let current = 0; current < n - 1; current++) {
        for (let next = 0; next < n - current - 1; next++) {
            if (newArr[next] > newArr[next + 1]) {
                let temporary = newArr[next];
                newArr[next] = newArr[next + 1];
                newArr[next + 1] = temporary;
            }
        }
    }
    return newArr;
}

function descendingOrderSort(collection) {
    let newArr = [...collection];
    let n = newArr.length;
    for (let current = 0; current < n - 1; current++) {
        for (let next = 0; next < n - current - 1; next++) {
            if (newArr[next] < newArr[next + 1]) { // Flipped comparison
                let temporary = newArr[next];
                newArr[next] = newArr[next + 1];
                newArr[next + 1] = temporary;
            }
        }
    }
    return newArr;
}

function lexicographicalSort(collection) {
    return [...collection].sort(); // Default string sort
}

function reverseLexicographicalSort(collection) {
    return [...collection].sort().reverse(); // Default string sort then reverse
}

function omitElement(collection, elementToExclude) {
    const resultCollection = [];
    for (const item of collection) {
        if (item !== elementToExclude) {
            resultCollection.push(item);
        }
    }
    return resultCollection;
}

let aggregatedInput = '';
const lineReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

lineReader.on('line', (lineSegment) => {
    aggregatedInput += lineSegment + '\n';
});

lineReader.on('close', () => {
    let processedRows = aggregatedInput.split('\n').map(l => l.trim());
    if (processedRows[processedRows.length - 1] === '') {
        processedRows = processedRows.slice(0, -1);
    }
    commenceCalculations(processedRows);
});

let overallBestValue = 0;

function commenceCalculations(allInputRows) {
    const initialParameters = allInputRows[0].split(' ').map(makeNum);
    const itemQuantity = initialParameters[0];
    const weightLimit = initialParameters[1];

    const itemDataCollection = allInputRows.slice(1).map(l => l.split(' ').map(makeNum));

    // Stack for iterative Depth-First Search (DFS)
    // Each element: [nextItemIndexToConsider, currentAccumulatedWeight, currentAccumulatedValue]
    const explorationStack = [[0, 0, 0]];

    while (explorationStack.length > 0) {
        const [nextItemIndexToConsider, accumulatedWeight, accumulatedValue] = explorationStack.pop();

        if (nextItemIndexToConsider === itemQuantity) {
            // This condition mirrors the 'ai === N' base case in the original recursive function.
            // It prints the globally tracked maximum value and immediately terminates the process.
            console.log(overallBestValue);
            process.exit();
        }

        // The loop below corresponds to the 'for (var i = ai, l = N; i < l; i++)' in the original.
        // It explores all possible items 'k' from 'nextItemIndexToConsider' up to 'itemQuantity - 1'
        // that can be added to the current accumulated weight.
        for (let k = nextItemIndexToConsider; k < itemQuantity; k++) {
            const itemWeight = itemDataCollection[k][0];
            const itemValue = itemDataCollection[k][1];

            if (itemWeight + accumulatedWeight <= weightLimit) {
                // Update the overall best value if the current path yields a higher total.
                overallBestValue = (itemValue + accumulatedValue > overallBestValue ? itemValue + accumulatedValue : overallBestValue);
                
                // Push a new state onto the stack, representing the decision to include item 'k'
                // and then proceed to consider items starting from 'k + 1'.
                explorationStack.push([k + 1, itemWeight + accumulatedWeight, itemValue + accumulatedValue]);
            }
        }
    }

    // This console.log is a fallback if the explorationStack becomes empty
    // without ever hitting the 'process.exit()' condition (i.e., no path reached itemQuantity).
    console.log(overallBestValue);
}