function processRangeCheck(rawData) {
    const [lowerBound, upperBound, targetValue] = rawData.split(' ').map(Number);

    const outcomeMap = {
        true: 'Yes',
        false: 'No'
    };

    const conditionMet = (lowerBound <= targetValue && targetValue <= upperBound);
    console.log(outcomeMap[conditionMet]);
}

processRangeCheck(require('fs').readFileSync('/dev/stdin', 'utf8'));
