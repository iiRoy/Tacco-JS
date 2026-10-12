function Main(input) {
    const parsedInput = input.split(" ").map(val => parseInt(val, 10));
    const heightLimit = parsedInput[0];
    const widthLimit = parsedInput[1];
    const targetColumn = parsedInput[2];
    const moduloValue = 10**9 + 7;

    if (widthLimit === 1) {
        return 1;
    }

    function* generateValidBarArrangements(currentWidth, currentArrangement = []) {
        if (currentArrangement.length === currentWidth - 1) {
            yield currentArrangement;
            return;
        }

        yield* generateValidBarArrangements(currentWidth, currentArrangement.concat(0));

        if (currentArrangement.length === 0 || currentArrangement[currentArrangement.length - 1] === 0) {
            yield* generateValidBarArrangements(currentWidth, currentArrangement.concat(1));
        }
    }

    const rawBarArrangements = Array.from(generateValidBarArrangements(widthLimit));

    const paddedAmidaConfigurations = rawBarArrangements.map(arr => [0, ...arr, 0]);

    const pathCounts = Array(heightLimit + 1).fill(null).map(() => Array(widthLimit).fill(0));

    pathCounts[0][0] = 1;

    for (let currentHeight = 0; currentHeight < heightLimit; currentHeight++) {
        const nextHeightPathCounts = Array(widthLimit).fill(0);

        for (const currentConfig of paddedAmidaConfigurations) {
            for (let prevColumn = 0; prevColumn < widthLimit; prevColumn++) {
                const pathsFromCurrentCell = pathCounts[currentHeight][prevColumn];

                if (pathsFromCurrentCell === 0) {
                    continue;
                }

                if (currentConfig[prevColumn] === 1) {
                    if (prevColumn > 0) {
                        nextHeightPathCounts[prevColumn - 1] = (nextHeightPathCounts[prevColumn - 1] + pathsFromCurrentCell) % moduloValue;
                    }
                } else if (currentConfig[prevColumn + 1] === 1) {
                    if (prevColumn < widthLimit - 1) {
                        nextHeightPathCounts[prevColumn + 1] = (nextHeightPathCounts[prevColumn + 1] + pathsFromCurrentCell) % moduloValue;
                    }
                } else {
                    nextHeightPathCounts[prevColumn] = (nextHeightPathCounts[prevColumn] + pathsFromCurrentCell) % moduloValue;
                }
            }
        }
        pathCounts[currentHeight + 1] = nextHeightPathCounts;
    }

    return pathCounts[heightLimit][targetColumn - 1];
}

if (typeof require !== 'undefined') {
    console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));
}
