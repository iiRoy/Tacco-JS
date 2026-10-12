const obtainEpochMs = (yr, mn, dy) => new Date(yr, mn - 1, dy).getTime();

const historicalPeriods = [
    {
        periodName: "heisei",
        periodStartGregorianYear: 1989,
        periodStartMonth: 1,
        periodStartDay: 8,
        periodStartEpochMs: obtainEpochMs(1989, 1, 8)
    },
    {
        periodName: "showa",
        periodStartGregorianYear: 1926,
        periodStartMonth: 12,
        periodStartDay: 25,
        periodStartEpochMs: obtainEpochMs(1926, 12, 25)
    },
    {
        periodName: "taisho",
        periodStartGregorianYear: 1912,
        periodStartMonth: 7,
        periodStartDay: 30,
        periodStartEpochMs: obtainEpochMs(1912, 7, 30)
    },
    {
        periodName: "meiji",
        periodStartGregorianYear: 1868,
        periodStartMonth: 9,
        periodStartDay: 8,
        periodStartEpochMs: obtainEpochMs(1868, 9, 8)
    }
];

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

const dataLines = sourceData.trim().split("\n");

dataLines.forEach(function(lineContent){
    const [currentYear, currentMonth, currentDay] = lineContent.split(" ").map(Number);

    const currentMomentMs = obtainEpochMs(currentYear, currentMonth, currentDay);

    const matchingPeriod = historicalPeriods.find(eraDef => currentMomentMs >= eraDef.periodStartEpochMs);

    let outputPhrase;
    if (matchingPeriod) {
        const eraRelativeYear = currentYear - matchingPeriod.periodStartGregorianYear + 1;
        outputPhrase = `${matchingPeriod.periodName} ${eraRelativeYear} ${currentMonth} ${currentDay}`;
    } else {
        outputPhrase = "pre-meiji";
    }

    console.log(outputPhrase);
});
