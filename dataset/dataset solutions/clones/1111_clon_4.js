let inputAccumulator = [];

process.stdin.on('readable', () => {
    let piece;
    while (null !== (piece = process.stdin.read())) {
        inputAccumulator.push(piece);
    }
});

process.stdin.on('end', () => {
    let entireInput = Buffer.concat(inputAccumulator).toString('utf8');

    // Mimic original parsing: .trim().split(/[ |\n]/).slice(1)
    // This includes preserving empty strings that result from consecutive delimiters.
    let parsedSegments = entireInput
        .trim() // Remove leading/trailing whitespace
        .split(/[ |\n]/); // Split by space or newline characters

    parsedSegments.shift(); // Remove the first element (e.g., a count, similar to .slice(1))

    let constructedOutputs = [];
    let currentPointer = 0; // Represents the 0-based index in parsedSegments

    while (currentPointer < parsedSegments.length) {
        let currentItemValue = parsedSegments[currentPointer];
        let displayOrdinal = currentPointer + 1; // 1-based index for output (node number)

        let nodeString = "node " + displayOrdinal + ": val = " + currentItemValue + ", ";

        // Determine parent
        if (displayOrdinal > 1) { // Not the root node
            let parentDataIndex = Math.floor(displayOrdinal / 2) - 1;
            let parentDataValue = parsedSegments[parentDataIndex];
            nodeString += "parent val = " + parentDataValue + ", ";
        }

        // Determine left child
        let leftChildDataIndex = (2 * displayOrdinal) - 1;
        if (leftChildDataIndex < parsedSegments.length) {
            let leftChildDataValue = parsedSegments[leftChildDataIndex];
            nodeString += "left val = " + leftChildDataValue + ", ";
        }

        // Determine right child
        let rightChildDataIndex = (2 * displayOrdinal);
        if (rightChildDataIndex < parsedSegments.length) {
            let rightChildDataValue = parsedSegments[rightChildDataIndex];
            nodeString += "right val = " + rightChildDataValue + ", ";
        }

        constructedOutputs.push(nodeString);
        currentPointer++;
    }

    process.stdout.write(constructedOutputs.join('\n'));
});