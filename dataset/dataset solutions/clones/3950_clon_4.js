function processInput(inputString) {
    const [firstValue, secondValue] = inputString.split(" ").map(Number);

    const [dominantValue, subordinateValue, dominantChar, subordinateChar] = firstValue > secondValue
        ? [firstValue, secondValue, ".", "#"]
        : [secondValue, firstValue, "#", "."];

    const gridDimension = Math.ceil(Math.sqrt(dominantValue)) * 4;

    const patternDefinitions = {
        initialBlock: [
            [dominantChar, dominantChar, dominantChar, subordinateChar],
            [dominantChar, dominantChar, dominantChar, subordinateChar],
            [dominantChar, dominantChar, dominantChar, subordinateChar],
            [subordinateChar, subordinateChar, subordinateChar, subordinateChar]
        ],
        dominantExhaustedBlock: Array.from({ length: 4 }, () => Array(4).fill(subordinateChar)),
        subordinateExhaustedBlock: [
            [dominantChar, dominantChar, dominantChar, subordinateChar],
            [dominantChar, dominantChar, dominantChar, subordinateChar],
            [dominantChar, dominantChar, dominantChar, subordinateChar],
            [subordinateChar, subordinateChar, subordinateChar, subordinateChar]
        ],
        standardBlock: [
            [dominantChar, dominantChar, dominantChar, subordinateChar],
            [dominantChar, subordinateChar, dominantChar, subordinateChar],
            [dominantChar, dominantChar, dominantChar, subordinateChar],
            [subordinateChar, subordinateChar, subordinateChar, subordinateChar]
        ]
    };

    const blockRowsCount = gridDimension / 4;
    const blockColsCount = gridDimension / 4;
    const totalBlockUnits = blockRowsCount * blockColsCount;

    const blockUnitSequence = Array.from({ length: totalBlockUnits }).reduce((accumulator, _, blockIndex) => {
        let { currentDominantCount, currentSubordinateCount, collectedBlocks } = accumulator;
        let selectedPattern;

        if (blockIndex === 0) {
            selectedPattern = patternDefinitions.initialBlock;
        } else if (currentDominantCount === dominantValue) {
            selectedPattern = patternDefinitions.dominantExhaustedBlock;
        } else if (currentSubordinateCount === subordinateValue) {
            selectedPattern = patternDefinitions.subordinateExhaustedBlock;
            currentDominantCount++;
        } else {
            selectedPattern = patternDefinitions.standardBlock;
            currentDominantCount++;
            currentSubordinateCount++;
        }
        collectedBlocks.push(selectedPattern);
        return { currentDominantCount, currentSubordinateCount, collectedBlocks };
    }, { currentDominantCount: 1, currentSubordinateCount: 1, collectedBlocks: [] }).collectedBlocks;

    const finalOutputRows = Array.from({ length: gridDimension }, (_, rowIndex) => {
        const blockRowIdentifier = Math.floor(rowIndex / 4);
        const subRowIdentifier = rowIndex % 4;

        return Array.from({ length: blockColsCount }, (_, colBlockIdentifier) => {
            const sequenceIndex = blockRowIdentifier * blockColsCount + colBlockIdentifier;
            return blockUnitSequence[sequenceIndex][subRowIdentifier].join("");
        }).join("");
    });

    console.log("%d %d\n%s", gridDimension, gridDimension, finalOutputRows.join("\n"));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
