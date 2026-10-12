function processInputData(rawData) {
    const inputLines = rawData.split(/\r?\n/);
    const commandString = inputLines[0];
    const targetCoordsStr = inputLines[1].split(" ");

    const targetXCoordinate = Number(targetCoordsStr[0]);
    const targetYCoordinate = Number(targetCoordsStr[1]);

    const moveSegments = commandString.split("T");
    const initialXOffset = moveSegments[0].length;

    const targetDisplacements = [
        Math.abs(targetXCoordinate - initialXOffset),
        Math.abs(targetYCoordinate)
    ];

    const xMoveLengths = [];
    const yMoveLengths = [];
    let totalXLength = 0;
    let totalYLength = 0;

    moveSegments.slice(1).forEach((segment, segmentIndex) => {
        const currentSegmentLength = segment.length;
        if ((segmentIndex + 1) % 2 === 0) {
            xMoveLengths.push(currentSegmentLength);
            totalXLength += currentSegmentLength;
        } else {
            yMoveLengths.push(currentSegmentLength);
            totalYLength += currentSegmentLength;
        }
    });

    xMoveLengths.sort((a, b) => a - b);
    yMoveLengths.sort((a, b) => a - b);

    const checkReachability = (segmentLengths, requiredDistance, totalPossibleDistance) => {
        if (requiredDistance > totalPossibleDistance) {
            return false;
        }

        if (requiredDistance === totalPossibleDistance) {
            return true;
        }

        const requiredBacktrackAmount = totalPossibleDistance - requiredDistance;
        if (requiredBacktrackAmount % 2 !== 0) {
            return false;
        }
        const targetBacktrackSum = requiredBacktrackAmount / 2;

        let currentReachableSums = new Set([0]);

        for (const len of segmentLengths) {
            const nextReachableSums = new Set(currentReachableSums);
            for (const prevSum of currentReachableSums) {
                const newSum = prevSum + len;
                if (newSum <= targetBacktrackSum) {
                    nextReachableSums.add(newSum);
                }
            }
            currentReachableSums = nextReachableSums;
            if (currentReachableSums.has(targetBacktrackSum)) {
                return true;
            }
        }
        return currentReachableSums.has(targetBacktrackSum);
    };

    const targetXDisplacement = targetDisplacements[0];
    const targetYDisplacement = targetDisplacements[1];

    let isPossibleToReach = false;

    if (targetXDisplacement > totalXLength || targetYDisplacement > totalYLength) {
        isPossibleToReach = false;
    } else if (targetXDisplacement === totalXLength && targetYDisplacement === totalYLength) {
        isPossibleToReach = true;
    } else {
        const canReachX = checkReachability(xMoveLengths, targetXDisplacement, totalXLength);
        const canReachY = checkReachability(yMoveLengths, targetYDisplacement, totalYLength);
        isPossibleToReach = canReachX && canReachY;
    }

    if (isPossibleToReach) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
