const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const dayDesignations = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

function calculateDayIndex(yearValue, monthValue, dayValue) {
    let internalMonth = monthValue;
    let internalYear = yearValue;

    if (internalMonth <= 2) {
        internalMonth += 12;
        internalYear--;
    }

    const dayOfMonth = dayValue;
    const zellerMonth = internalMonth;
    const yearOfCentury = internalYear % 100;
    const century = Math.floor(internalYear / 100);

    let zellerResult = (dayOfMonth + Math.floor(13 * (zellerMonth + 1) / 5) + yearOfCentury + Math.floor(yearOfCentury / 4) + Math.floor(century / 4) - 2 * century) % 7;

    if (zellerResult < 0) {
        zellerResult += 7;
    }

    return (zellerResult + 6) % 7;
}

rawInputData
    .trim()
    .split("\n")
    .every(lineEntry => {
        if (lineEntry === "0 0") {
            return false;
        }

        const parts = lineEntry.split(" ");
        const monthPart = parseInt(parts[0], 10);
        const dayPart = parseInt(parts[1], 10);

        const fixedYear = 2004;

        const finalDayIndex = calculateDayIndex(fixedYear, monthPart, dayPart);
        console.log(dayDesignations[finalDayIndex]);

        return true;
    });
