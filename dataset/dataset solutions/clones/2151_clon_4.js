const processInputData = (rawData) => {
    const lineSegments = rawData.split('\n');
    const numberStrings = lineSegments[1].split(' ');
    
    const numericValues = numberStrings.filter(Boolean).map(Number);

    const meetsDenialCriteria = (currentValue) => {
        return currentValue % 2 === 0 && (currentValue % 3 !== 0 && currentValue % 5 !== 0);
    };

    const isAnyValueDenied = numericValues.some(meetsDenialCriteria);

    const finalVerdict = isAnyValueDenied ? 'DENIED' : 'APPROVED';

    console.log(finalVerdict);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
