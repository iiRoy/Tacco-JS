function processInputAndCheck(sourceMaterial) {
    const lines = sourceMaterial.trim().split("\n");
    if (lines.length < 2) {
        return "No";
    }

    const firstSequence = lines[0];
    const secondSequence = lines[1];

    if (firstSequence.length !== secondSequence.length) {
        return "No";
    }

    const forwardMapping = new Map();
    const backwardMapping = new Map();

    for (let k = 0; k < firstSequence.length; k++) {
        const charA = firstSequence[k];
        const charB = secondSequence[k];

        if (forwardMapping.has(charA)) {
            if (forwardMapping.get(charA) !== charB) {
                return "No";
            }
        } else {
            forwardMapping.set(charA, charB);
        }

        if (backwardMapping.has(charB)) {
            if (backwardMapping.get(charB) !== charA) {
                return "No";
            }
        } else {
            backwardMapping.set(charB, charA);
        }
    }

    return "Yes";
}

function entryPoint(dataBlock) {
    const outcome = processInputAndCheck(dataBlock);
    console.log(outcome);
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));