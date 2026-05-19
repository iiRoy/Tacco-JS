process.stdin.resume();
process.stdin.setEncoding('utf8');

const parseNumericValue = (inputString) => {
    return Number(inputString);
};

process.stdin.on('data', function (inputSegment) {
    const dataParts = inputSegment.split(' ');

    const valueOne = parseNumericValue(dataParts[0]);
    const valueTwo = parseNumericValue(dataParts[1]);
    const valueThree = parseNumericValue(dataParts[2]);

    let isConditionMet = false;

    if (valueOne < valueTwo) {
        if (valueTwo < valueThree) {
            isConditionMet = true;
        }
    }

    if (isConditionMet) {
        console.log('Yes');
    } else {
        console.log('No');
    }
});
