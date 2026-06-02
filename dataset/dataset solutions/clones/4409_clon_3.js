function printResult(message) {
    console.log(message);
}

function processInput(rawData) {
    const rawDataLines = rawData.trim().split("\n");
    const gridSize = Number.parseInt(rawDataLines[0], 10);
    const topRowChars = [...rawDataLines[1]];
    const bottomRowChars = [...rawDataLines[2]];

    let totalWays = 1;
    const moduloValue = 1000000007;

    const applyModuloProduct = (currentWays, multiplier) => {
        return (currentWays * multiplier) % moduloValue;
    };

    let wasVerticalBlock = true;
    let currentIndex = 0;

    // Handle the first block (currentIndex = 0) separately
    const isFirstBlockVertical = (topRowChars[0] === bottomRowChars[0]);

    if (isFirstBlockVertical) {
        totalWays = applyModuloProduct(totalWays, 3);
        wasVerticalBlock = true;
        currentIndex = 1;
    } else { // First block is horizontal
        totalWays = applyModuloProduct(totalWays, 6);
        wasVerticalBlock = false;
        currentIndex = 2;
    }

    // Loop for subsequent blocks
    while (currentIndex < gridSize) {
        const isCurrentBlockVertical = (topRowChars[currentIndex] === bottomRowChars[currentIndex]);

        if (wasVerticalBlock) {
            totalWays = applyModuloProduct(totalWays, 2);
            if (isCurrentBlockVertical) {
                wasVerticalBlock = true;
                currentIndex++;
            } else { // Current block is horizontal
                wasVerticalBlock = false;
                currentIndex += 2;
            }
        } else { // Previous block was horizontal
            if (isCurrentBlockVertical) {
                wasVerticalBlock = true;
                currentIndex++;
            } else { // Current block is horizontal
                totalWays = applyModuloProduct(totalWays, 3);
                wasVerticalBlock = false;
                currentIndex += 2;
            }
        }
    }
    printResult(totalWays);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
