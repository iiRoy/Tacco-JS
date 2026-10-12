const createBranchPoint = (levelValue, firstChildRef = null, nextSiblingRef = null, canBeExtended = true) => ({
    lvl: levelValue,
    fch: firstChildRef,
    nsb: nextSiblingRef,
    ext: canBeExtended
});

const allBranchPoints = new Set();

const extendPath = (originBranchPoint, targetLevel) => {
    let currentLinkTarget = originBranchPoint;
    let lastCreatedBranchPoint = null;

    const linkAsSiblingFromOrigin = (originBranchPoint.fch !== null);

    for (let currentPathLevel = originBranchPoint.lvl + 1; currentPathLevel <= targetLevel; currentPathLevel++) {
        const newBranchPoint = createBranchPoint(currentPathLevel, null, null, true);
        allBranchPoints.add(newBranchPoint);

        if (currentPathLevel === originBranchPoint.lvl + 1) {
            if (linkAsSiblingFromOrigin) {
                originBranchPoint.nsb = newBranchPoint;
            } else {
                originBranchPoint.fch = newBranchPoint;
            }
        } else {
            currentLinkTarget.nsb = newBranchPoint;
        }
        currentLinkTarget = newBranchPoint;
        lastCreatedBranchPoint = newBranchPoint;
    }

    if (lastCreatedBranchPoint) {
        lastCreatedBranchPoint.ext = false;
    }
};

const tryExtendBranch = (targetLevel) => {
    const sortedBranchPoints = Array.from(allBranchPoints).sort((bpA, bpB) => bpA.lvl - bpB.lvl);

    for (const candidateBranchPoint of sortedBranchPoints) {
        if (!candidateBranchPoint.ext) {
            continue;
        }
        if (candidateBranchPoint.fch && candidateBranchPoint.nsb) {
            continue;
        }

        extendPath(candidateBranchPoint, targetLevel);
        return true;
    }
    return false;
};

function ProcessInput(rawInput) {
    const inputLines = rawInput.split("\n");
    const totalLevels = parseInt(inputLines[0], 10);
    const levelCounts = inputLines[1].split(" ").map(val => parseInt(val, 10));

    if (levelCounts[0] !== 0) {
        console.log(-1);
        return;
    }

    const initialBranchPoint = createBranchPoint(0, null, null, true);
    allBranchPoints.add(initialBranchPoint);

    for (let currentLevel = 1; currentLevel <= totalLevels; currentLevel++) {
        for (let count = 0; count < levelCounts[currentLevel]; count++) {
            const extensionSuccessful = tryExtendBranch(currentLevel);
            if (!extensionSuccessful) {
                console.log(-1);
                return;
            }
        }
    }

    console.log(allBranchPoints.size);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
