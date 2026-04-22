function solveAmida(rawData) {
    const parsedData = rawData.split(" ").map(item => parseInt(item, 10));
    const depth = parsedData[0];
    const breadth = parsedData[1];
    const targetColumn = parsedData[2];
    const primeMod = 10 ** 9 + 7;

    if (breadth === 1) return 1;

    const allowedConfigurations = [];
    const buildConfigurations = (currentPattern, remainingSegments) => {
        if (remainingSegments === 0) {
            allowedConfigurations.push([false, ...currentPattern, false]);
            return;
        }

        const lastElementWasBar = currentPattern.length > 0 && currentPattern[currentPattern.length - 1] === true;

        buildConfigurations([...currentPattern, false], remainingSegments - 1);

        if (!lastElementWasBar) {
            buildConfigurations([...currentPattern, true], remainingSegments - 1);
        }
    };
    buildConfigurations([], breadth - 1);

    let currentPathCounts = new Array(breadth).fill(0);
    currentPathCounts[0] = 1;

    const computeNextLevelCounts = (previousLevelCounts) => {
        const nextLevelAccumulator = new Array(breadth).fill(0);

        for (const patternSegment of allowedConfigurations) {
            const transformedBySegment = new Array(breadth).fill(0);

            for (let currentColumnIndex = 0; currentColumnIndex < breadth; ++currentColumnIndex) {
                const barToLeft = patternSegment[currentColumnIndex];
                const barToRight = patternSegment[currentColumnIndex + 1];

                if (barToLeft) {
                    if (currentColumnIndex > 0) {
                        transformedBySegment[currentColumnIndex] = (transformedBySegment[currentColumnIndex] + previousLevelCounts[currentColumnIndex - 1]) % primeMod;
                    }
                } else if (barToRight) {
                    if (currentColumnIndex < breadth - 1) {
                        transformedBySegment[currentColumnIndex] = (transformedBySegment[currentColumnIndex] + previousLevelCounts[currentColumnIndex + 1]) % primeMod;
                    }
                } else {
                    transformedBySegment[currentColumnIndex] = (transformedBySegment[currentColumnIndex] + previousLevelCounts[currentColumnIndex]) % primeMod;
                }
            }

            for (let k = 0; k < breadth; ++k) {
                nextLevelAccumulator[k] = (nextLevelAccumulator[k] + transformedBySegment[k]) % primeMod;
            }
        }
        return nextLevelAccumulator;
    };

    for (let currentLevel = 0; currentLevel < depth; ++currentLevel) {
        currentPathCounts = computeNextLevelCounts(currentPathCounts);
    }

    return currentPathCounts[targetColumn - 1];
}

if (typeof require !== 'undefined') {
    console.log(solveAmida(require("fs").readFileSync("/dev/stdin", "utf8")));
}