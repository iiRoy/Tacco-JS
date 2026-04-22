let storageUnit = '';
process.stdin.on('data', part => {
    storageUnit += part;
});

process.stdin.on('end', () => {
    const dataLines = storageUnit.split('\n');

    const firstNumericalSequence = dataLines[0].split(' ').map(Number);
    const pathTotalLength = firstNumericalSequence[0];
    const firstRunnerStart = firstNumericalSequence[1];
    const secondRunnerStart = firstNumericalSequence[2];
    const firstRunnerTarget = firstNumericalSequence[3];
    const secondRunnerTarget = firstNumericalSequence[4];

    const pathCharacters = dataLines[1];

    const getPathSegment = (zeroIndex) => {
        if (zeroIndex < 0 || zeroIndex >= pathCharacters.length) {
            return null;
        }
        return pathCharacters[zeroIndex];
    };

    const determineCollisionRisk = (runner1Origin, runner1Goal, runner2Goal, layoutString) => {
        const maximumRelevantPoint = Math.max(runner1Goal, runner2Goal); // 1-indexed
        for (let currentZeroIndex = 0; currentZeroIndex < layoutString.length - 1; ++currentZeroIndex) {
            if (layoutString[currentZeroIndex] === '#' && layoutString[currentZeroIndex + 1] === '#') {
                if ((runner1Origin <= (currentZeroIndex + 1)) && ((currentZeroIndex + 2) <= maximumRelevantPoint)) {
                    return true;
                }
            }
        }
        return false;
    };

    const assessManeuverability = (runner2Origin, runner2Goal, layoutString) => {
        for (let currentZeroIndex = 0; currentZeroIndex < layoutString.length - 2; ++currentZeroIndex) {
            if (layoutString[currentZeroIndex] === '.' && layoutString[currentZeroIndex + 1] === '.' && layoutString[currentZeroIndex + 2] === '.') {
                if ((runner2Origin <= (currentZeroIndex + 1)) && (((currentZeroIndex + 3) <= runner2Goal) || ((currentZeroIndex + 2) === runner2Goal))) {
                    return true;
                }
            }
        }
        return false;
    };

    const isZoneObstructed = (oneBasedPoint, layoutString) => {
        const charBeforePoint = getPathSegment(oneBasedPoint - 2);
        const charAfterPoint = getPathSegment(oneBasedPoint);

        return (charBeforePoint === '#') || (charAfterPoint === '#');
    };

    if (determineCollisionRisk(firstRunnerStart, firstRunnerTarget, secondRunnerTarget, pathCharacters)) {
        console.log("No");
        return;
    }

    const secondRunnerCanBypass = assessManeuverability(secondRunnerStart, secondRunnerTarget, pathCharacters);

    if (secondRunnerTarget < firstRunnerTarget) {
        if (!secondRunnerCanBypass &&
            isZoneObstructed(secondRunnerTarget, pathCharacters) &&
            isZoneObstructed(secondRunnerStart, pathCharacters)) {
            console.log("No");
            return;
        }
    }

    console.log("Yes");
});