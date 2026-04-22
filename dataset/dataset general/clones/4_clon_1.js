/*************************************************************************
 * Bootstrap (plugin): validator.js v0.8.1 - Type I Clone
 *************************************************************************
 * This is a Type I clone, meaning only whitespace and comments have been
 * altered. The functionality and structure remain identical to the original.
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Cina Saffary.
 * Made by @1000hz in the style of Bootstrap 3 era @fat
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *************************************************************************/


+function($) { // Immediately invoked function expression for plugin encapsulation

    'use strict'; // Enforce strict mode for cleaner code

    // Selector for input elements that should be validated
    var inputSelector = ':input:not([type="submit"], button):enabled:visible';


    // VALIDATOR CLASS DEFINITION
    // ==========================

    var Validator = function(element, options) {

        // Store the jQuery-wrapped element for later use
        this.$element = $(element);
        // Store the merged options
        this.options = options;

        // Extend default error messages with custom ones provided in options
        options.errors = $.extend({}, Validator.DEFAULTS.errors, options.errors);

        // Validate custom validators: ensure a default error message exists for each
        for (var custom in options.custom) {
            if (!options.errors[custom]) {
                throw new Error('Missing default error message for custom validator: ' + custom);
            }
        }

        // Merge custom validators into the main VALIDATORS object
        $.extend(Validator.VALIDATORS, options.custom);

        // Disable native browser validation to use custom validation logic
        this.$element.attr('novalidate', true);
        // Update the submit button state based on current validation status
        this.toggleSubmit();

        // Bind validation events to input fields
        this.$element.on('input.bs.validator change.bs.validator focusout.bs.validator', $.proxy(this.validateInput, this));
        // Bind submit event to the form
        this.$element.on('submit.bs.validator', $.proxy(this.onSubmit, this));

        // Handle 'data-match' attributes for password confirmation, etc.
        this.$element.find('[data-match]').each(function() {

            var $this = $(this);
            var target = $this.data('match'); // Get the target element selector

            // When the target input changes, trigger validation on the current input
            $(target).on('input.bs.validator', function(e) {
                // Only trigger if the current element has a value
                $this.val() && $this.trigger('input.bs.validator');
            });

        });

    };


    // DEFAULT OPTIONS FOR THE VALIDATOR
    // =================================

    Validator.DEFAULTS = {
        delay: 500, // Delay before validation check
        html: false, // Whether error messages should be interpreted as HTML
        disable: true, // Disable submit button if form is invalid
        custom: {}, // Custom validation rules
        errors: { // Default error messages
            match: 'Does not match',
            minlength: 'Not long enough'
        },
        feedback: { // CSS classes for feedback icons
            success: 'glyphicon-ok',
            error: 'glyphicon-warning-sign'
        }
    };


    // CORE VALIDATION FUNCTIONS
    // =========================

    Validator.VALIDATORS = {

        // Native HTML5 validation check
        native: function($el) {
            var el = $el[0];
            return el.checkValidity ? el.checkValidity() : true;
        },

        // 'data-match' validator: checks if value matches another input's value
        match: function($el) {
            var target = $el.data('match');
            // Return true if empty, or if values match
            return !$el.val() || $el.val() === $(target).val();
        },

        // 'data-minlength' validator: checks minimum length
        minlength: function($el) {
            var minlength = $el.data('minlength');
            // Return true if empty, or if length meets requirement
            return !$el.val() || $el.val().length >= minlength;
        }

    };


    // VALIDATOR PROTOTYPE METHODS
    // ===========================

    Validator.prototype.validateInput = function(e) {

        var $el = $(e.target);
        var prevErrors = $el.data('bs.validator.errors'); // Previously recorded errors
        var errors; // Current errors

        // If it's a radio button, validate all radio buttons in the group
        if ($el.is('[type="radio"]')) {
            $el = this.$element.find('input[name="' + $el.attr('name') + '"]');
        }

        // Trigger a 'validate' event before starting validation
        this.$element.trigger(e = $.Event('validate.bs.validator', {
            relatedTarget: $el[0]
        }));

        // If the event was prevented, stop validation
        if (e.isDefaultPrevented()) {
            return;
        }

        var self = this; // Cache 'this' for use in callbacks

        // Run all applicable validators and process the results
        this.runValidators($el).done(function(errors) {

            $el.data('bs.validator.errors', errors); // Store current errors

            // Show errors if any, otherwise clear them
            errors.length ? self.showErrors($el) : self.clearErrors($el);

            // Trigger 'invalid' or 'valid' event only if error status changed
            if (!prevErrors || errors.toString() !== prevErrors.toString()) {

                e = errors.length ?
                    $.Event('invalid.bs.validator', {
                        relatedTarget: $el[0],
                        detail: errors
                    }) :
                    $.Event('valid.bs.validator', {
                        relatedTarget: $el[0],
                        detail: prevErrors
                    });

                self.$element.trigger(e); // Trigger the appropriate event
            }

            self.toggleSubmit(); // Re-evaluate submit button state

            // Always trigger 'validated' event
            self.$element.trigger($.Event('validated.bs.validator', {
                relatedTarget: $el[0]
            }));

        });

    };


    // Executes all validators for a given input element
    Validator.prototype.runValidators = function($el) {

        var errors = [];
        var deferred = $.Deferred(); // For asynchronous validation (e.g., remote)
        var options = this.options;

        // Reject any pending deferred validation for this element
        $el.data('bs.validator.deferred') && $el.data('bs.validator.deferred').reject();
        // Store the new deferred object
        $el.data('bs.validator.deferred', deferred);

        // Helper function to get the correct error message
        function getErrorMessage(key) {
            // Priority: data-key-error > data-error > native message > default message
            return $el.data(key + '-error') ||
                $el.data('error') ||
                (key == 'native' && $el[0].validationMessage) ||
                options.errors[key];
        }

        // Iterate through all registered validators
        $.each(Validator.VALIDATORS, $.proxy(function(key, validator) {

            // Check if the validator applies to this element and if it fails
            if (($el.data(key) || key == 'native') && !validator.call(this, $el)) {
                var error = getErrorMessage(key);
                // Add error only if it's not already in the list
                !~errors.indexOf(error) && errors.push(error);
            }

        }, this));

        // Handle remote validation if no local errors and value is present
        if (!errors.length && $el.val() && $el.data('remote')) {

            this.defer($el, function() {

                var data = {};
                data[$el.attr('name')] = $el.val(); // Prepare data for remote request

                $.get($el.data('remote'), data)
                    .fail(function(jqXHR, textStatus, error) {
                        errors.push(getErrorMessage('remote') || error); // Add remote error
                    })
                    .always(function() {
                        deferred.resolve(errors); // Resolve deferred with errors
                    });

            });

        } else {
            deferred.resolve(errors); // Resolve immediately if no remote validation or errors exist
        }

        return deferred.promise(); // Return the promise object
    };


    // Validate all inputs in the form
    Validator.prototype.validate = function() {

        var delay = this.options.delay; // Store original delay

        this.options.delay = 0; // Temporarily set delay to 0 for immediate validation
        // Trigger input event on all relevant inputs to force validation
        this.$element.find(inputSelector).trigger('input.bs.validator');
        this.options.delay = delay; // Restore original delay

        return this; // Allow chaining
    };


    // Display validation errors for an element
    Validator.prototype.showErrors = function($el) {

        // Determine whether to use html() or text() for error messages
        var method = this.options.html ? 'html' : 'text';

        this.defer($el, function() {

            var $group = $el.closest('.form-group'); // Find the parent form group
            var $block = $group.find('.help-block.with-errors'); // Find the error message block
            var $feedback = $group.find('.form-control-feedback'); // Find feedback icon element
            var errors = $el.data('bs.validator.errors'); // Get stored errors

            if (!errors.length) {
                return; // No errors to show
            }

            // Format errors into an unordered list
            errors = $('<ul/>')
                .addClass('list-unstyled')
                .append($.map(errors, function(error) {
                    return $('<li/>')[method](error);
                }));

            // Store original content if not already stored
            if ($block.data('bs.validator.originalContent') === undefined) {
                $block.data('bs.validator.originalContent', $block.html());
            }

            $block.empty().append(errors); // Replace content with errors
            $group.addClass('has-error'); // Add error class to form group

            // Update feedback icon if present
            $feedback.length &&
                $feedback.removeClass(this.options.feedback.success) &&
                $feedback.addClass(this.options.feedback.error) &&
                $group.removeClass('has-success');

        });

    };


    // Clear validation errors for an element
    Validator.prototype.clearErrors = function($el) {

        var $group = $el.closest('.form-group');
        var $block = $group.find('.help-block.with-errors');
        var $feedback = $group.find('.form-control-feedback');

        // Restore original content of error block
        $block.html($block.data('bs.validator.originalContent'));
        $group.removeClass('has-error'); // Remove error class

        // Update feedback icon if present
        $feedback.length &&
            $feedback.removeClass(this.options.feedback.error) &&
            $feedback.addClass(this.options.feedback.success) &&
            $group.addClass('has-success');

    };


    // Check if the form or any input has validation errors
    Validator.prototype.hasErrors = function() {

        // Helper function to check if a field has errors
        function fieldErrors() {
            return !!($(this).data('bs.validator.errors') || []).length;
        }

        // Return true if any input field has errors
        return !!this.$element.find(inputSelector).filter(fieldErrors).length;
    };


    // Check if any required input field is incomplete
    Validator.prototype.isIncomplete = function() {

        // Helper function to check if a field is incomplete
        function fieldIncomplete() {
            return this.type === 'checkbox' ? !this.checked :
                this.type === 'radio' ? !$('[name="' + this.name + '"]:checked').length :
                $.trim(this.value) === '';
        }

        // Return true if any required input is incomplete
        return !!this.$element.find(inputSelector).filter('[required]').filter(fieldIncomplete).length;
    };


    // Form submission handler
    Validator.prototype.onSubmit = function(e) {

        this.validate(); // Run full form validation

        // Prevent default submission if form is incomplete or has errors
        if (this.isIncomplete() || this.hasErrors()) {
            e.preventDefault();
        }

    };


    // Toggles the disabled state of submit buttons
    Validator.prototype.toggleSubmit = function() {

        if (!this.options.disable) {
            return; // If disabling is not active, do nothing
        }

        // Find all submit buttons associated with this form
        var $btn = $('button[type="submit"], input[type="submit"]')
            .filter('[form="' + this.$element.attr('id') + '"]') // By form attribute
            .add(this.$element.find('input[type="submit"], button[type="submit"]')); // Within the form

        // Toggle 'disabled' class based on form validity
        $btn.toggleClass('disabled', this.isIncomplete() || this.hasErrors())
            .css({
                'pointer-events': 'all',
                'cursor': 'pointer'
            }); // Ensure cursor is normal even when disabled via JS

    };


    // Defers a callback execution with a delay
    Validator.prototype.defer = function($el, callback) {

        callback = $.proxy(callback, this); // Ensure callback context is correct
        if (!this.options.delay) {
            return callback(); // Execute immediately if no delay
        }

        // Clear any existing timeout for this element
        window.clearTimeout($el.data('bs.validator.timeout'));
        // Set a new timeout
        $el.data('bs.validator.timeout', window.setTimeout(callback, this.options.delay));

    };


    // Destroys the validator instance and cleans up DOM
    Validator.prototype.destroy = function() {

        this.$element
            .removeAttr('novalidate') // Remove novalidate attribute
            .removeData('bs.validator') // Remove stored validator instance
            .off('.bs.validator'); // Unbind all namespaced events

        this.$element.find(inputSelector)
            .off('.bs.validator') // Unbind events from inputs
            .removeData(['bs.validator.errors', 'bs.validator.deferred']) // Clear stored data
            .each(function() {
                var $this = $(this);
                var timeout = $this.data('bs.validator.timeout');
                // Clear any pending timeouts and remove data
                window.clearTimeout(timeout) && $this.removeData('bs.validator.timeout');
            });

        this.$element.find('.help-block.with-errors').each(function() {
            var $this = $(this);
            var originalContent = $this.data('bs.validator.originalContent');

            $this
                .removeData('bs.validator.originalContent') // Remove stored original content
                .html(originalContent); // Restore original content
        });

        // Re-enable submit buttons
        this.$element.find('input[type="submit"], button[type="submit"]').removeClass('disabled');

        // Remove error classes from form groups
        this.$element.find('.has-error').removeClass('has-error');

        return this; // Allow chaining
    };


    // VALIDATOR PLUGIN DEFINITION
    // ===========================


    function Plugin(option) {
        return this.each(function() {
            var $this = $(this);
            // Merge options: defaults, data attributes, and custom options
            var options = $.extend({}, Validator.DEFAULTS, $this.data(), typeof option == 'object' && option);
            var data = $this.data('bs.validator'); // Get existing validator instance

            // If destroy is called and no instance exists, do nothing
            if (!data && option == 'destroy') {
                return;
            }

            // If no instance, create a new one
            if (!data) {
                $this.data('bs.validator', (data = new Validator(this, options)));
            }

            // If option is a string, call the corresponding method
            if (typeof option == 'string') {
                data[option]();
            }
        });
    }

    var old = $.fn.validator; // Store the original $.fn.validator

    $.fn.validator = Plugin; // Assign the new plugin to jQuery
    $.fn.validator.Constructor = Validator; // Expose the Validator constructor


    // VALIDATOR NO CONFLICT
    // =====================

    $.fn.validator.noConflict = function() {
        $.fn.validator = old; // Restore original $.fn.validator
        return this; // Return the new plugin
    };


    // VALIDATOR DATA-API
    // ==================
    // Auto-initialize validator on forms with data-toggle="validator"

    $(window).on('load', function() {
        $('form[data-toggle="validator"]').each(function() {
            var $form = $(this);
            Plugin.call($form, $form.data()); // Call the plugin with form's data options
        });
    });


}(jQuery); // Pass jQuery as an argument