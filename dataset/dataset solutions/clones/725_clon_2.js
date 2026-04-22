// This module provides file system utilities for interacting with the operating system.
const fileSystem = require('fs');

// Reads the entire content from the standard input stream synchronously.
// The content is interpreted using 'utf-8' encoding.
// The trimEnd() method is applied to remove any trailing whitespace characters.
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf-8').trimEnd();

// The raw input content is then further processed.
// First, any leading whitespace is removed using trimStart().
// Then, the content is split into an array of individual lines based on the newline character.
const processedInputLines = rawInputContent.trimStart().split( '\n' );

/**
 * Calculates the date of the next day according to a specific custom calendar system.
 * This system has unique rules for day and month progression, especially concerning leap-like years.
 *
 * @param {number} currentYear - The numerical value representing the year of the current date.
 * @param {number} currentMonth - The numerical value representing the month of the current date.
 * @param {number} currentDay - The numerical value representing the day of the current date.
 * @returns {Array<number>} An array containing three numbers: the updated year, month, and day for the subsequent date.
 */
const progressDate = ( currentYear, currentMonth, currentDay ) => {
    // Increment the day by one to move to the next calendar day.
    currentDay = currentDay + 1;

    // A special rule applies if the current year is perfectly divisible by three.
    if ( ( currentYear % 3 ) === 0 ) {
        // In these special years, if the day count exceeds 20, it resets to 1.
        if ( currentDay > 20 ) {
            currentDay = 1; // Reset day to the first.
            currentMonth += 1; // Advance to the next month.

            // If advancing the month causes it to reach 11 (after month 10), it resets to 1.
            // Concurrently, the year is incremented.
            if ( currentMonth === 11 ) {
                currentMonth = 1; // Reset month to the first.
                currentYear++;    // Advance to the next year.
            }
        }
    }
    // For all other years (not divisible by three), a different set of rules is followed.
    else {
        // If the day count exceeds 20 in a non-special year, it also resets to 1.
        if ( currentDay > 20 ) {
            currentDay = 1; // Reset day.
            currentMonth += 1; // Advance month.

            // Similar to special years, if the month reaches 11, it resets to 1 and the year advances.
            if ( currentMonth === 11 ) {
                currentMonth = 1; // Reset month.
                currentYear++;    // Advance year.
            }
        }
        // An additional condition for non-special years:
        // if the day count exceeds 19 AND the current month is an even number.
        else if ( ( currentDay > 19 ) && ( currentMonth % 2 === 0 ) ) {
            currentDay = 1; // Reset day to the first.
            currentMonth += 1; // Advance to the next month.

            // Again, if the month rolls over to 11, it resets to 1 and the year advances.
            if ( currentMonth === 11 ) {
                currentMonth = 1; // Reset month.
                currentYear++;    // Advance year.
            }
        }
    }

    // Returns the newly computed date components.
    return [ currentYear, currentMonth, currentDay ];
};


// The first line of the processed input is typically a header or count,
// which is not needed for the date calculations, so it is removed.
processedInputLines.shift();


// Iterates through each remaining line of the input, treating each as a starting date.
processedInputLines.forEach( ( currentLineEntry ) => {
    // Each line string is first trimmed from the end to remove any trailing whitespace.
    // It's then split into parts based on spaces, and each part is converted into a number.
    // These numbers are destructured into variables for year, month, and day.
    let [ yearVal, monthVal, dayVal ] = currentLineEntry.trimEnd( ).split( ' ' ).map( ( numericStr ) => {
        return Number( numericStr );
    } );

    // A counter is initialized to track the number of days that have passed.
    // It starts at 1, representing the initial day itself.
    let elapsedDaysCounter = 1;

    // This loop continues to advance the date one day at a time
    // until the target date (year 1000, month 1, day 1) is reached.
    while ( ( yearVal !== 1000 ) || ( monthVal !== 1 ) || ( dayVal !== 1 ) ) {
        // The current date is updated by calling the date progression function.
        [ yearVal, monthVal, dayVal ] = progressDate( yearVal, monthVal, dayVal );
        // For every day that passes, the counter is incremented.
        elapsedDaysCounter++;
    }

    // The final result (total days elapsed minus the initial day) is written to standard output.
    // The number is converted to a string, and a newline character is appended for proper formatting.
    process.stdout.write( String( elapsedDaysCounter - 1 ) + '\n' );
} );