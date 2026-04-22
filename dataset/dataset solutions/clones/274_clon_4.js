const historicalPeriods = [
    { commencement: new Date(1989, 0, 7), designator: 'heisei', yearOffset: 1988 },
    { commencement: new Date(1926, 11, 24), designator: 'showa', yearOffset: 1925 },
    { commencement: new Date(1912, 6, 29), designator: 'taisho', yearOffset: 1911 },
    { commencement: new Date(1868, 8, 8), designator: 'meiji', yearOffset: 1867 }
];

const acquireDateTimestamp = (yearComponent, monthComponent, dayComponent) => {
    // JavaScript Date constructor expects month to be 0-indexed (0 for January, 11 for December)
    return new Date(yearComponent, monthComponent - 1, dayComponent).getTime();
};

const transformEntry = (textualEntry) => {
    const numericalComponents = textualEntry.split(' ').map(Number);
    const initialYear = numericalComponents[0];
    const initialMonth = numericalComponents[1];
    const initialDay = numericalComponents[2];

    const momentInTime = acquireDateTimestamp(initialYear, initialMonth, initialDay);

    let matchedPeriod = null;
    for (const eraDatum of historicalPeriods) {
        if (momentInTime >= eraDatum.commencement.getTime()) {
            matchedPeriod = eraDatum;
            break;
        }
    }

    if (!matchedPeriod) {
        return 'pre-meiji';
    } else {
        const adjustedYearValue = initialYear - matchedPeriod.yearOffset;
        return `${matchedPeriod.designator} ${adjustedYearValue} ${initialMonth} ${initialDay}`;
    }
};

const incomingDataContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataSegments = incomingDataContent.split('\n');

const outputStrings = dataSegments.map(transformEntry);

outputStrings.forEach(console.log);