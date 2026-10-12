const fileSystemModule = require("fs");
const rawDataString = fileSystemModule.readFileSync("/dev/stdin", "utf8");

let slashIndexPosition = rawDataString.indexOf('/');
let yearPartString = rawDataString.substring(0, slashIndexPosition);
let monthPartString = rawDataString.substring(slashIndexPosition + 1);

let currentYearValue = Number(yearPartString);
let currentMonthValue = Number(monthPartString);

function determinePeriodLabel(yearIdentifier, monthIdentifier) {
    if (yearIdentifier > 2019) {
        return 'TBD';
    } else if (yearIdentifier === 2019) {
        if (monthIdentifier >= 5) {
            return 'TBD';
        } else {
            return 'Heisei';
        }
    } else {
        return 'Heisei';
    }
}

const resultString = determinePeriodLabel(currentYearValue, currentMonthValue);
console.log(resultString);
