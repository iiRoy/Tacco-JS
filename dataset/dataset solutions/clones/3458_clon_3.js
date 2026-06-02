function calculateAmidaPaths(rawInputString) {
    const parsedInputs = rawInputString.split(" ");
    const numericInputs = parsedInputs.map(str => parseInt(str, 10));

    const gridHeight = numericInputs[0];
    const gridWidth = numericInputs[1];
    const targetPosition = numericInputs[2];

    const moduloConstant = 1000000007;

    if (gridWidth === 1) {
        return 1;
    }

    const hasAdjacentBars = (binaryConfig) => /11/.test(binaryConfig);

    const padToWidthMinusOne = (binaryConfig, width) => {
        const requiredLength = width - 1;
        return '0'.repeat(Math.max(0, requiredLength - binaryConfig.length)) + binaryConfig;
    };

    const addBoundaryZeros = (binaryConfig) => `0${binaryConfig}0`;

    const maxConfigurations = 1 << (gridWidth - 1);
    const rawBinaryStrings = Array.from({ length: maxConfigurations }, (_, index) => index.toString(2));

    const permissibleBarConfigurations = rawBinaryStrings
        .filter(config => !hasAdjacentBars(config))
        .map(config => padToWidthMinusOne(config, gridWidth))
        .map(addBoundaryZeros);

    const pathwayCounts = Array.from({ length: gridHeight + 1 }, () => Array(gridWidth).fill(0));
    pathwayCounts[0][0] = 1;

    for (let currentLevel = 1; currentLevel <= gridHeight; currentLevel++) {
        permissibleBarConfigurations.forEach(configPattern => {
            for (let currentColumn = 0; currentColumn < gridWidth; currentColumn++) {
                const barArrangement = configPattern[currentColumn] + configPattern[currentColumn + 1];
                let pathsFromPreviousLevel = 0;

                if (barArrangement === "10") {
                    pathsFromPreviousLevel = pathwayCounts[currentLevel - 1][currentColumn - 1];
                } else if (barArrangement === "01") {
                    pathsFromPreviousLevel = pathwayCounts[currentLevel - 1][currentColumn + 1];
                } else {
                    pathsFromPreviousLevel = pathwayCounts[currentLevel - 1][currentColumn];
                }
                
                pathwayCounts[currentLevel][currentColumn] = (pathwayCounts[currentLevel][currentColumn] + pathsFromPreviousLevel) % moduloConstant;
            }
        });
    }

    return pathwayCounts[gridHeight][targetPosition - 1];
}

if (typeof require !== 'undefined') {
    console.log(calculateAmidaPaths(require("fs").readFileSync("/dev/stdin", "utf8")));
}
