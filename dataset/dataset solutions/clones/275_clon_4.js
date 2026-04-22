const eraRegistry = [
    { historicalDesignation: 'heisei', periodCommencement: new Date(1989, 0, 7), yearOffsetValue: 1988 },
    { historicalDesignation: 'showa', periodCommencement: new Date(1926, 11, 25), yearOffsetValue: 1925 },
    { historicalDesignation: 'taisho', periodCommencement: new Date(1912, 6, 30), yearOffsetValue: 1911 },
    { historicalDesignation: 'meiji', periodCommencement: new Date(1868, 8, 8), yearOffsetValue: 1867 }
];

eraRegistry.sort((a, b) => b.periodCommencement.getTime() - a.periodCommencement.getTime());

const sourceText = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const dataRecords = sourceText.split('\n');

dataRecords.forEach(currentRecord => {
    const parsedNumbers = currentRecord.split(' ').map(parseFloat);
    const gregorianCalendarYear = parsedNumbers[0];
    const gregorianCalendarMonth = parsedNumbers[1];
    const gregorianCalendarDay = parsedNumbers[2];

    const targetInstant = new Date(gregorianCalendarYear, gregorianCalendarMonth - 1, gregorianCalendarDay);
    const targetMillis = targetInstant.getTime();

    let identifiedPeriod = null;
    for (const eraEntry of eraRegistry) {
        if (targetMillis >= eraEntry.periodCommencement.getTime()) {
            identifiedPeriod = eraEntry;
            break;
        }
    }

    if (!identifiedPeriod) {
        console.log('pre-meiji');
    } else {
        const eraRelativeYear = gregorianCalendarYear - identifiedPeriod.yearOffsetValue;
        console.log(identifiedPeriod.historicalDesignation, eraRelativeYear, gregorianCalendarMonth, gregorianCalendarDay);
    }
});