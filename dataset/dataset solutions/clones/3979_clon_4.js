(function(sourceData) {
    const processedLines = sourceData.trim().split('\n');
    const problemSize = Number(processedLines[0].split(' ')[0]);

    const allCoords = processedLines.slice(1).map((lineSegment, initialIndex) => {
        const coordinateValues = lineSegment.split(' ').map(val => Number(val));
        return {
            xCoord: coordinateValues[0],
            yCoord: coordinateValues[1],
            uniqueId: initialIndex
        };
    });

    const primaryPoints = allCoords.slice(0, problemSize);
    const secondaryPoints = allCoords.slice(problemSize, problemSize * 2);

    secondaryPoints.sort((a, b) => b.xCoord - a.xCoord);
    primaryPoints.sort((a, b) => b.xCoord - a.xCoord);

    let totalSuccessfulPairs = 0;
    const consumedPrimaryIds = new Set();

    for (let currentSecondary of secondaryPoints) {
        let optimalPrimaryY = -1;
        let optimalPrimaryUniqueId = -1;

        for (let currentPrimary of primaryPoints) {
            if (consumedPrimaryIds.has(currentPrimary.uniqueId)) {
                continue;
            }

            if (currentPrimary.xCoord < currentSecondary.xCoord && currentPrimary.yCoord < currentSecondary.yCoord) {
                if (currentPrimary.yCoord > optimalPrimaryY) {
                    optimalPrimaryY = currentPrimary.yCoord;
                    optimalPrimaryUniqueId = currentPrimary.uniqueId;
                }
            }
        }

        if (optimalPrimaryUniqueId !== -1) {
            consumedPrimaryIds.add(optimalPrimaryUniqueId);
            totalSuccessfulPairs++;
        }
    }

    return String(totalSuccessfulPairs);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));