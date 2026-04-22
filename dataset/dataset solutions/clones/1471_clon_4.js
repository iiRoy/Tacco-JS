const obtainSourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const operationLines = obtainSourceData.split('\n');

// A "node" for our custom linked structure representing the stack
const createStructureNode = (itemValue, nextReference) => ({ itemValue, nextReference });

// Function to add an element to the top of our structure
const placeItemOnStructure = (currentStructureTop, dataElement) => {
    return createStructureNode(dataElement, currentStructureTop);
};

// Function to remove an element from the top of our structure
const extractItemFromStructure = (currentStructureTop) => {
    if (!currentStructureTop) {
        return { extractedElement: undefined, newStructureTop: null };
    }
    return { extractedElement: currentStructureTop.itemValue, newStructureTop: currentStructureTop.nextReference };
};

// Process the operation lines using a functional reduce approach
const processingOutcome = operationLines.reduce((accumulator, currentInstruction) => {
    let { dataRegistry, outputRecords, terminationFlag } = accumulator;

    // If 'terminate' command was already encountered, skip further processing
    if (terminationFlag) {
        return accumulator;
    }

    if (currentInstruction === 'quit') {
        // Set termination flag and return current state
        return { dataRegistry, outputRecords, terminationFlag: true };
    } else if (currentInstruction === 'pop') {
        // Perform pop operation
        const { extractedElement, newStructureTop } = extractItemFromStructure(dataRegistry);
        outputRecords.push(extractedElement); // Collect the extracted element
        return { dataRegistry: newStructureTop, outputRecords, terminationFlag: false };
    } else { // Assume 'push X' operation
        const instructionParts = currentInstruction.split(' ');
        const valueForStorage = instructionParts[1];
        const updatedDataRegistry = placeItemOnStructure(dataRegistry, valueForStorage);
        return { dataRegistry: updatedDataRegistry, outputRecords, terminationFlag: false };
    }
}, { dataRegistry: null, outputRecords: [], terminationFlag: false }); // Initial state for the reducer

// Output all collected records
processingOutcome.outputRecords.forEach(recordedMessage => console.log(recordedMessage));