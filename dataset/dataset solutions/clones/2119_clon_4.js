const INCORRECT = -1;

const obtainInput = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const processNumericalConstraints = (inputContent) => {
    const contentLines = inputContent.split('\n');

    const [digitCount, constraintCount] = contentLines.shift().split(' ').map(Number);

    const digitRules = [];
    for (let i = 0; i < constraintCount; i++) {
        const [positionIndex, digitValue] = contentLines.shift().split(' ').map(Number);
        digitRules.push({ index: positionIndex - 1, value: digitValue });
    }

    const establishedDigits = new Map();
    let hasRuleConflict = false;

    for (const rule of digitRules) {
        const { index, value } = rule;
        if (establishedDigits.has(index) && establishedDigits.get(index) !== value) {
            hasRuleConflict = true;
            break;
        }
        establishedDigits.set(index, value);
    }

    if (hasRuleConflict) {
        console.log(INCORRECT);
        return;
    }

    if (establishedDigits.get(0) === 0) {
        console.log(INCORRECT);
        return;
    }
    if (!establishedDigits.has(0)) {
        console.log(INCORRECT);
        return;
    }

    let lowerBound;
    let upperBound;

    if (digitCount === 1) {
        lowerBound = 0;
        upperBound = 9;
    } else {
        lowerBound = Math.pow(10, digitCount - 1);
        upperBound = Math.pow(10, digitCount) - 1;
    }

    for (let currentCandidate = lowerBound; currentCandidate <= upperBound; currentCandidate++) {
        const candidateString = String(currentCandidate);

        if (candidateString.length !== digitCount) {
            continue;
        }

        let isCandidateSatisfactory = true;
        for (const [idx, val] of establishedDigits.entries()) {
            if (parseInt(candidateString[idx], 10) !== val) {
                isCandidateSatisfactory = false;
                break;
            }
        }

        if (isCandidateSatisfactory) {
            console.log(candidateString);
            return;
        }
    }

    console.log(INCORRECT);
};

processNumericalConstraints(obtainInput());
