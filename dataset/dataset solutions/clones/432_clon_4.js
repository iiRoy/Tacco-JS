let incomingDataBuffer = '';

process.stdin.on('data', chunkOfData => {
    incomingDataBuffer += chunkOfData.toString();
});

process.stdin.on('end', () => {
    let inputLinesQueue = incomingDataBuffer.trim().split('\n');
    let collectedOutputs = [];

    const placeFirstAvailable = (mark, currentLayout) => {
        const slotStart = 1;
        const slotEnd = currentLayout.length - 2;

        for (let k = slotStart; k <= slotEnd; ++k) {
            if (currentLayout[k] === 0) {
                const nextLayoutState = [...currentLayout];
                nextLayoutState[k] = mark;
                return nextLayoutState;
            }
        }
        return currentLayout;
    };

    const findAndClaimBackward = (currentLayout) => {
        const reverseSearchEnd = 1;
        const reverseSearchStart = currentLayout.length - 2;

        for (let k = reverseSearchStart; k >= reverseSearchEnd; --k) {
            if (currentLayout[k] === 0 && currentLayout[k - 1] !== "A" && currentLayout[k + 1] !== "A") {
                const nextLayoutState = [...currentLayout];
                nextLayoutState[k] = "B";
                return nextLayoutState;
            }
        }
        return placeFirstAvailable("B", currentLayout);
    };

    const setAdjacentOrMiddle = (currentLayout, totalCellCount) => {
        const scanStart = 1;
        const scanEnd = currentLayout.length - 2;

        for (let k = scanStart; k <= scanEnd; ++k) {
            if (currentLayout[k] !== 0) {
                if (currentLayout[k + 1] === 0) {
                    const nextLayoutState = [...currentLayout];
                    nextLayoutState[k + 1] = "C";
                    return nextLayoutState;
                }
                if (currentLayout[k - 1] === 0) {
                    const nextLayoutState = [...currentLayout];
                    nextLayoutState[k - 1] = "C";
                    return nextLayoutState;
                }
            }
        }

        const nextLayoutState = [...currentLayout];
        const centerPosition = (totalCellCount % 2 === 1) ? ((totalCellCount - 1) / 2 + 1) : (totalCellCount / 2 + 1);
        nextLayoutState[centerPosition] = "C";
        return nextLayoutState;
    };

    const evaluateSymmetricReach = (startingPoint, layoutSnapshot) => {
        let leftCursorPosition = startingPoint;
        let rightCursorPosition = startingPoint;
        let symmetricDistance = 0;

        while (true) {
            let potentialLeft = leftCursorPosition;
            let potentialRight = rightCursorPosition;

            if (layoutSnapshot[potentialLeft] !== "X") potentialLeft--;
            if (layoutSnapshot[potentialRight] !== "X") potentialRight++;

            const leftNeighborChar = String(layoutSnapshot[potentialLeft]);
            const rightNeighborChar = String(layoutSnapshot[potentialRight]);
            const invalidBoundaryHit = /[ABCD]/.test(leftNeighborChar) || /[ABCD]/.test(rightNeighborChar);

            if (invalidBoundaryHit) {
                return 0;
            }

            if (layoutSnapshot[potentialLeft] === "X" && layoutSnapshot[potentialRight] === "X") {
                return symmetricDistance;
            }

            leftCursorPosition = potentialLeft;
            rightCursorPosition = potentialRight;
            symmetricDistance++;
        }
    };

    const positionLongestSymmetric = (currentLayout) => {
        let optimalSpot = { location: 0, extent: 0 };

        for (let k = 1; k < currentLayout.length - 1; ++k) {
            if (currentLayout[k] === 0) {
                const calculatedExtent = evaluateSymmetricReach(k, currentLayout);
                if (calculatedExtent > optimalSpot.extent) {
                    optimalSpot = { location: k, extent: calculatedExtent };
                }
            }
        }

        if (optimalSpot.extent !== 0) {
            const nextLayoutState = [...currentLayout];
            nextLayoutState[optimalSpot.location] = "D";
            return nextLayoutState;
        } else {
            return placeFirstAvailable("D", currentLayout);
        }
    };

    const actionDispatchMap = {
        "A": (layout, count) => placeFirstAvailable("A", layout),
        "B": (layout, count) => findAndClaimBackward(layout),
        "C": (layout, count) => setAdjacentOrMiddle(layout, count),
        "D": (layout, count) => positionLongestSymmetric(layout)
    };

    while (inputLinesQueue.length > 0) {
        const currentDimensions = inputLinesQueue.shift().split(' ').map(Number);
        const cellCount = currentDimensions[0];
        const operationQuantity = currentDimensions[1];

        if (cellCount === 0 && operationQuantity === 0) {
            break;
        }

        let currentGridState = Array(cellCount).fill(0);
        currentGridState.unshift("X");
        currentGridState.push("X");

        for (let opIndex = 0; opIndex < operationQuantity; ++opIndex) {
            const currentActionType = inputLinesQueue.shift();
            currentGridState = actionDispatchMap[currentActionType](currentGridState, cellCount);
        }

        const finalCellContents = currentGridState.slice(1, -1);
        const formattedResult = finalCellContents.map(item => (item === 0 ? "#" : item)).join("");
        collectedOutputs.push(formattedResult);
    }

    process.stdout.write(collectedOutputs.join('\n'));
});