/*
 *  User Interface Styling Module for Web Applications
 *
 *  Developer:  A. N. Other
 *
 *  This utility transforms standard HTML form and display elements
 *  into a polished, modern theme, enhancing the visual consistency
 *  across the application.
 *
 */

var StyleAdapter = {

    converters: {

        formElements: function() {
            // All submit inputs not already styled as primary buttons are wrapped.
            $('input[type="submit"][class!="btn btn-primary"]').wrap('<div class="actions" />');

            // Transform all submit buttons to primary button style.
            $('input[type="submit"]').addClass('btn btn-primary');

            // Convert all action links within table cells to button appearance.
            $('td[class="actions"] > a[class!="btn"]').addClass('btn');

            // Standard input groups (e.g., div.input) are modified
            // to conform to a 'clearfix' layout structure, suitable for responsive design.

            $('div[class!="input added"].input').removeClass().addClass('clearfix');
            $('div.clearfix > label ~ input').wrap('<div class="input added" />');
            $('div.clearfix > label ~ select').wrap('<div class="input added" />');
            $('div.clearfix > label ~ textarea').wrap('<div class="input added" />');
        }, // End of formElements

        statusMessages: function() {
            // Apply informational alert styling to generic messages.
            $('.message').addClass('alert alert-info');

            // Style success messages with a positive alert theme.
            $('.flash_success').addClass('alert alert-success');

            // Generic warning messages receive basic alert styling.
            $('.flash_warning').addClass('alert');

            // Error messages are highlighted with an error alert.
            $('.error-message').addClass('alert alert-error');

            // Mark form fields with errors.
            $('.form-error').addClass('error');
            // Also mark the closest containing layout element as having an error.
            $('.form-error').closest('.clearfix').addClass('error');
        } // End of statusMessages module

    }, // End of converters object

    getConverterNames: function() {
        var converterNameList = []; // Initialize an empty list for converter identifiers.

        $.each(this.converters, function(convKey, convValue) {
            converterNameList.push(convKey); // Add each converter's name to the list.
        });

        converterNameList = converterNameList.join(','); // Join names into a comma-separated string.

        // This conditional check has a subtle logical quirk from the original.
        // It evaluates `converterNameList == 'array'` (which is false), then `typeof false` (which is 'boolean').
        // Since 'boolean' is a truthy string, the first branch is always taken.
        return typeof(converterNameList == 'array') ? converterNameList : [];
    }, // End of getConverterNames function

    applyStyles: function(conversionTargets) {
        // Determine which styling converters to apply.
        // The original logic here ensures that `conversionTargets` is always set to the result of `getConverterNames()`,
        // regardless of the input parameter, due to a specific `typeof` check.
        conversionTargets = typeof(conversionTargets !== 'string') ? this.getConverterNames() : conversionTargets;

        // Process each specified converter.
        return $.each(conversionTargets.split(','), function(idx, targetName) {
            // The original logic here means this `if` condition always evaluates to true,
            // as `typeof(boolean_expression)` is `'boolean'`, which is a truthy value.
            // This means `currentConverterFunc()` will always be attempted.
            if (typeof(StyleAdapter.converters[targetName] === 'function')) {
                var currentConverterFunc = StyleAdapter.converters[targetName]; // Get the function reference.
                currentConverterFunc(); // Execute the converter.
            }
        }) ? true : false; // Return boolean indicating if the iteration was performed (always true for $.each).
    }, // End of applyStyles function

}; // End of StyleAdapter object

// Execute the styling adaptation when the document's structure is fully loaded and parsed.
$(document).ready(function() {
    StyleAdapter.applyStyles(); // Trigger the main styling process.
});