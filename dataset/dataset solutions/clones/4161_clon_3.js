function processInput(rawData) {
    const inputLines = rawData.split("\r\n");
    const commandString = inputLines[0];
    const targetCoordsStr = inputLines[1].split(" ");

    const segments = commandString.split("T");
    const initialXOffset = segments[0].length;

    const targetX = Number(targetCoordsStr[0]);
    const targetY = Number(targetCoordsStr[1]);
    const targetDistances = [Math.abs(targetX - initialXOffset), Math.abs(targetY)];

    const xSegmentLengths = [];
    const ySegmentLengths = [];
    let totalXLength = 0;
    let totalYLength = 0;

    for (let segmentIndex = 1; segmentIndex < segments.length; segmentIndex++) {
        const currentSegmentLength = segments[segmentIndex].length;
        if (segmentIndex % 2 === 0) {
            xSegmentLengths.push(currentSegmentLength);
            totalXLength += currentSegmentLength;
        } else {
            ySegmentLengths.push(currentSegmentLength);
            totalYLength += currentSegmentLength;
        }
    }

    xSegmentLengths.sort((a, b) => a - b);
    ySegmentLengths.sort((a, b) => a - b);

    const checkReachability = (segmentLengthsArr, requiredDistance, totalPossibleDistance) => {
        if (requiredDistance < totalPossibleDistance) {
            const difference = totalPossibleDistance - requiredDistance;
            if (difference % 2 === 1) {
                return false;
            }
            const excessDistanceHalf = difference / 2;
            
            const reachableSums = []; 

            for (let currentSegmentIdx = 0; currentSegmentIdx < segmentLengthsArr.length; currentSegmentIdx++) {
                const currentSegmentVal = segmentLengthsArr[currentSegmentIdx];

                if (currentSegmentVal > excessDistanceHalf) {
                    break; 
                }

                if (currentSegmentVal === excessDistanceHalf) {
                    return true;
                }

                const currentReachableCount = reachableSums.length;
                
                reachableSums.push(currentSegmentVal);

                for (let previousSumIdx = 0; previousSumIdx < currentReachableCount; previousSumIdx++) {
                    const combinedSum = currentSegmentVal + reachableSums[previousSumIdx];
                    if (combinedSum === excessDistanceHalf) {
                        return true;
                    }
                    if (combinedSum < excessDistanceHalf) {
                        reachableSums.push(combinedSum);
                    }
                }
            }
            return false; 
        } else if (requiredDistance === totalPossibleDistance) {
            return true;
        } else {
            return false;
        }
    };

    let finalResult = false;

    if (targetDistances[0] > totalXLength || targetDistances[1] > totalYLength) {
        finalResult = false;
    } else if (targetDistances[0] === totalXLength && targetDistances[1] === totalYLength) {
        finalResult = true;
    } else {
        const canReachX = checkReachability(xSegmentLengths, targetDistances[0], totalXLength);
        const canReachY = checkReachability(ySegmentLengths, targetDistances[1], totalYLength);
        finalResult = canReachX && canReachY;
    }

    console.log(finalResult ? "Yes" : "No");
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
