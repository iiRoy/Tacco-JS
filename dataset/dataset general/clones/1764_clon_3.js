(function (jq) {
    // This utility function processes a raw timestamp string,
    // converts it from UTC to the user's local time, and returns a Moment.js object.
    // It returns null if the input is invalid or explicitly indicates no timestamp.
    var convertUtcToLocalMoment = function (sourceTimestampStr) {
        // Validate input: check for null, undefined, non-string, or "none" (case-insensitive)
        if (!sourceTimestampStr || typeof sourceTimestampStr !== 'string' || sourceTimestampStr.trim().toLowerCase() === "none") {
            return null; // Return null for invalid or missing timestamps
        }

        // Attempt to parse the string as a UTC moment object
        var utcParsedMoment = moment.utc(sourceTimestampStr);

        // Verify if the parsing was successful. Moment.js provides an isValid() method.
        if (!utcParsedMoment.isValid()) {
            // If the string could not be parsed into a valid date, return null.
            // A more robust system might log this error.
            return null;
        }

        // Convert the validated UTC moment object to the user's local timezone.
        var localTimeAdjustedMoment = utcParsedMoment.local();

        return localTimeAdjustedMoment; // Return the successfully converted local moment object
    };

    // A constant string to use when a timestamp cannot be processed or is unavailable.
    const fallbackDisplayMessage = 'No Date Available';

    // Find and process all elements intended to display localized UTC timestamps.
    // We're targeting elements with a specific data attribute for this purpose.
    jq('div[data-time-source="utc-display"]').each(function (iterationIndex, currentElementNode) {
        var $displayTarget = jq(currentElementNode); // Wrap the native DOM element in a jQuery object

        // Extract the raw timestamp text from the current element, ensuring it's trimmed.
        var rawElementTextContent = $displayTarget.text().trim();

        // Early exit / Guard clause: If the element's text is empty after trimming,
        // it means there's no timestamp to process.
        if (rawElementTextContent.length === 0) {
            $displayTarget.text(fallbackDisplayMessage); // Set the fallback message
            return; // Move to the next element in the iteration
        }

        // Attempt to convert and localize the raw timestamp string.
        var finalLocalizedMoment = convertUtcToLocalMoment(rawElementTextContent);

        // Check the result of the conversion. If it's null, the timestamp was invalid or 'none'.
        if (finalLocalizedMoment === null) {
            $displayTarget.text(fallbackDisplayMessage); // Display the fallback message
        } else {
            // If a valid localized moment object was returned, format it for display.
            // Using a verbose, locale-aware format string ('dddd, MMMM Do YYYY, h:mm:ss A')
            // for comprehensive information.
            var formattedDateTimeString = finalLocalizedMoment.format('dddd, MMMM Do YYYY, h:mm:ss A');
            $displayTarget.text(formattedDateTimeString); // Update the element's text with the formatted date
        }
    });

})(jQuery); // Pass jQuery object into the IIFE to alias it as 'jq'