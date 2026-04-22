'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf8');

const processInputAndCalculate = (sourcePayload) => {
    const dataLines = sourcePayload.split('\n');
    const totalPositions = Number(dataLines[0]);
    const elevationValues = dataLines[1].split(' ').map(Number);

    const memoizedJumps = new Map();

    const computeJumpCost = (currentPosition) => {
        if (memoizedJumps.has(currentPosition)) {
            return memoizedJumps.get(currentPosition);
        }

        let costForCurrentPosition;
        switch (currentPosition) {
            case 0:
                costForCurrentPosition = 0;
                break;
            case 1:
                costForCurrentPosition = Math.abs(elevationValues[0] - elevationValues[1]);
                break;
            default:
                const costFromPreviousStep = computeJumpCost(currentPosition - 1) + Math.abs(elevationValues[currentPosition] - elevationValues[currentPosition - 1]);
                const costFromTwoStepsBack = computeJumpCost(currentPosition - 2) + Math.abs(elevationValues[currentPosition] - elevationValues[currentPosition - 2]);
                costForCurrentPosition = Math.min(costFromPreviousStep, costFromTwoStepsBack);
                break;
        }

        memoizedJumps.set(currentPosition, costForCurrentPosition);
        return costForCurrentPosition;
    };

    for (let k = 0; k < totalPositions; k++) {
        computeJumpCost(k);
    }
    
    const jumpPathResults = Array.from({ length: totalPositions }, (_, idx) => memoizedJumps.get(idx));

    console.log(jumpPathResults, memoizedJumps.get(totalPositions - 1));
};

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8").trim());