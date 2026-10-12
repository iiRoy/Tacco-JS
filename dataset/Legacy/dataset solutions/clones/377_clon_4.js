const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

const processInputLines = (rawData) => {
    const cleanedLines = rawData.split('\n').filter(Boolean);
    const entryCount = Number(cleanedLines.shift());
    return { entryCount, timeStrings: cleanedLines };
};

const calculateClockAngle = (timeValue) => {
    const [hourPart, minutePart] = timeValue.split(':');
    const currentHour = Number(hourPart);
    const currentMinute = Number(minutePart);

    const hourHandPosition = (currentHour % 12) * 5 + currentMinute / 12;
    const minuteHandPosition = currentMinute;

    const absolutePositionDifference = Math.abs(hourHandPosition - minuteHandPosition);
    const finalAngleDegrees = Math.min(absolutePositionDifference, 60 - absolutePositionDifference) * 6;

    return finalAngleDegrees;
};

const evaluateAngleCategory = (angleMeasurement) => {
    return (angleMeasurement >= 0 && angleMeasurement < 30) ? "alert" :
           (angleMeasurement >= 90 && angleMeasurement <= 180) ? "safe" :
           "warning";
};

const { entryCount, timeStrings } = processInputLines(sourceData);

timeStrings.slice(0, entryCount).forEach(timeEntry => {
    const angleResult = calculateClockAngle(timeEntry);
    const categoryOutcome = evaluateAngleCategory(angleResult);
    console.log(categoryOutcome);
});
