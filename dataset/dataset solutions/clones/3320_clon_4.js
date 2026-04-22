const processInputData = (rawData) => {
    const dataSegments = rawData.split('\n');

    const [gridRows, gridCols] = dataSegments
        .shift()
        .split(' ')
        .map(Number);

    const terrainMap = dataSegments
        .slice(0, gridRows)
        .map(segment => Array.from(segment));

    const moduloValue = 1000000007;

    const pathAccumulator = Array.from({ length: gridRows }, () =>
        Array.from({ length: gridCols }, () => -1)
    );

    const calculatePathsFromOrigin = (currentR, currentC) => {
        if (currentR < 0 || currentC < 0) {
            return 0;
        }

        if (currentR === 0 && currentC === 0) {
            return 1;
        }

        if (pathAccumulator[currentR][currentC] !== -1) {
            return pathAccumulator[currentR][currentC];
        }

        let waysToReach = 0;

        if (currentR > 0 && terrainMap[currentR - 1][currentC] !== '#') {
            waysToReach = (waysToReach + calculatePathsFromOrigin(currentR - 1, currentC)) % moduloValue;
        }

        if (currentC > 0 && terrainMap[currentR][currentC - 1] !== '#') {
            waysToReach = (waysToReach + calculatePathsFromOrigin(currentR, currentC - 1)) % moduloValue;
        }

        pathAccumulator[currentR][currentC] = waysToReach;
        return waysToReach;
    };

    const finalOutcome = calculatePathsFromOrigin(gridRows - 1, gridCols - 1);

    console.log(finalOutcome);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));