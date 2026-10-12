function processSequenceData(rawInputData) {
    'use strict';

    const targetLength = parseInt(rawInputData.split("\n")[0]);
    const allowedBases = ["A", "T", "G", "C"];
    const modulusValue = 1000000007;

    let currentValidStates = {};
    let zeroCountTemplate = {};

    const isForbiddenTriplet = (sequenceFragment) => {
        return sequenceFragment.includes("ACG") || sequenceFragment.includes("AGC") || sequenceFragment.includes("GAC");
    };

    const hasForbiddenSubsequence = (candidateFourCharSeq) => {
        const s0 = candidateFourCharSeq[0];
        const s1 = candidateFourCharSeq[1];
        const s2 = candidateFourCharSeq[2];
        const s3 = candidateFourCharSeq[3];

        if (isForbiddenTriplet(candidateFourCharSeq.substring(0, 3))) return true;
        if (isForbiddenTriplet(candidateFourCharSeq.substring(1, 4))) return true;

        if (s0 === 'A' && s1 === 'G' && s3 === 'C') return true;
        if (s0 === 'A' && s2 === 'G' && s3 === 'C') return true;

        return false;
    };

    const buildInitialValidStates = (startPrefix) => {
        const generationQueue = [startPrefix];
        while (generationQueue.length > 0) {
            const currentPrefix = generationQueue.shift();
            if (currentPrefix.length < 3) {
                for (const nextBase of allowedBases) {
                    generationQueue.push(currentPrefix + nextBase);
                }
            } else {
                if (!isForbiddenTriplet(currentPrefix)) {
                    currentValidStates[currentPrefix] = 1;
                    zeroCountTemplate[currentPrefix] = 0;
                }
            }
        }
    };

    buildInitialValidStates("");

    if (targetLength === 3) {
        console.log(Object.keys(currentValidStates).length);
    } else {
        for (let iteration = 0; iteration < targetLength - 3; iteration++) {
            const nextValidStates = Object.assign({}, zeroCountTemplate);

            for (const stateKey of Object.keys(currentValidStates)) {
                const stateCount = currentValidStates[stateKey];
                const currentCountModulo = stateCount % modulusValue;

                for (const nextBase of allowedBases) {
                    const candidateSequence = stateKey + nextBase;
                    const lastThreeChars = candidateSequence.slice(-3);

                    if (!hasForbiddenSubsequence(candidateSequence)) {
                        nextValidStates[lastThreeChars] = (nextValidStates[lastThreeChars] + currentCountModulo) % modulusValue;
                    }
                }
            }
            currentValidStates = nextValidStates;
        }

        let finalSum = 0;
        for (const sequenceIdentifier of Object.keys(currentValidStates)) {
            finalSum = (finalSum + currentValidStates[sequenceIdentifier]) % modulusValue;
        }
        console.log(finalSum);
    }
}

processSequenceData(require("fs").readFileSync("/dev/stdin", "utf8"));
