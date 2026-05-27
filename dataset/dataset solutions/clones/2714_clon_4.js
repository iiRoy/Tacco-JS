function processSequence(rawData) {
    const lines = rawData.split("\n");
    const primaryString = lines[0];
    const patternString = lines[1];

    const primaryLength = primaryString.length;
    const patternLength = patternString.length;

    const checkPatternAt = (startIndex) => {
        for (let k = 0; k < patternLength; k++) {
            if (primaryString[(startIndex + k) % primaryLength] !== patternString[k]) {
                return false;
            }
        }
        return true;
    };

    const validStartingPoints = new Set();
    for (let i = 0; i < primaryLength; i++) {
        if (checkPatternAt(i)) {
            validStartingPoints.add(i);
        }
    }

    let overallMaximumChain = 0;
    let hasInfinitePath = false;

    const pathLengthCache = new Map();

    const tracePath = (currentPosition, visitedInCurrentTrace) => {
        if (pathLengthCache.has(currentPosition)) {
            const [cachedLength, cachedIsInfinite] = pathLengthCache.get(currentPosition);
            if (cachedIsInfinite) return { length: Infinity, isInfinite: true };
            return { length: cachedLength, isInfinite: false };
        }

        if (!validStartingPoints.has(currentPosition)) {
            return { length: 0, isInfinite: false };
        }

        if (visitedInCurrentTrace.has(currentPosition)) {
            return { length: Infinity, isInfinite: true };
        }

        visitedInCurrentTrace.add(currentPosition);

        const nextPosition = (currentPosition + patternLength) % primaryLength;
        const result = tracePath(nextPosition, visitedInCurrentTrace);

        visitedInCurrentTrace.delete(currentPosition);

        if (result.isInfinite) {
            pathLengthCache.set(currentPosition, [Infinity, true]);
            return { length: Infinity, isInfinite: true };
        } else {
            const currentPathLength = 1 + result.length;
            pathLengthCache.set(currentPosition, [currentPathLength, false]);
            return { length: currentPathLength, isInfinite: false };
        }
    };

    for (let i = 0; i < primaryLength; i++) {
        if (hasInfinitePath) break;

        if (validStartingPoints.has(i) && !pathLengthCache.has(i)) {
            const currentTraceResult = tracePath(i, new Set());
            if (currentTraceResult.isInfinite) {
                hasInfinitePath = true;
                overallMaximumChain = -1;
            } else {
                overallMaximumChain = Math.max(overallMaximumChain, currentTraceResult.length);
            }
        } else if (!validStartingPoints.has(i)) {
            pathLengthCache.set(i, [0, false]);
        }
    }

    console.log(overallMaximumChain);
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
