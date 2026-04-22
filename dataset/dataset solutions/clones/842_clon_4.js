const lineProcessor = require('readline').createInterface({ input: process.stdin });

let receivedLines = [];

lineProcessor.on('line', (individualLine) => {
    receivedLines.push(individualLine.trim());
});

lineProcessor.on('close', () => {
    let currentLinePointer = 0;

    const fetchNextValue = () => receivedLines[currentLinePointer++];

    const totalItemCount = parseInt(fetchNextValue(), 10);

    const dataObjects = [];
    for (let currentItem = 0; currentItem < totalItemCount; currentItem++) {
        const componentStrings = fetchNextValue().split(" ");
        dataObjects.push({
            deadline: parseInt(componentStrings[0], 10),
            threshold: parseInt(componentStrings[1], 10)
        });
    }

    // Order data by 'threshold' in descending sequence
    dataObjects.sort((firstElement, secondElement) => secondElement.threshold - firstElement.threshold);

    // Function to determine the quantity of selected elements for a specific time limit
    const determineSelectedQuantity = (timeLimit, orderedData) => {
        return orderedData.reduce((accumulatedQuantity, currentElement) => {
            if (currentElement.deadline <= timeLimit && currentElement.threshold > accumulatedQuantity) {
                return accumulatedQuantity + 1;
            }
            return accumulatedQuantity;
        }, 0);
    };

    // Construct a numerical range from 2 to 100001 (inclusive)
    const possibleTimeLimits = Array.from({ length: 100000 }, (_, index) => index + 2);

    // Compute the selected quantity for each time limit and find the largest among them
    const allComputedQuantities = possibleTimeLimits.map(limit => determineSelectedQuantity(limit, dataObjects));
    
    const ultimateMaximum = allComputedQuantities.reduce((currentHigh, value) => Math.max(currentHigh, value), 0);

    // Deliver the final outcome
    process.stdout.write((ultimateMaximum - 1).toString() + '\n');
});