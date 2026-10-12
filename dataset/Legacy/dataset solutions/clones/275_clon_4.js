const processInputData = (rawData) => {
    const inputLines = rawData.trim().split('\n');

    const eraBoundariesAndAdjustments = [
        { upperTime: new Date(1868, 8, 8).getTime(), eraIdentifier: 'pre-meiji', yearOffset: 0 },
        { upperTime: new Date(1912, 6, 30).getTime(), eraIdentifier: 'meiji', yearOffset: 1867 },
        { upperTime: new Date(1926, 11, 25).getTime(), eraIdentifier: 'taisho', yearOffset: 1911 },
        { upperTime: new Date(1989, 0, 7).getTime(), eraIdentifier: 'showa', yearOffset: 1925 },
        { upperTime: Infinity, eraIdentifier: 'heisei', yearOffset: 1988 }
    ];

    inputLines.forEach(currentRecord => {
        const [fullCalendarYear, monthNumber, dayNumber] = currentRecord.split(' ').map(Number);

        const targetMoment = new Date(fullCalendarYear, monthNumber - 1, dayNumber);
        const targetMomentMs = targetMoment.getTime();

        const applicableEra = eraBoundariesAndAdjustments.find(eraDef => targetMomentMs < eraDef.upperTime);

        const { eraIdentifier, yearOffset } = applicableEra;

        if (eraIdentifier === 'pre-meiji') {
            console.log('pre-meiji');
        } else {
            const eraRelativeYear = fullCalendarYear - yearOffset;
            console.log(eraIdentifier, eraRelativeYear, monthNumber, dayNumber);
        }
    });
};

const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
processInputData(fileContents);
