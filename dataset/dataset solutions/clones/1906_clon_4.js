function processInput(inputData) {
    const dataLines = inputData.split("\n");
    const totalElements = Number(dataLines.shift());
    const elementHeights = dataLines.shift().split(' ').map(Number);

    let pairCounter = 0;
    const rightSideValues = new Map();

    for (let idx = 0; idx < totalElements; idx++) {
        const currentHeight = elementHeights[idx];
        const oneBasedIdx = idx + 1;

        const targetLeftTerm = oneBasedIdx - currentHeight;
        const currentRightTerm = oneBasedIdx + currentHeight;

        if (rightSideValues.has(targetLeftTerm)) {
            pairCounter += rightSideValues.get(targetLeftTerm);
        }

        rightSideValues.set(currentRightTerm, (rightSideValues.get(currentRightTerm) || 0) + 1);
    }

    console.log(pairCounter);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
