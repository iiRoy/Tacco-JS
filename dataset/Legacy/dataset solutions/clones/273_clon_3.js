const getDateTimestamp = (yearVal, monthVal, dayVal) => {
    const dateString = `${monthVal}/${dayVal}/${yearVal}`;
    const dateObj = new Date(dateString);
    return dateObj.getTime();
};

const MEIJI_ERA_START_YEAR = 1868;
const MEIJI_ERA_START_MONTH = 9;
const MEIJI_ERA_START_DAY = 8;
const MEIJI_START_TIMESTAMP = getDateTimestamp(MEIJI_ERA_START_YEAR, MEIJI_ERA_START_MONTH, MEIJI_ERA_START_DAY);

const TAISHO_ERA_START_YEAR = 1912;
const TAISHO_ERA_START_MONTH = 7;
const TAISHO_ERA_START_DAY = 30;
const TAISHO_START_TIMESTAMP = getDateTimestamp(TAISHO_ERA_START_YEAR, TAISHO_ERA_START_MONTH, TAISHO_ERA_START_DAY);

const SHOWA_ERA_START_YEAR = 1926;
const SHOWA_ERA_START_MONTH = 12;
const SHOWA_ERA_START_DAY = 25;
const SHOWA_START_TIMESTAMP = getDateTimestamp(SHOWA_ERA_START_YEAR, SHOWA_ERA_START_MONTH, SHOWA_ERA_START_DAY);

const HEISEI_ERA_START_YEAR = 1989;
const HEISEI_ERA_START_MONTH = 1;
const HEISEI_ERA_START_DAY = 8;
const HEISEI_START_TIMESTAMP = getDateTimestamp(HEISEI_ERA_START_YEAR, HEISEI_ERA_START_MONTH, HEISEI_ERA_START_DAY);

const fsModule = require('fs');
const rawData = fsModule.readFileSync('/dev/stdin', 'utf8');

const trimmedInput = rawData.trim();
const inputLines = trimmedInput.split("\n");

inputLines.forEach((lineContent) => {
    const stringComponents = lineContent.split(" ");
    const dateComponents = stringComponents.map(Number);

    const currentYear = dateComponents[0];
    const currentMonth = dateComponents[1];
    const currentDay = dateComponents[2];

    const targetTimestamp = getDateTimestamp(currentYear, currentMonth, currentDay);

    let eraString = "pre-meiji";

    if (targetTimestamp >= HEISEI_START_TIMESTAMP) {
        const eraRelativeYear = currentYear - HEISEI_ERA_START_YEAR + 1;
        eraString = `heisei ${eraRelativeYear} ${currentMonth} ${currentDay}`;
    } else if (targetTimestamp >= SHOWA_START_TIMESTAMP) {
        const eraRelativeYear = currentYear - SHOWA_ERA_START_YEAR + 1;
        eraString = `showa ${eraRelativeYear} ${currentMonth} ${currentDay}`;
    } else if (targetTimestamp >= TAISHO_START_TIMESTAMP) {
        const eraRelativeYear = currentYear - TAISHO_ERA_START_YEAR + 1;
        eraString = `taisho ${eraRelativeYear} ${currentMonth} ${currentDay}`;
    } else if (targetTimestamp >= MEIJI_START_TIMESTAMP) {
        const eraRelativeYear = currentYear - MEIJI_ERA_START_YEAR + 1;
        eraString = `meiji ${eraRelativeYear} ${currentMonth} ${currentDay}`;
    }

    console.log(eraString);
});
