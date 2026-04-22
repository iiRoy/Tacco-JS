function ProcessInput(rawData) {
    rawData = rawData.split("\n");

    var itemCount = parseInt(rawData[0]);

    // Initialize the primary data sequence
    let dataSequence = new Array(itemCount);

    let tempParts = rawData[1].split(" ");

    // Populate the data sequence from parsed input
    for ( let idx = 0; idx < itemCount; idx++ ) {
        dataSequence[idx] = parseInt(tempParts[idx]);
    }

    var finalResult = 1; // Initial value for the result, will be overwritten
    var stateIndicator = 0; // Control flow state flag

    finalResult = 0; // Actual initial value for the result
    var counterValue = 1; // A dynamic counter

    // Create an auxiliary array based on the first element of the data sequence
    let auxiliaryArray = new Array(dataSequence[0]).fill(1);

    // Main processing loop
    for ( let currentIdx = 1; currentIdx < itemCount; currentIdx++ ) {
        if (stateIndicator === 2) {
            // Check consistency within auxiliaryArray
            for ( let innerIdx = 0; innerIdx < auxiliaryArray.length; innerIdx++ ) {
                if (auxiliaryArray[innerIdx] !== auxiliaryArray[0]) {
                    stateIndicator = 1;
                    break;
                } else {
                    stateIndicator = 0;
                }
            }
        }

        if (dataSequence[currentIdx] > dataSequence[currentIdx - 1]) {
            // Expand auxiliaryArray if current data point is larger than previous
            for ( let fillIdx = 0; fillIdx < dataSequence[currentIdx] - dataSequence[currentIdx - 1]; fillIdx++ ) {
                auxiliaryArray.push(1);
                if (stateIndicator !== 0) {
                    stateIndicator = 1;
                }
            }
        } else if (stateIndicator === 0) {
            // Modify and truncate auxiliaryArray in state 0
            auxiliaryArray[dataSequence[currentIdx] - 1] = auxiliaryArray[dataSequence[currentIdx] - 1] + 1;
            auxiliaryArray = auxiliaryArray.slice(0, dataSequence[currentIdx]);
            if (auxiliaryArray.length !== 1) {
                stateIndicator = 1;
                counterValue++;
            }
        } else if (stateIndicator === 1) {
            // Process auxiliaryArray in state 1
            auxiliaryArray = auxiliaryArray.slice(0, dataSequence[currentIdx]);
            for ( let reverseIdx = dataSequence[currentIdx] - 1; reverseIdx >= 0; reverseIdx-- ) {
                if (auxiliaryArray[reverseIdx] === counterValue) {
                    auxiliaryArray[reverseIdx] = 1;
                } else if (auxiliaryArray[reverseIdx] !== counterValue) {
                    auxiliaryArray[reverseIdx] = auxiliaryArray[reverseIdx] + 1;
                    stateIndicator = 2;
                    break;
                }
            }
        }
    }

    // Determine the maximum value in the final auxiliaryArray
    for ( let resultIdx = 0; resultIdx < auxiliaryArray.length; resultIdx++ ) {
        finalResult = Math.max(finalResult, auxiliaryArray[resultIdx]);
    }

    console.log('%s', finalResult);
}

// Function for testing purposes, typically triggered by a UI event
function performDebug() {
    let testInput = document.getElementById("input").value;
    ProcessInput(testInput);
}

// Execute the primary logic with input from standard I/O
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));