const nodeFsModule = require('node:fs');
const rawContentFromStdin = nodeFsModule.readFileSync('/dev/stdin', { encoding: 'utf8' }).trim();
const processedDataRecords = rawContentFromStdin.split('\n').filter(Boolean);

// Define target date constants for clarity and potential reuse
const TERMINAL_YEAR = 1000;
const TERMINAL_MONTH = 1;
const TERMINAL_DAY = 1;

/**
 * Calculates the next calendar date based on a custom calendar system.
 *
 * This system defines:
 * - Months usually have 20 days.
 * - Years divisible by 3 (currentYear % 3 === 0) are considered "long" years where all months have 20 days.
 * - In "short" years (currentYear % 3 !== 0), specifically even-numbered months have 19 days instead of 20.
 * - There are 10 months in a year in this system.
 *
 * @param {number} currentYear - The starting year for the date calculation.
 * @param {number} currentMonth - The starting month for the date calculation.
 * @param {number} currentDay - The starting day for the date calculation.
 * @returns {[number, number, number]} An array containing the year, month, and day of the immediately succeeding date.
 */
const advanceToNextCalendarDate = (currentYear, currentMonth, currentDay) => {
    // Determine the maximum number of days allowed for the current month.
    // Default is 20 days.
    let maxDaysForThisMonth = 20;

    // Check if the current year is a "special" year (divisible by 3).
    const isSpecialYear = (currentYear % 3 === 0);
    // Check if the current month is an even-numbered month.
    const isEvenMonth = (currentMonth % 2 === 0);

    // Apply the specific rule: if it's a "short" year AND an even month,
    // then the month has 19 days.
    if (!isSpecialYear && isEvenMonth) {
        maxDaysForThisMonth = 19;
    }

    // Initialize the next date components based on the current date.
    let nextDayValue = currentDay + 1;
    let nextMonthValue = currentMonth;
    let nextYearValue = currentYear;

    // Check if the incremented day has exceeded the maximum for the current month.
    if (nextDayValue > maxDaysForThisMonth) {
        nextDayValue = 1; // Reset day to the first day of the next month.
        nextMonthValue++; // Advance to the subsequent month.

        // Check if the month has exceeded the year's limit (10 months in this system).
        // If nextMonthValue becomes 11 (meaning it's past the 10th month),
        // reset to month 1 and increment the year.
        if (nextMonthValue > 10) { // Equivalent to `nextMonthValue === 11`
            nextMonthValue = 1; // Reset month to the first month of the new year.
            nextYearValue++;    // Advance to the next year.
        }
    }

    return [nextYearValue, nextMonthValue, nextDayValue];
};

/**
 * Helper function to determine if a given date matches the predefined terminal date.
 * This improves readability of the loop condition.
 *
 * @param {number} yValue - The year component to check.
 * @param {number} mValue - The month component to check.
 * @param {number} dValue - The day component to check.
 * @returns {boolean} True if the date matches TERMINAL_YEAR/MONTH/DAY, false otherwise.
 */
const hasReachedTargetDate = (yValue, mValue, dValue) => {
    return yValue === TERMINAL_YEAR && mValue === TERMINAL_MONTH && dValue === TERMINAL_DAY;
};

// The first line of input is typically a count of test cases, which is not used here.
// We discard it using slice(1) to get only the actual date records.
const inputRecordsForProcessing = processedDataRecords.slice(1);

// Iterate through each date record provided in the input.
inputRecordsForProcessing.forEach(singleEntryLine => {
    // Parse the initial year, month, and day from the current line.
    // The map(Number) ensures the components are treated as numbers.
    const dateComponents = singleEntryLine.split(' ').map(Number);
    let currentProcessingYear = dateComponents[0];
    let currentProcessingMonth = dateComponents[1];
    let currentProcessingDay = dateComponents[2];

    // Initialize a counter to track the number of days elapsed.
    // This counter starts at 0, and increments for each step taken from the initial date.
    let daysCounter = 0;

    // Continue looping and advancing the date until the terminal date (1000/1/1) is reached.
    while (!hasReachedTargetDate(currentProcessingYear, currentProcessingMonth, currentProcessingDay)) {
        // Calculate the next date using our custom calendar logic.
        const nextComputedDate = advanceToNextCalendarDate(currentProcessingYear, currentProcessingMonth, currentProcessingDay);

        // Update the current date variables with the newly calculated date.
        currentProcessingYear = nextComputedDate[0];
        currentProcessingMonth = nextComputedDate[1];
        currentProcessingDay = nextComputedDate[2];

        // Increment the counter for each day passed.
        daysCounter++;
    }

    // Output the total number of days elapsed to reach the target date from the starting date.
    console.log(daysCounter);
});