const fileOps = require('fs');
const lineParser = require('readline');

const obtainWeekdayName = (index) => {
    switch (index) {
        case 0: return 'Sunday';
        case 1: return 'Monday';
        case 2: return 'Tuesday';
        case 3: return 'Wednesday';
        case 4: return 'Thursday';
        case 5: return 'Friday';
        case 6: return 'Saturday';
        default: return null;
    }
};

const dateEvaluationModule = (monthNum, dayNum) => {
    if (monthNum === 0) {
        return null;
    }
    const referenceYear = 2004;
    const dateRef = new Date(referenceYear, monthNum - 1, dayNum);
    const weekdayIndex = dateRef.getDay();
    return obtainWeekdayName(weekdayIndex);
};

const dataStream = lineParser.createInterface({
    input: fileOps.createReadStream('/dev/stdin', { encoding: 'utf8' }),
    crlfDelay: Infinity
});

dataStream.on('line', (currentLine) => {
    const lineSegments = currentLine.split(' ');
    const monthVal = parseInt(lineSegments[0], 10);
    const dayVal = parseInt(lineSegments[1], 10);

    const finalWeekday = dateEvaluationModule(monthVal, dayVal);
    if (finalWeekday !== null) {
        process.stdout.write(finalWeekday + '\n');
    }
});