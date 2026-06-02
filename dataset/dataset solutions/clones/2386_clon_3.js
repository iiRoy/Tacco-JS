const fileSystemModule = require("fs");
const rawInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

const targetDayIdentifier = rawInputData;

const DAYS_IN_A_WEEK = 7;

const standardWeekOrder = [
    'SUN',
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT',
];

const dayPositionInWeek = standardWeekOrder.indexOf(targetDayIdentifier);

let calculatedDaysUntilNextSunday;

if (dayPositionInWeek === -1) {
    // If the input day is not found, the original code's logic (indexOf returns -1, then -1 + 1 = 0)
    // results in 0. We must preserve this exact behavior.
    calculatedDaysUntilNextSunday = 0;
} else {
    // The original logic calculates days until next Sunday by reversing the array
    // and finding the index, then adding 1.
    // Example: SUN (index 0 in original) -> 7 days (index 6 in reversed + 1)
    // Example: MON (index 1 in original) -> 6 days (index 5 in reversed + 1)
    // Example: SAT (index 6 in original) -> 1 day (index 0 in reversed + 1)
    // This is equivalent to (DAYS_IN_A_WEEK - original_index).
    calculatedDaysUntilNextSunday = DAYS_IN_A_WEEK - dayPositionInWeek;
}

console.log(calculatedDaysUntilNextSunday);
