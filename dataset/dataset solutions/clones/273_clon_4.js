const obtainTimeValue = (yearValue, monthValue, dayValue) => {
    return (new Date(yearValue, monthValue - 1, dayValue)).getTime();
};

const historicalPeriods = [
    { designation: "heisei", epochStartYear: 1989, epochStartMonth: 1, epochStartDay: 8 },
    { designation: "showa", epochStartYear: 1926, epochStartMonth: 12, epochStartDay: 25 },
    { designation: "taisho", epochStartYear: 1912, epochStartMonth: 7, epochStartDay: 30 },
    { designation: "meiji", epochStartYear: 1868, epochStartMonth: 9, epochStartDay: 8 }
];

// Pre-calculate epoch milliseconds for each period boundary
historicalPeriods.forEach(period => {
    period.boundaryMs = obtainTimeValue(period.epochStartYear, period.epochStartMonth, period.epochStartDay);
});

const rawInputData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputData.trim().split('\n');

processedLines.forEach(function(lineEntry) {
    const numericParts = lineEntry.split(' ').map(Number);
    const [currentYear, currentMonth, currentDay] = numericParts;
    const momentInQuestionMs = obtainTimeValue(currentYear, currentMonth, currentDay);

    let eraDesignation = "pre-meiji";
    
    for (const periodDefinition of historicalPeriods) {
        if (momentInQuestionMs >= periodDefinition.boundaryMs) {
            const eraRelativeYear = currentYear - periodDefinition.epochStartYear + 1;
            eraDesignation = `${periodDefinition.designation} ${eraRelativeYear} ${currentMonth} ${currentDay}`;
            break; 
        }
    }
    console.log(eraDesignation);
});