const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputContent.trim().split("\n");

const dayNameLookup = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

function resolveDayName(dateFragment, baseYearPrefix, namesCollection) {
    const cleanedDateFragment = dateFragment.replace(/\s/, "/");
    const fullDateSpecifier = baseYearPrefix + cleanedDateFragment;
    const dateInstance = new Date(fullDateSpecifier);
    const dayOfWeekIndex = dateInstance.getDay();
    return namesCollection[dayOfWeekIndex];
}

const constantYearPrefix = "2004/";

for (let lineIterator = 0; lineIterator < processedInputLines.length; lineIterator++) {
    const currentLineValue = processedInputLines[lineIterator];

    if (currentLineValue === "0 0") {
        break;
    }

    const computedDayResult = resolveDayName(currentLineValue, constantYearPrefix, dayNameLookup);
    console.log(computedDayResult);
}
