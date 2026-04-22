function ProcessData(incomingInformation) {
    const numericStrings = incomingInformation.trim().split(' ');
    const upperLimit = Number(numericStrings[0]);
    const modulusValue = Number(numericStrings[1]);

    let cumulativeSum = 0;

    const multiplesCount = Math.floor(upperLimit / modulusValue);
    cumulativeSum += Math.pow(multiplesCount, 3);

    if (modulusValue % 2 === 0) {
        const halfModulus = modulusValue / 2;
        
        let halfRemainderCount = 0;
        if (upperLimit >= halfModulus) {
            halfRemainderCount = Math.floor((upperLimit - halfModulus) / modulusValue) + 1;
        }
        
        cumulativeSum += Math.pow(halfRemainderCount, 3);
    }

    console.log(cumulativeSum);
}

ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));