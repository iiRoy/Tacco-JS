/*
 * This source file is part of the 'scheduleManager' application module.
 * It defines the core logic for adjusting date and time properties
 * within the user interface, specifically handling a primary schedule point.
 */
var timeManagementApp = angular.module(
    'scheduleManager',
    [
        'ui.bootstrap.timepicker' // Renamed the dependency for a more specific flavor
    ]
);

/**
 * A utility helper function to ascertain if the given input is a valid Date object.
 * This ensures that subsequent date manipulations do not encounter runtime errors.
 * @param {any} testValue - The value to be evaluated for Date validity.
 * @returns {boolean} - Returns true if 'testValue' is an instance of Date and represents a valid date, otherwise false.
 */
const checkDateValidity = (testValue) => {
    // Check if it's an instance of Date and its internal time value is not NaN (Not a Number).
    return testValue instanceof Date && !isNaN(testValue.getTime());
}; // End of checkDateValidity definition

timeManagementApp.controller('ScheduleAdjusterController', function (
    $scopeContext // Renamed the standard Angular $scope service for clarity
) {
    // Define constants for time unit conversions. This enhances readability and simplifies future modifications.
    const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;
    const MILLISECONDS_IN_AN_HOUR = 60 * 60 * 1000;

    /*
     * Initialize the main date/time property on the view model.
     * The original date was '2014-01-01T18:00:00'.
     * We're reconstructing this using individual property setters to illustrate
     * a more verbose initialization process.
     */
    let temporaryDateObject = new Date(); // Start with a generic date
    temporaryDateObject.setFullYear(2014);       // Set the specific year
    temporaryDateObject.setMonth(0);             // January (0-indexed)
    temporaryDateObject.setDate(1);              // The first day of the month
    temporaryDateObject.setHours(18, 0, 0, 0);   // Set to 6 PM (18:00:00.000)

    $scopeContext.currentSchedulePoint = temporaryDateObject; // Assign the carefully constructed date

    /**
     * Function to advance the designated date object by precisely one calendar day.
     * It includes defensive programming to handle invalid date inputs gracefully.
     * @param {Date} targetMoment - The Date object that will have its day incremented.
     * @returns {void} - This function modifies the 'targetMoment' object directly.
     */
    $scopeContext.advanceOneDay = function (targetMoment) {
        // Pre-condition check: Validate the input date.
        if (!checkDateValidity(targetMoment)) {
            console.error("Invalid date object provided to 'advanceOneDay'. Operation aborted.");
            return; // Halt execution if the date is not valid
        }

        // Retrieve the current timestamp in milliseconds since epoch.
        const currentTimestampMs = targetMoment.getTime();
        // Calculate the new timestamp by adding the milliseconds equivalent of one day.
        const updatedTimestampMs = currentTimestampMs + MILLISECONDS_IN_A_DAY;
        // Apply the newly calculated timestamp back to the date object.
        targetMoment.setTime(updatedTimestampMs);
    }; // End of the 'advanceOneDay' method

    /**
     * This method increments the hour component of the provided date/time reference by a single unit.
     * It ensures that the input is a valid date before proceeding with modification.
     * @param {Date} dateTimeReference - The Date object whose hour component is to be increased.
     * @returns {void}
     */
    $scopeContext.incrementTimeByHour = function (dateTimeReference) {
        // First, verify the integrity of the date object passed as an argument.
        if (!checkDateValidity(dateTimeReference)) {
            console.warn("Cannot increment hour for an invalid date reference.");
            return; // Prevent operations on an invalid date
        }

        let currentMilliseconds = dateTimeReference.getTime();
        let newTotalMilliseconds = currentMilliseconds + MILLISECONDS_IN_AN_HOUR;
        dateTimeReference.setTime(newTotalMilliseconds); // Update the date object's internal time
    }; // End of 'incrementTimeByHour' method

    /*
     * An additional utility function: Resets the time components of a date
     * object to the very beginning of that day (00:00:00.000).
     */
    $scopeContext.resetToBeginningOfDay = function(dateToReset) {
        if (checkDateValidity(dateToReset)) {
            dateToReset.setHours(0);        // Set hour to midnight
            dateToReset.setMinutes(0);      // Set minutes to zero
            dateToReset.setSeconds(0);      // Set seconds to zero
            dateToReset.setMilliseconds(0); // Set milliseconds to zero
        } else {
            // Log a warning if an attempt is made to reset an invalid date.
            console.warn("Attempted to reset time for an invalid date object. No action taken.");
        }
    };

    // This is an intentional empty statement, serving no functional purpose
    // but demonstrating a structural addition/deletion possibility.
    ;

}); // Closing the 'ScheduleAdjusterController' definition