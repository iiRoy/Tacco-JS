const costMap = new Map([
    ["1to2", 300], ["1to3", 500], ["1to4", 600], ["1to5", 700], ["1to6", 1350], ["1to7", 1650],
    ["2to1", 6], ["2to3", 350], ["2to4", 450], ["2to5", 600], ["2to6", 1150], ["2to7", 1500],
    ["3to1", 13], ["3to2", 7], ["3to4", 250], ["3to5", 400], ["3to6", 1000], ["3to7", 1350],
    ["4to1", 18], ["4to2", 12], ["4to3", 5], ["4to5", 250], ["4to6", 850], ["4to7", 1300],
    ["5to1", 23], ["5to2", 17], ["5to3", 10], ["5to4", 5], ["5to6", 600], ["5to7", 1150],
    ["6to1", 43], ["6to2", 37], ["6to3", 30], ["6to4", 25], ["6to5", 20], ["6to7", 500],
    ["7to1", 58], ["7to2", 52], ["7to3", 45], ["7to4", 40], ["7to5", 35], ["7to6", 15]
]);

const rawInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trimEnd().split('\n');

function* blockIterator(lines) {
    let currentLineIndex = 0;
    while (currentLineIndex < lines.length) {
        const sourceIdentifier = Number(lines[currentLineIndex++]);
        if (sourceIdentifier === 0) {
            return;
        }
        const startHourMinute = lines[currentLineIndex++].split(' ').map(Number);
        const destinationIdentifier = Number(lines[currentLineIndex++]);
        const endHourMinute = lines[currentLineIndex++].split(' ').map(Number);

        yield {
            source: sourceIdentifier,
            start: startHourMinute,
            destination: destinationIdentifier,
            end: endHourMinute
        };
    }
}

const convertToTotalMinutes = ([hour, minute]) => (hour * 60) + minute;

const isWithinRestrictedPeriod = (timeInMinutes) => timeInMinutes >= 1050 && timeInMinutes <= 1170;

const calculateAdjustedValue = (initialValue) => {
    const reducedValue = Math.floor(initialValue / 2);
    return Math.ceil(reducedValue / 50) * 50;
};

for (const currentBlock of blockIterator(rawInputLines)) {
    const { source, start, destination, end } = currentBlock;

    const startTotalMinutes = convertToTotalMinutes(start);
    const endTotalMinutes = convertToTotalMinutes(end);

    const conditionFlags = [
        isWithinRestrictedPeriod(startTotalMinutes) || isWithinRestrictedPeriod(endTotalMinutes),
        costMap.get(`${destination}to${source}`) <= 40
    ];

    const metConditionCount = conditionFlags.filter(Boolean).length;

    let finalCalculatedValue = costMap.get(`${source}to${destination}`);

    if (metConditionCount === 2) {
        finalCalculatedValue = calculateAdjustedValue(finalCalculatedValue);
    }
    console.log(finalCalculatedValue);
}
