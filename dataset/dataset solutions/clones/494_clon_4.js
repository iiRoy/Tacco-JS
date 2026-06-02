var inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = inputData.trim().split("\n");

function* createLineIterator(sourceLines) {
    let currentIdx = 0;
    while (currentIdx < sourceLines.length) {
        yield { value: sourceLines[currentIdx], index: currentIdx };
        currentIdx++;
    }
}

while (true) {
    const lineIterator = createLineIterator(lines);
    const getNextLine = () => lineIterator.next().value;

    const firstLine = getNextLine();
    const [currentX, currentY, currentZ] = firstLine.value.split(" ").map(Number);

    if (currentX === 0 && currentY === 0 && currentZ === 0) {
        break;
    }

    const moveValues = getNextLine().value.split(" ").map(Number);

    const eventRegistry = new Map(); // Map<y_position, [event_type, event_amount]>
    for (let i = 0; i < currentZ; i++) {
        const [eventY, eventType, eventAmount] = getNextLine().value.split(" ").map(Number);
        eventRegistry.set(eventY, [eventType, eventAmount]);
    }

    // Probability grid: Map<string_key_y_k, probability_value>
    // Key format: "y_pos,k_val"
    let probabilityGrid = new Map();
    probabilityGrid.set("0,0", 1); // Initial state: P(y=0, k=0) = 1

    // Iterate through y_positions from 0 up to currentY-1
    // This loop processes states at `currentYPos` and propagates probabilities.
    for (let currentYPos = 0; currentYPos < currentY; currentYPos++) {
        let updates = new Map(); // Accumulates probability changes for this iteration

        // Iterate over all existing probabilities in the grid
        for (const [probKey, probValue] of probabilityGrid.entries()) {
            const [yCoordStr, kCoordStr] = probKey.split(',');
            const yCoord = Number(yCoordStr);
            const kCoord = Number(kCoordStr);

            // Only process probabilities originating from the current y_position layer
            if (yCoord !== currentYPos || probValue === 0) {
                continue;
            }

            // For each possible move
            moveValues.forEach(moveVal => {
                const nextYCoord = Math.min(currentY, yCoord + moveVal);
                const probContribution = probValue / currentX;

                const eventDetails = eventRegistry.get(nextYCoord);

                let finalKCoord = kCoord;
                let finalYCoord = nextYCoord;

                if (eventDetails !== undefined) {
                    const [eventKind, eventMagnitude] = eventDetails;
                    if (eventKind === 1) { // Type 1: Change y_position
                        finalYCoord = Math.min(currentY, nextYCoord + eventMagnitude);
                    } else if (eventKind === 2) { // Type 2: Increase k_value
                        finalKCoord = Math.min(5000, kCoord + eventMagnitude);
                    } else if (eventKind === 3) { // Type 3: Decrease k_value
                        // Preserve original behavior: Math.min(0, k - a) can result in negative k
                        finalKCoord = Math.min(0, kCoord - eventMagnitude);
                    }
                }
                const targetKey = `${finalYCoord},${finalKCoord}`;
                updates.set(targetKey, (updates.get(targetKey) || 0) + probContribution);
            });
        }

        // Apply all accumulated updates to the main probability grid
        for (const [keyToUpdate, valueToAdd] of updates.entries()) {
            probabilityGrid.set(keyToUpdate, (probabilityGrid.get(keyToUpdate) || 0) + valueToAdd);
        }
    }

    // Calculate the final expected value
    let finalResult = 0;
    for (let kIndex = 0; kIndex <= 5000; kIndex++) {
        const keyForFinalY = `${currentY},${kIndex}`;
        const finalProb = probabilityGrid.get(keyForFinalY) || 0;
        finalResult += kIndex * finalProb;
    }
    console.log(Math.floor(finalResult));

    // Update the 'lines' array for the next test case in the outer while loop
    lines = lines.slice(firstLine.index + 1 + 1 + currentZ);
}
