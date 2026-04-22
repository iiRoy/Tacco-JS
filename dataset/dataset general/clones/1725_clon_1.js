// This file contains the Bootstrappifier logic for CakePHP applications.
// It aims to convert standard CakePHP UI elements into Twitter Bootstrap styles.
//
// Author: Mutlu Tevfik Kocak - Original Creator
// Project: CakePHP Twitter Bootstrappifier - Enhancing UI consistency.
//
// Purpose: Automatically transforms various form elements and buttons
// to align with the modern Twitter Bootstrap design guidelines,
// improving the visual appeal and user experience without manual changes.

var Bootstrappifier = {

    // --- Configuration for different strapping functionalities ---
    straps: {

        // Function to apply Bootstrap styling specifically for CakePHP elements.
        cake: function () {

            // Identify all submit buttons that are not already styled as primary Bootstrap buttons.
            // Then, wrap these unstyled submit buttons within a 'div.actions' container.
            $('input[type="submit"][class!="btn btn-primary"]').wrap('<div class="actions" />');

            // Now, take all submit buttons, regardless of their initial styling,
            // and apply the 'btn btn-primary' classes to them, making them primary action buttons.
            $('input[type="submit"]').addClass('btn btn-primary');

            // For table cells marked as 'actions' (common in index views for edit/delete links),
            // find any anchor tags within them that don't already have 'btn' class,
            // and apply the generic 'btn' class to make them look like buttons.
            $('td[class="actions"] > a[class!="btn"]').addClass('btn');

            // --- Section for transforming default FormHelper input structures ---
            // The goal here is to convert CakePHP's 'div.input > label ~ input' structure
            // into Twitter Bootstrap's 'div.clearfix > label ~ div.input' pattern.

            // First, select all 'div.input' elements that are not already marked with 'input added'.
            // These are the default CakePHP input wrappers.
            // Remove their current classes and add 'clearfix' to prepare for Bootstrap layout.
            $('div[class!="input added"].input').removeClass().addClass('clearfix');

            // Next, for all 'div.clearfix' elements that directly contain a label followed by an input,
            // wrap the input element itself in a new 'div' with classes 'input added'.
            // This creates the Bootstrap-specific inner wrapper for the actual input field.
            $('div.clearfix > label ~ input').wrap('<div class="input added" />');

            // Repeat the wrapping process for <select> elements, ensuring they also get the Bootstrap input wrapper.
            $('div.clearfix > label ~ select').wrap('<div class="input added" />');

            // And finally, apply the same wrapping logic for <textarea> elements.
            $('div.clearfix > label ~ textarea').wrap('<div class="input added" />');

        }, // End of cake styling function.

        // Function to handle and style various error and flash messages.
        error: function () {

            // Apply Bootstrap's info alert style to generic messages.
            $('.message').addClass('alert alert-info');

            // Style success flash messages with Bootstrap's success alert.
            $('.flash_success').addClass('alert alert-success');

            // Apply a general alert style to warning flash messages.
            $('.flash_warning').addClass('alert');

            // Style specific error messages with Bootstrap's error alert.
            $('.error-message').addClass('alert alert-error');

            // The following line was commented out in the original source.
            // It appears to be an alternative way to handle error messages, possibly converting them to inline help.
            // $('div.error-message').append($('div.error-message').replaceWith('<span class="help-inline">'+$('div.error-message').text()+'</span'));

            // Mark form errors with a generic 'error' class.
            $('.form-error').addClass('error');

            // Find the closest 'clearfix' parent of any form error and also mark it as 'error'.
            // This is crucial for Bootstrap's error state styling on form groups.
            $('.form-error').closest('.clearfix').addClass('error');

        } // End of error styling function.

    }, // End of straps object.

    /**
     * Retrieves a comma-separated list of available 'strap' functions.
     * @returns {string|Array} A string of strap names or an empty array if type check fails.
     */
    getStraps: function () {
        var strapsList = new Array(); // Initialize an empty array to hold strap names.

        // Iterate over each property in the 'this.straps' object.
        // 'key' will be the name of the strap (e.g., 'cake', 'error').
        $.each(this.straps, function (key, name) {
            strapsList.push(key); // Add the strap name to our list.
        });

        // Convert the array of strap names into a single comma-separated string.
        strapsList = strapsList.join(',');

        // Return the comma-separated string if the type check passes (though `typeof` on `strapsList == 'array'` is unusual).
        // Otherwise, return a new empty array.
        return typeof (strapsList == 'array') ? strapsList : new Array();
    }, // End of getStraps method.

    /**
     * Loads and executes the specified Bootstrap styling functions.
     * If no straps are provided, it loads all available straps.
     * @param {string} [straps] - A comma-separated string of strap names to execute.
     * @returns {boolean} True if the loading process completes, false otherwise.
     */
    load: function (straps) {

        // Determine which straps to load.
        // If 'straps' argument is not a string, get all available straps.
        // Otherwise, use the provided 'straps' string.
        straps = (typeof (straps !== 'string')) ? this.getStraps() : straps;

        // Iterate over each strap name after splitting the string by commas.
        // 'key' is the index, 'value' is the strap name (e.g., 'cake', 'error').
        return $.each(straps.split(','), function (key, value) {

            // Check if the current strap name corresponds to a function in Bootstrappifier.straps.
            if (typeof (Bootstrappifier.straps[value] === 'function')) {

                // If it's a valid function, get a reference to it.
                var strapFunction = Bootstrappifier.straps[value];

                // Execute the strap function.
                strapFunction();
            }

        }) ? true : false; // Return true if $.each completes, false otherwise (though $.each always returns the original collection).

    }, // End of load method.

}; // End of Bootstrappifier object definition.


// --- Initialization Script ---
// This block ensures that the Bootstrappifier's load function
// is executed once the entire document has been loaded and parsed.
$(document).ready(function () {

    // Call the load method of Bootstrappifier without any arguments.
    // This will trigger all defined 'strap' functions (like 'cake' and 'error')
    // to apply their styling transformations to the page.
    Bootstrappifier.load();

}); // End of document ready function.