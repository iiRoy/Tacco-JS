function Main(inputData) {
    const lines = inputData.split("\r\n");
    const movementPattern = lines[0];
    const targetCoordsStr = lines[1].split(" ");

    const targetXCoord = Number(targetCoordsStr[0]);
    const targetYCoord = Number(targetCoordsStr[1]);

    const pathParts = movementPattern.split("T");
    const initialForwardDistance = pathParts[0].length;

    const { xSegments, ySegments, totalXDistance, totalYDistance } = pathParts.slice(1).reduce((accumulator, segmentPart, index) => {
        const segmentLength = segmentPart.length;
        if (segmentLength === 0) return accumulator;

        if ((index + 1) % 2 !== 0) {
            accumulator.ySegments.push(segmentLength);
            accumulator.totalYDistance += segmentLength;
        } else {
            accumulator.xSegments.push(segmentLength);
            accumulator.totalXDistance += segmentLength;
        }
        return accumulator;
    }, { xSegments: [], ySegments: [], totalXDistance: 0, totalYDistance: 0 });

    const effectiveXTarget = targetXCoord - initialForwardDistance;
    const effectiveYTarget = targetYCoord;

    const checkAttainability = (availableSegments, desiredDisplacement, totalSegmentSum) => {
        if (Math.abs(desiredDisplacement) > totalSegmentSum) {
            return false;
        }

        if ((totalSegmentSum - Math.abs(desiredDisplacement)) % 2 !== 0) {
            return false;
        }

        if (Math.abs(desiredDisplacement) === totalSegmentSum) {
            return true;
        }

        const requiredFlipSum = (totalSegmentSum - Math.abs(desiredDisplacement)) / 2;

        const reachableSums = new Set([0]);

        for (const segmentValue of availableSegments) {
            const newlyFormedSums = new Set();
            for (const existingSum of reachableSums) {
                const potentialNewSum = existingSum + segmentValue;
                if (potentialNewSum <= requiredFlipSum) {
                    newlyFormedSums.add(potentialNewSum);
                }
            }
            for (const sumToAdd of newlyFormedSums) {
                reachableSums.add(sumToAdd);
            }
            if (reachableSums.has(requiredFlipSum)) {
                return true;
            }
        }

        return reachableSums.has(requiredFlipSum);
    };

    const canReachX = checkAttainability(xSegments, effectiveXTarget, totalXDistance);
    const canReachY = checkAttainability(ySegments, effectiveYTarget, totalYDistance);

    if (canReachX && canReachY) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
