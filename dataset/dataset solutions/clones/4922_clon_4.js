function processAllInformation(dataSourceText) {
    const allLines = dataSourceText.split('\n').filter(line => line.length > 0);
    const quantityOfOperations = Number(allLines[0].match(/\d+/)[0]);

    const operationSpecs = [];
    for (let lineIdentifier = 1; lineIdentifier <= quantityOfOperations; lineIdentifier++) {
        const numericalElements = allLines[lineIdentifier].match(/\d+/g).map(Number);
        operationSpecs.push({
            firstElement: numericalElements[0],
            secondElement: numericalElements[1]
        });
    }

    const determineCeiling = (dividend, divisor) => {
        return Math.floor((dividend + divisor - 1) / divisor);
    };

    const cumulativeOutcome = operationSpecs.reduce((previousAggregate, currentInstruction) => {
        const [currentXValue, currentYValue] = previousAggregate;
        const { firstElement: nextXValue, secondElement: nextYValue } = currentInstruction;

        let neededFactorX = 1;
        if (currentXValue !== 0) {
            neededFactorX = determineCeiling(currentXValue, nextXValue);
        }

        let neededFactorY = 1;
        if (currentYValue !== 0) {
            neededFactorY = determineCeiling(currentYValue, nextYValue);
        }
        
        const overallMultiplier = (neededFactorX > neededFactorY) ? neededFactorX : neededFactorY;

        return [nextXValue * overallMultiplier, nextYValue * overallMultiplier];

    }, [0, 0]);

    console.log(cumulativeOutcome[0] + cumulativeOutcome[1]);
}

processAllInformation(require("fs").readFileSync("/dev/stdin", "utf8"));