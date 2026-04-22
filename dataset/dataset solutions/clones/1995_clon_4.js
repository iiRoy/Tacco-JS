const initiateProcess = (dataSource) => {
    const parsedSegments = dataSource.trim().split('\n');
    const initialParameters = parsedSegments[0].split(' ').map(Number);

    const firstOperand = initialParameters[0];
    const secondOperand = initialParameters[1];

    const upperLimit = Math.pow(secondOperand, firstOperand + 1);

    console.log(upperLimit);

    const modulusDivisor = 10000000007;

    const totientValues = new Array(upperLimit + 1);
    for (let currentVal = 0; currentVal <= upperLimit; currentVal++) {
        totientValues[currentVal] = currentVal;
    }

    for (let primeCandidate = 2; primeCandidate <= upperLimit; primeCandidate++) {
        if (totientValues[primeCandidate] === primeCandidate) {
            for (let multiple = primeCandidate; multiple <= upperLimit; multiple += primeCandidate) {
                totientValues[multiple] -= Math.floor(totientValues[multiple] / primeCandidate);
            }
        }
    }

    let cumulativeSum = 0;
    for (let iterator = 1; iterator <= upperLimit; iterator++) {
        const quotientFloor = Math.floor(upperLimit / iterator);
        cumulativeSum += totientValues[iterator] * quotientFloor * quotientFloor * quotientFloor;
    }

    console.log(cumulativeSum / modulusDivisor);
};

initiateProcess(require('node:fs').readFileSync('/dev/stdin', 'utf8'));