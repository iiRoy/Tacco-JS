const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

const dataLines = rawData.split('\n');

let currentLine;
while (currentLine = dataLines.shift()) {
    const dateParts = currentLine.split(' ').map((numStr) => +numStr);

    let currentYear = dateParts[0];
    const currentMonth = dateParts[1];
    const currentDay = dateParts[2];
    let eraName = '';

    const targetDate = new Date(currentYear, currentMonth - 1, currentDay);
    if (targetDate < new Date(1868, 8, 8)) {
        eraName = 'pre-meiji';
    } else if (targetDate < new Date(1912, 6, 29)) {
        eraName = 'meiji';
        currentYear -= 1867;
    } else if (targetDate < new Date(1926, 11, 24)) {
        eraName = 'taisho';
        currentYear -= 1911;
    } else if (targetDate < new Date(1989, 0, 7)) {
        eraName = 'showa';
        currentYear -= 1925;
    } else {
        eraName = 'heisei';
        currentYear -= 1988;
    }

    if (eraName === 'pre-meiji') {
        console.log('pre-meiji');
        continue;
    }
    console.log(eraName, currentYear, currentMonth, currentDay);
}
