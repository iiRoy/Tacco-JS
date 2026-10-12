var rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var inputLines = rawData.split('\n');

function determineEraAndAdjustYear(inputYear, inputMonth, inputDay) {
    const MEIJI_ERA_START_DATE = new Date(1868, 8, 8);
    const TAISHO_ERA_START_DATE = new Date(1912, 6, 29);
    const SHOWA_ERA_START_DATE = new Date(1926, 11, 24);
    const HEISEI_ERA_START_DATE = new Date(1989, 0, 7);

    const MEIJI_YEAR_OFFSET = 1867;
    const TAISHO_YEAR_OFFSET = 1911;
    const SHOWA_YEAR_OFFSET = 1925;
    const HEISEI_YEAR_OFFSET = 1988;

    const processingDate = new Date(inputYear, inputMonth - 1, inputDay);

    let eraDesignation = '';
    let calculatedYear = inputYear;

    if (processingDate < MEIJI_ERA_START_DATE) {
        eraDesignation = 'pre-meiji';
    } else if (processingDate < TAISHO_ERA_START_DATE) {
        eraDesignation = 'meiji';
        calculatedYear -= MEIJI_YEAR_OFFSET;
    } else if (processingDate < SHOWA_ERA_START_DATE) {
        eraDesignation = 'taisho';
        calculatedYear -= TAISHO_YEAR_OFFSET;
    } else if (processingDate < HEISEI_ERA_START_DATE) {
        eraDesignation = 'showa';
        calculatedYear -= SHOWA_YEAR_OFFSET;
    } else {
        eraDesignation = 'heisei';
        calculatedYear -= HEISEI_YEAR_OFFSET;
    }

    return { era: eraDesignation, adjustedYear: calculatedYear };
}

var currentLine;
while (currentLine = inputLines.shift()) {
    var dateComponents = currentLine.split(' ').map(function(numStr){
        return parseInt(numStr, 10);
    });

    var targetYear = dateComponents[0];
    var targetMonth = dateComponents[1];
    var targetDay = dateComponents[2];

    const eraDetails = determineEraAndAdjustYear(targetYear, targetMonth, targetDay);
    const eraName = eraDetails.era;
    const adjustedYear = eraDetails.adjustedYear;

    if (eraName === 'pre-meiji') {
        console.log('pre-meiji');
        continue;
    }
    console.log(eraName, adjustedYear, targetMonth, targetDay);
}
