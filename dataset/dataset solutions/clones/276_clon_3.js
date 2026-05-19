const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const inputLines = rawData.split('\n');

const createDateFromParts = (yearVal, monthVal, dayVal) => {
    return new Date(yearVal, monthVal - 1, dayVal);
};

const MEIJI_ERA_START_DATE = createDateFromParts(1868, 9, 8);
const TAISHO_ERA_START_DATE = createDateFromParts(1912, 7, 30);
const SHOWA_ERA_START_DATE = createDateFromParts(1926, 12, 25);
const HEISEI_ERA_START_DATE = createDateFromParts(1989, 1, 8);

const MEIJI_YEAR_SUBTRACT = 1867;
const TAISHO_YEAR_SUBTRACT = 1911;
const SHOWA_YEAR_SUBTRACT = 1925;
const HEISEI_YEAR_SUBTRACT = 1988;

let currentLine;
while (currentLine = inputLines.shift()) {
    const dateParts = currentLine.split(' ').map(Number);

    let targetYear = dateParts[0];
    const targetMonth = dateParts[1];
    const targetDay = dateParts[2];
    let eraName = '';

    const targetDate = createDateFromParts(targetYear, targetMonth, targetDay);

    if (targetDate < MEIJI_ERA_START_DATE) {
        eraName = 'pre-meiji';
    } else if (targetDate < TAISHO_ERA_START_DATE) {
        eraName = 'meiji';
        targetYear -= MEIJI_YEAR_SUBTRACT;
    } else if (targetDate < SHOWA_ERA_START_DATE) {
        eraName = 'taisho';
        targetYear -= TAISHO_YEAR_SUBTRACT;
    } else if (targetDate < HEISEI_ERA_START_DATE) {
        eraName = 'showa';
        targetYear -= SHOWA_YEAR_SUBTRACT;
    } else {
        eraName = 'heisei';
        targetYear -= HEISEI_YEAR_SUBTRACT;
    }

    if (eraName === 'pre-meiji') {
        console.log('pre-meiji');
        continue;
    }
    console.log(eraName, targetYear, targetMonth, targetDay);
}
