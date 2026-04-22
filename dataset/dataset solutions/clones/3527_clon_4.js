const processConflictAssessment = (dataPayload) => {
    const dataSegments = dataPayload.split('\n');

    const [_, __, initialLowerBound, initialUpperBound] = dataSegments[0].split(' ').map(Number);

    const territoryALimits = dataSegments[1].split(' ').map(Number);

    const territoryBLimits = dataSegments[2].split(' ').map(Number);

    const ultimateLowerBound = Math.max(initialLowerBound, ...territoryALimits);

    const ultimateUpperBound = Math.min(initialUpperBound, ...territoryBLimits);

    const conflictResult = ultimateUpperBound <= ultimateLowerBound ? 'War' : 'No War';

    console.log(conflictResult);
};

processConflictAssessment(require("fs").readFileSync("/dev/stdin", "utf8"));