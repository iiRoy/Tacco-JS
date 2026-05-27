const processInputData = (rawData) => {
    const numberStrings = rawData.trim().split(' ');

    const accumulatedSum = numberStrings.reduce((currentTotal, strNum) => {
        return currentTotal + Number.parseInt(strNum, 10);
    }, 0);

    const divisibilityStatus = accumulatedSum % 3 === 0;

    const responseMap = {
        true: 'Possible',
        false: 'Impossible'
    };

    console.log(responseMap[divisibilityStatus]);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
