const entityCharacteristic = (lvl, childCount, isFinalSegment) => ({
    l: lvl, 
    k: childCount, 
    f: isFinalSegment 
});

const locateBranchOrigin = (segmentCollection) => {
    return segmentCollection.find(segment => !segment.f && segment.k < 2);
};

const constructPathSegments = (originLevel, destinationLevel) => {
    const path = [];
    for (let j = originLevel + 1; j <= destinationLevel; j++) {
        path.push(entityCharacteristic(j, 0, (j === destinationLevel)));
    }
    return path;
};

const integrateBranch = (currentSegments, targetLevel) => {
    const originSegment = locateBranchOrigin(currentSegments);

    if (!originSegment) {
        return null;
    }

    const updatedOrigin = { ...originSegment, k: originSegment.k + 1 };

    const newPathSegments = constructPathSegments(originSegment.l, targetLevel);

    const nextSegmentState = currentSegments
        .map(seg => (seg === originSegment ? updatedOrigin : seg))
        .concat(newPathSegments);

    nextSegmentState.sort((segA, segB) => segA.l - segB.l);

    return nextSegmentState;
};

const initiateAssembly = (inputData) => {
    const dataLines = inputData.split("\n");
    const countN = parseInt(dataLines[0], 10);
    const levelRequirements = dataLines[1].split(" ").map(Number);

    if (levelRequirements[0] !== 0) {
        return -1;
    }

    let currentSystemSegments = [entityCharacteristic(0, 0, false)];

    for (let i = 1; i <= countN; i++) {
        const branchesNeeded = levelRequirements[i];

        for (let j = 0; j < branchesNeeded; j++) {
            const nextSystemSegments = integrateBranch(currentSystemSegments, i);
            if (nextSystemSegments === null) {
                return -1;
            }
            currentSystemSegments = nextSystemSegments;
        }
    }

    return currentSystemSegments.length;
};

console.log(initiateAssembly(require("fs").readFileSync("/dev/stdin", "utf8")));