const fileSystemAccess = require('fs');
const rawDataStream = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');

const processedSegments = rawDataStream.replace(/\n$/, "").split('\n');
// Replicates `Arr.shift()-0` behavior: `"" - 0` results in `0`.
const numberOfEntries = +processedSegments.shift();

const decisionMatrix = [
    { condition: (angularDelta) => angularDelta < 30, result: "alert" },
    { condition: (angularDelta) => angularDelta >= 90 && angularDelta <= 180, result: "safe" },
    { condition: (angularDelta) => true, result: "warning" } // Default outcome
];

const computedResults = processedSegments.slice(0, numberOfEntries).map(timeExpression => {
    const [hourPart, minutePart] = timeExpression.split(':');
    const hourValue = parseInt(hourPart, 10);
    const minuteValue = parseInt(minutePart, 10);

    const hourHandPosition = (hourValue % 12) * 30 + minuteValue * 0.5;
    const minuteHandPosition = minuteValue * 6;

    const absoluteAngleDifference = Math.abs(hourHandPosition - minuteHandPosition);

    const applicableRule = decisionMatrix.find(rule => rule.condition(absoluteAngleDifference));
    return applicableRule.result;
});

computedResults.forEach(finalVerdict => console.log(finalVerdict));
