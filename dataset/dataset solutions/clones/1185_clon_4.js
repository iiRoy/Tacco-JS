function createBlockForm(initialMetrics) {
    return {
        top: initialMetrics[0],
        front: initialMetrics[1],
        right: initialMetrics[2],
        left: initialMetrics[3],
        back: initialMetrics[4],
        bottom: initialMetrics[5]
    };
}

function rotateTowardsNorth(currentBlock) {
    return {
        top: currentBlock.back,
        front: currentBlock.top,
        right: currentBlock.right,
        left: currentBlock.left,
        back: currentBlock.bottom,
        bottom: currentBlock.front
    };
}

function rotateTowardsSouth(currentBlock) {
    return {
        top: currentBlock.front,
        front: currentBlock.bottom,
        right: currentBlock.right,
        left: currentBlock.left,
        back: currentBlock.top,
        bottom: currentBlock.back
    };
}

function rotateTowardsWest(currentBlock) {
    return {
        top: currentBlock.left,
        front: currentBlock.front,
        right: currentBlock.top,
        left: currentBlock.bottom,
        back: currentBlock.back,
        bottom: currentBlock.right
    };
}

function rotateTowardsEast(currentBlock) {
    return {
        top: currentBlock.right,
        front: currentBlock.front,
        right: currentBlock.bottom,
        left: currentBlock.top,
        back: currentBlock.back,
        bottom: currentBlock.left
    };
}

function enactManeuver(currentBlock, actionSymbol) {
    switch (actionSymbol) {
        case "N": return rotateTowardsNorth(currentBlock);
        case "S": return rotateTowardsSouth(currentBlock);
        case "W": return rotateTowardsWest(currentBlock);
        case "E": return rotateTowardsEast(currentBlock);
        default: return currentBlock;
    }
}

new Promise(function (resolveProcess, rejectProcess) {
    let gatheredInput = "";
    process.stdin.on("data", dataChunk => { gatheredInput += dataChunk; });
    process.stdin.on("end", () => { resolveProcess([gatheredInput, process.stdout]); });
}).then(function([allInput, outputStream]) {
    const inputLines = allInput.split("\n").slice(0, 2);
    const startingSurfaces = inputLines[0].split(" ").map(valStr => parseInt(valStr, 10));
    const maneuverSequence = inputLines[1];

    const initialBlockState = createBlockForm(startingSurfaces);
    const finalBlockState = Array.from(maneuverSequence).reduce(enactManeuver, initialBlockState);

    outputStream.write(`${finalBlockState.top}\n`);
});