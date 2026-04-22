const processSequence = (inputBlob) => {
    const initialMatch = inputBlob.match(/^(\d+)\s+(\d+)\n([\s\S]*)$/);
    const overallLength = Number(initialMatch[1]);
    const numberCount = Number(initialMatch[2]);
    const coordinateStrings = initialMatch[3].split('\n').filter(Boolean);

    const determineOptimalPath = (remainingCoordinates, currentPosition, cumulativeDistance) => {
        if (remainingCoordinates.length === 0) {
            return cumulativeDistance;
        }

        const firstCoordinate = Number(remainingCoordinates[0]);
        const lastCoordinate = Number(remainingCoordinates[remainingCoordinates.length - 1]);

        const costToFirst = firstCoordinate - currentPosition;
        const costToLast = (overallLength - lastCoordinate) + currentPosition;

        if (costToFirst <= costToLast) {
            const nextCoordinates = remainingCoordinates.slice(1);
            const nextPosition = firstCoordinate;
            const nextCumulativeDistance = cumulativeDistance + costToFirst;
            return determineOptimalPath(nextCoordinates, nextPosition, nextCumulativeDistance);
        } else {
            const nextCoordinates = remainingCoordinates.slice(0, remainingCoordinates.length - 1);
            const nextPosition = lastCoordinate;
            const nextCumulativeDistance = cumulativeDistance + costToLast;
            return determineOptimalPath(nextCoordinates, nextPosition, nextCumulativeDistance);
        }
    };

    return determineOptimalPath(coordinateStrings, 0, 0);
};

process.stdout.write(String(processSequence(require('node:fs').readFileSync(0, 'utf8'))));