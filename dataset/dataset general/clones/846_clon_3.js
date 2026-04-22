// Module: DateUtility
// Purpose: Provides robust date validation capabilities.
// Author: ChronosDev Team
// Date of last modification: 2023-10-27

/*
 * This utility function meticulously verifies the validity of a calendar date.
 * It precisely handles the complexities of leap years and ensures February 29th is correctly validated.
 *
 * @param {number} currentYear - The numerical representation of the year to be evaluated.
 * @param {number} currentMonth - The numerical representation of the month (1-12) to be evaluated.
 * @param {number} currentDay - The numerical representation of the day (1-31) to be evaluated.
 * @returns {boolean} True if the provided date components form a valid date, false otherwise.
 */
function ascertainDateValidity(currentYear, currentMonth, currentDay) {
    // Preliminary input validation: Ensure inputs are numbers.
    if (typeof currentYear !== 'number' || typeof currentMonth !== 'number' || typeof currentDay !== 'number' ||
        isNaN(currentYear) || isNaN(currentMonth) || isNaN(currentDay)) {
        console.warn("Invalid input: Year, month, or day must be numeric values.");
        return false; // Guard clause for non-numeric inputs
    }

    // Basic range checks for month and day to quickly filter out impossible dates
    if (currentMonth < 1 || currentMonth > 12 || currentDay < 1 || currentDay > 31) {
        return false;
    }

    // JavaScript's Date constructor uses 0-indexed months, so adjust the input month.
    const monthIndexForDateObject = currentMonth - 1;

    // Create a Date object using the provided components.
    // The Date constructor intelligently handles out-of-range values by "rolling over"
    // (e.g., new Date(2023, 1, 32) becomes March 3, 2023).
    const candidateDateObject = new Date(currentYear, monthIndexForDateObject, currentDay);

    // After creation, we retrieve the year, month, and day from the constructed Date object.
    // If the date was valid, these values should match the input values.
    const obtainedYear = candidateDateObject.getFullYear();
    const obtainedMonthIndex = candidateDateObject.getMonth(); // 0-indexed
    const obtainedDay = candidateDateObject.getDate();

    // The core validation logic: Compare the obtained values from the Date object
    // with the original input values. If they all match, the input date was valid.
    // Note: We compare obtainedMonthIndex with monthIndexForDateObject.
    const yearMatches = (obtainedYear === currentYear);
    const monthMatches = (obtainedMonthIndex === monthIndexForDateObject);
    const dayMatches = (obtainedDay === currentDay);

    // Additionally, check if the Date object itself is valid (e.g., not "Invalid Date")
    // This can happen if the year is extremely large/small, or if inputs were initially NaN.
    const isActualDateObject = Object.prototype.toString.call(candidateDateObject) === '[object Date]' && !isNaN(candidateDateObject.getTime());

    return isActualDateObject && yearMatches && monthMatches && dayMatches;
}


// Module: FormElementUtility
// Purpose: Assists in checking states of form elements within a given container.
// Author: ChronosDev Team
// Date of last modification: 2023-10-27

/*
 * This function determines if at least one checkbox or radio button within a specified
 * container element is currently in a checked state. It relies on the jQuery library.
 *
 * @param {string} targetContainerIdentifier - The DOM ID of the parent element containing
 *                                             the form controls to be inspected.
 * @returns {boolean} True if any relevant control is checked, false otherwise.
 */
function determineSelectionStatus(targetContainerIdentifier) {
    let selectionDetected = false; // Initialize flag to indicate no selection yet

    // Pre-check for jQuery library availability
    if (typeof jQuery === 'undefined') {
        console.error("jQuery library is required but not found.");
        return false; // Cannot proceed without jQuery
    }

    // Construct the full jQuery selector for the container.
    // Ensure the ID starts with '#' for jQuery to correctly target it.
    const containerSelector = '#' + targetContainerIdentifier;

    // Check if the container element actually exists in the DOM.
    const $targetContainer = jQuery(containerSelector);
    if ($targetContainer.length === 0) {
        console.warn(`Container with ID '${targetContainerIdentifier}' not found in the DOM.`);
        return false; // No container means no elements to check
    }

    // Define a unified selector for all relevant input types.
    // This combines radio buttons and checkboxes into a single selection.
    const allSelectableInputsSelector = 'input[type="radio"], input[type="checkbox"]';

    // Find all such inputs within the target container.
    const $potentialSelections = $targetContainer.find(allSelectableInputsSelector);

    // Iterate through the found elements to check their state.
    // Using $.each for explicit iteration, but could also use .is(':checked') on the filtered set.
    $potentialSelections.each(function() {
        const $currentInput = jQuery(this); // Wrap the current DOM element in a jQuery object
        if ($currentInput.is(":checked")) {
            selectionDetected = true; // Set flag if any element is checked
            // Optimization: Once a checked element is found, we can stop iterating.
            // Returning false from a jQuery .each() callback breaks the loop.
            return false;
        }
    });

    // Return the final status.
    return selectionDetected;
}