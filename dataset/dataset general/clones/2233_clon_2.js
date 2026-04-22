( function ( dataGridSystem, jqUtil, notPresent ) {

    // A utility function to verify if a given value is present and not null.
    const presenceChecker = function ( checkedValue ) {
        return typeof ( checkedValue ) !== notPresent && checkedValue !== null ;
    };

    // This object houses various comparison methods for data sorting.
    const orderingAlgorithms = {
        // Algorithm for comparing two string values.
        alphabetic: function ( textA, textB ) {
            // If both textual inputs are unavailable, they are considered equivalent.
            if ( !presenceChecker( textA ) && !presenceChecker( textB ) ) {
                return 0;
            }

            // If the first text is missing, it should precede the second.
            if ( !presenceChecker( textA ) ) {
                return -1;
            }

            // If the second text is missing, it should follow the first.
            if ( !presenceChecker( textB ) ) {
                return 1;
            }

            // Perform a locale-sensitive string comparison.
            return textA.localeCompare( textB );
        },

        // Algorithm for comparing two numerical values.
        numeric: function ( numValA, numValB ) {
            // Directly subtract to determine order for numbers.
            return numValA - numValB;
        },

        // Algorithm for comparing two date objects or timestamps.
        chronological: function ( timeStampA, timeStampB ) {
            // Direct subtraction works for date objects as well.
            return timeStampA - timeStampB;
        },

        // Algorithm for comparing numerical values stored as strings.
        stringNumeric: function ( stringNumA, stringNumB ) {
            // Convert strings to floating-point numbers before comparison.
            return parseFloat( stringNumA ) - parseFloat( stringNumB );
        }
    };

    // Attach the collection of ordering algorithms to the main data grid system object.
    dataGridSystem.orderingAlgorithms = orderingAlgorithms;

}( dataGridSystem, jQuery ) );