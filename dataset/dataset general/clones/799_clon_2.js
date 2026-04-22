(function(jq) {

    /**
     * Offers placeholder emulation for web browsers that do not natively support this feature
     * (for example, older versions of Firefox like Firefox 3).
     *
     * Copyright 2011 Dan Bentley, all rights reserved.
     * Licensed under the Apache License, version 2.0.
     *
     * Developed by: Dan Bentley [github.com/danbentley]
     */

    // If the browser provides built-in placeholder support, then terminate script execution.
    if ("placeholder" in document.createElement("input")) return;

    jq(document).ready(function() {

        // Iterate over all input elements possessing a 'placeholder' attribute, excluding those of type 'password'.
        jq(':input[placeholder]').not(':password').each(function() {
            configureInputBehavior(jq(this));
        });

        // Process all password input elements that have a 'placeholder' attribute defined.
        jq(':password[placeholder]').each(function() {
            managePasswordFields(jq(this));
        });

        // Attach a handler to the submit event for all form elements.
        jq('form').submit(function(evt) {
            resetFormPlaceholders(jq(this));
        });

    });

    /**
     * Initializes the placeholder handling for a given text-based input field.
     *
     * @param {jQuery} elementRef The jQuery object representing the target input element.
     */
    function configureInputBehavior(elementRef) {

        var defaultPlaceholderStr = elementRef.attr('placeholder'); // Obtain the designated placeholder string.

        initializeOrMarkModified(elementRef, defaultPlaceholderStr); // Apply initial placeholder or set modification flag.

        elementRef.focus(function(evt) { // Event fired when the element receives focus.
            if (elementRef.data('wasModified') === true) return; // If content was manually altered, exit.
            if (elementRef.val() === defaultPlaceholderStr) elementRef.val(''); // Clear placeholder text if it's the current value.
        }).blur(function(evt) { // Event fired when the element loses focus.
            if (elementRef.val() === '') elementRef.val(defaultPlaceholderStr); // Restore placeholder if the field is empty.
        }).change(function(evt) { // Event fired when the element's value is modified.
            elementRef.data('wasModified', elementRef.val() !== ''); // Update the modification status flag.
        });
    }

    /**
     * Either populates an empty input field with its placeholder text or flags it as user-modified.
     *
     * @param {jQuery} elementRef The jQuery object for the input field.
     * @param {string} defaultText The placeholder string to be used.
     */
    function initializeOrMarkModified(elementRef, defaultText) {
        (elementRef.val() === '') ? elementRef.val(defaultText) : elementRef.data('wasModified', true);
    }

    /**
     * Orchestrates the behavior for password input fields that include a placeholder.
     * This involves creating a visible substitute input for the placeholder text.
     *
     * @param {jQuery} elementRef The jQuery object representing the password input field.
     */
    function managePasswordFields(elementRef) {
        var passFieldSubstitute = generatePasswordHelper(elementRef); // Construct the helper input.
        elementRef.after(passFieldSubstitute); // Place the helper immediately after the actual password field.

        (elementRef.val() === '') ? elementRef.hide() : passFieldSubstitute.hide(); // Initial display state based on value.

        jq(elementRef).blur(function(evt) { // When the password field loses input focus.
            if (elementRef.val() !== '') return; // If there's content, do nothing.
            elementRef.hide(); // Conceal the password input.
            passFieldSubstitute.show(); // Reveal the placeholder substitute.
        });

        jq(passFieldSubstitute).focus(function(evt) { // When the placeholder substitute gains input focus.
            elementRef.show().focus(); // Make the password field visible and transfer focus to it.
            passFieldSubstitute.hide(); // Hide the placeholder substitute.
        });
    }

    /**
     * Creates and configures a new text input element to serve as a placeholder for a password field.
     *
     * @param {jQuery} elementRef The jQuery object of the original password input.
     * @returns {jQuery} A newly created jQuery input element configured for placeholder display.
     */
    function generatePasswordHelper(elementRef) {
        return jq('<input>').attr({
            placeholder: elementRef.attr('placeholder'), // Inherit the placeholder attribute.
            value: elementRef.attr('placeholder'),       // Set the initial value to the placeholder text.
            id: elementRef.attr('id') + '-ph',           // Assign a unique ID to prevent conflicts.
            readonly: true                               // Make this helper input non-editable.
        }).addClass(elementRef.attr('class'));           // Copy CSS classes from the original element.
    }

    /**
     * Prior to form submission, this routine clears any placeholder values from input fields
     * that have not been actively modified by the user.
     *
     * @param {jQuery} formElement The jQuery object representing the form being submitted.
     */
    function resetFormPlaceholders(formElement) {
        formElement.find(':input[placeholder]').each(function() {
            var currentField = jq(this); // Store reference to the current input element.
            if (currentField.data('wasModified') === true) return; // Skip if the user has changed the field's content.
            if (currentField.val() === currentField.attr('placeholder')) currentField.val(''); // Clear the value if it still matches the placeholder.
        });
    }

})(jQuery);