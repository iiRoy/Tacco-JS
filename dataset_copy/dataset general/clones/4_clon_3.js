/* ========================================================================
 * Form Guardian (module): validation-engine.js v1.0.0
 * ========================================================================
 * The MIT License (MIT)
 *
 * Copyright (c) 2023 Acme Corp.
 * Developed by @CodeCrafter in the spirit of robust client-side validation
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
 * LIABILITY, WHETHER IN AN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * ======================================================================== */

+function ($) {
  'use strict';

  // Defines the universal selector for interactive form elements that require validation.
  var formControlSelector = ':input:not([type="submit"], button, [type="hidden"]):enabled:visible';

  // FORM GUARDIAN CORE CLASS DEFINITION
  // ===================================

  var FormGuardian = function (domElement, componentOptions) {
    // Store the jQuery-wrapped form element and its configuration.
    this.targetElement = $(domElement);
    this.configuration = componentOptions;

    // Ensure error messages are properly merged with defaults.
    this.configuration.errorMessages = $.extend(
      {},
      FormGuardian.DEFAULT_CONFIG.errorMessages,
      this.configuration.errorMessages
    );

    // Validate custom validation rules for existence of error messages.
    Object.keys(this.configuration.customRules).forEach(function (ruleName) {
      if (!this.configuration.errorMessages[ruleName]) {
        throw new Error('FormGuardian: Missing default feedback message for custom rule: ' + ruleName);
      }
    }.bind(this)); // Bind 'this' to the FormGuardian instance

    // Merge custom validation rules into the global rule set.
    $.extend(FormGuardian.RULE_SET, this.configuration.customRules);

    // Disable native browser validation to prevent conflicts.
    if (!this.targetElement.attr('novalidate')) {
      this.targetElement.attr('novalidate', true);
    }

    // Initialize the state of the form's submission button.
    this.manageSubmissionButtonState();

    // Attach event listeners for real-time validation feedback.
    this.targetElement.on('input.fg.check change.fg.check focusout.fg.check', this.processInputEvaluation.bind(this));
    this.targetElement.on('submit.fg.check', this.handleFormSubmission.bind(this));

    // Handle 'data-match' attributes to trigger re-validation on related inputs.
    this.targetElement.find('[data-match-target]').each(function () {
      var currentInput = $(this);
      var matchTargetId = currentInput.data('match-target');
      var matchedElement = $(matchTargetId); // Use the data attribute as a selector

      if (matchedElement.length) {
        matchedElement.on('input.fg.check', function () {
          // Trigger validation on the current input if it has a value,
          // ensuring the match rule is re-evaluated.
          if (currentInput.val()) {
            currentInput.trigger('input.fg.check');
          }
        });
      }
    });

    // Mark the instance as initialized.
    this.isInitialized = true;
  };

  // Default configuration settings for FormGuardian instances.
  FormGuardian.DEFAULT_CONFIG = {
    evaluationDelay: 500, // Delay in ms before triggering validation for some events.
    allowHtmlInMessages: false, // Whether error messages can contain HTML.
    disableSubmitButton: true, // If true, submit button is disabled when form is invalid.
    customRules: {}, // Placeholder for user-defined validation rules.
    errorMessages: { // Standard error messages.
      valueMatch: 'Values do not match',
      minimumLength: 'Input is too short'
    },
    feedbackClasses: { // CSS classes for success and error states.
      success: 'icon-valid',
      error: 'icon-invalid'
    }
  };

  // Collection of validation rules.
  FormGuardian.RULE_SET = {
    // Native browser validation check.
    browserNative: function (inputElement) {
      var domInput = inputElement[0];
      return domInput.checkValidity ? domInput.checkValidity() : true;
    },
    // Checks if an input's value matches another element's value.
    valueMatch: function (inputElement) {
      var targetSelector = inputElement.data('match-target');
      var targetElement = $(targetSelector);
      // Only validate if target exists and input has a value.
      if (!targetElement.length || !inputElement.val()) {
        return true;
      }
      return inputElement.val() === targetElement.val();
    },
    // Checks if an input's value meets a minimum length requirement.
    minimumLength: function (inputElement) {
      var requiredLength = inputElement.data('minlength-value'); // Renamed data attribute
      // Only validate if input has a value and a minimum length is defined.
      if (!inputElement.val() || requiredLength === undefined) {
        return true;
      }
      return inputElement.val().length >= requiredLength;
    }
  };

  // Handles the validation process for a single input element.
  FormGuardian.prototype.processInputEvaluation = function (triggerEvent) {
    var currentInput = $(triggerEvent.target); // The input element that triggered the event.
    var previousErrors = currentInput.data('fg.validationErrors'); // Previous errors for this input.
    var currentValidationErrors;

    // Special handling for radio buttons: validate the entire group.
    if (currentInput.is('[type="radio"]')) {
      currentInput = this.targetElement.find('input[name="' + currentInput.attr('name') + '"]');
    }

    // Trigger a custom event before validation begins.
    var preValidationEvent = $.Event('prevalidate.fg.check', { relatedTarget: currentInput[0] });
    this.targetElement.trigger(preValidationEvent);

    // Abort validation if a listener prevented the default action.
    if (preValidationEvent.isDefaultPrevented()) {
      return;
    }

    var selfReference = this; // Capture 'this' for use in callback.

    // Execute all relevant validation rules for the input.
    this.executeValidationRules(currentInput).done(function (retrievedErrors) {
      currentInput.data('fg.validationErrors', retrievedErrors);
      currentValidationErrors = retrievedErrors;

      // Display or clear error messages based on validation results.
      if (currentValidationErrors.length > 0) {
        selfReference.displayFeedbackMessages(currentInput);
      } else {
        selfReference.removeFeedbackMessages(currentInput);
      }

      // Trigger specific events based on changes in validation status.
      if (!previousErrors || currentValidationErrors.join(',') !== previousErrors.join(',')) {
        var postValidationEvent;
        if (currentValidationErrors.length > 0) {
          postValidationEvent = $.Event('invalid.fg.check', {
            relatedTarget: currentInput[0],
            detail: currentValidationErrors
          });
        } else {
          postValidationEvent = $.Event('valid.fg.check', {
            relatedTarget: currentInput[0],
            detail: previousErrors
          });
        }
        selfReference.targetElement.trigger(postValidationEvent);
      }

      // Update the submission button's state.
      selfReference.manageSubmissionButtonState();

      // Trigger a final event indicating validation completion.
      selfReference.targetElement.trigger($.Event('postvalidate.fg.check', { relatedTarget: currentInput[0] }));
    });
  };

  // Executes all applicable validation rules for a given input element.
  FormGuardian.prototype.executeValidationRules = function (inputElement) {
    var encounteredErrors = [];
    var asyncValidationDeferred = $.Deferred();
    var currentConfig = this.configuration;

    // Reject any pending deferred objects for this input to prevent race conditions.
    var existingDeferred = inputElement.data('fg.asyncValidation');
    if (existingDeferred && existingDeferred.state() === 'pending') {
      existingDeferred.reject('New validation initiated.');
    }
    inputElement.data('fg.asyncValidation', asyncValidationDeferred);

    // Helper function to retrieve the appropriate error message.
    var retrieveErrorMessage = function (ruleKey) {
      // Prioritize data attributes on the element, then global config.
      var elementSpecificError = inputElement.data(ruleKey + '-error') || inputElement.data('error-message');
      if (elementSpecificError) {
        return elementSpecificError;
      }
      // For native browser validation, use its message if available.
      if (ruleKey === 'browserNative' && inputElement[0].validationMessage) {
        return inputElement[0].validationMessage;
      }
      // Fallback to configured error messages.
      return currentConfig.errorMessages[ruleKey];
    };

    // Iterate through all defined validation rules.
    Object.entries(FormGuardian.RULE_SET).forEach(function ([ruleKey, validationFunction]) {
      // Check if the rule is applicable (data attribute exists or it's the native rule)
      // and if the validation function returns false (meaning an error).
      var isRuleApplicable = (inputElement.data(ruleKey) !== undefined || ruleKey === 'browserNative' || inputElement.data(ruleKey + '-value') !== undefined);
      if (isRuleApplicable && !validationFunction.call(this, inputElement)) {
        var errorMessage = retrieveErrorMessage(ruleKey);
        if (errorMessage && !encounteredErrors.includes(errorMessage)) {
          encounteredErrors.push(errorMessage);
        }
      }
    }.bind(this)); // Ensure 'this' refers to FormGuardian instance within the loop.

    // Handle remote validation if no local errors and input has a value.
    if (encounteredErrors.length === 0 && inputElement.val() && inputElement.data('remote-validation-url')) {
      this.scheduleDelayedAction(inputElement, function () {
        var requestData = {};
        requestData[inputElement.attr('name')] = inputElement.val();
        var remoteUrl = inputElement.data('remote-validation-url');

        $.ajax({
          url: remoteUrl,
          data: requestData,
          method: 'GET', // Or POST, depending on implementation
          dataType: 'json' // Expect JSON response
        })
          .done(function (response) {
            // Assuming remote endpoint returns { isValid: true/false, message: "..." }
            if (response && response.isValid === false) {
              var remoteErrorMessage = retrieveErrorMessage('remote') || response.message || 'Remote validation failed.';
              if (!encounteredErrors.includes(remoteErrorMessage)) {
                encounteredErrors.push(remoteErrorMessage);
              }
            }
          })
          .fail(function (jqXHR, textStatus, errorThrown) {
            var remoteErrorMessage = retrieveErrorMessage('remote') || errorThrown || 'Remote server error.';
            if (!encounteredErrors.includes(remoteErrorMessage)) {
              encounteredErrors.push(remoteErrorMessage);
            }
          })
          .always(function () {
            asyncValidationDeferred.resolve(encounteredErrors);
          });
      });
    } else {
      asyncValidationDeferred.resolve(encounteredErrors);
    }

    return asyncValidationDeferred.promise();
  };

  // Triggers validation on all form controls immediately.
  FormGuardian.prototype.triggerAllValidations = function () {
    var originalDelay = this.configuration.evaluationDelay;

    // Temporarily set delay to 0 for immediate validation.
    this.configuration.evaluationDelay = 0;
    this.targetElement.find(formControlSelector).trigger('input.fg.check');
    // Restore original delay.
    this.configuration.evaluationDelay = originalDelay;

    return this; // Allow method chaining.
  };

  // Displays validation feedback messages for a specific input element.
  FormGuardian.prototype.displayFeedbackMessages = function (inputElement) {
    var contentMethod = this.configuration.allowHtmlInMessages ? 'html' : 'text';
    var selfReference = this; // Capture 'this' for the callback scope.

    this.scheduleDelayedAction(inputElement, function () {
      var formGroup = inputElement.closest('.form-group');
      var feedbackBlock = formGroup.find('.help-block.with-errors');
      var feedbackIcon = formGroup.find('.form-control-feedback');
      var inputErrors = inputElement.data('fg.validationErrors');

      if (!inputErrors || inputErrors.length === 0) {
        return; // No errors to display.
      }

      // Store original content if not already done.
      if (feedbackBlock.data('fg.originalContent') === undefined) {
        feedbackBlock.data('fg.originalContent', feedbackBlock.html());
      }

      // Construct the error list.
      var errorList = $('<ul/>')
        .addClass('list-unstyled')
        .append(inputErrors.map(function (msg) {
          return $('<li/>')[contentMethod](msg);
        }));

      // Update feedback block and group classes.
      feedbackBlock.empty().append(errorList);
      formGroup.addClass('has-error');

      // Update feedback icon classes if present.
      if (feedbackIcon.length) {
        feedbackIcon.removeClass(this.configuration.feedbackClasses.success);
        feedbackIcon.addClass(this.configuration.feedbackClasses.error);
        formGroup.removeClass('has-success');
      }
    });
  };

  // Removes validation feedback messages for a specific input element.
  FormGuardian.prototype.removeFeedbackMessages = function (inputElement) {
    var formGroup = inputElement.closest('.form-group');
    var feedbackBlock = formGroup.find('.help-block.with-errors');
    var feedbackIcon = formGroup.find('.form-control-feedback');

    // Restore original content to the feedback block.
    var originalContent = feedbackBlock.data('fg.originalContent');
    if (originalContent !== undefined) {
      feedbackBlock.html(originalContent);
      feedbackBlock.removeData('fg.originalContent'); // Clean up stored data.
    } else {
      feedbackBlock.empty(); // If no original content, just clear it.
    }

    formGroup.removeClass('has-error');

    // Update feedback icon classes if present.
    if (feedbackIcon.length) {
      feedbackIcon.removeClass(this.configuration.feedbackClasses.error);
      feedbackIcon.addClass(this.configuration.feedbackClasses.success);
      formGroup.addClass('has-success');
    } else {
      // If no feedback icon, still add success class to group if it's not already there.
      if (!formGroup.hasClass('has-success')) {
        formGroup.addClass('has-success');
      }
    }
  };

  // Checks if any form control in the form currently has validation errors.
  FormGuardian.prototype.containsErrors = function () {
    var checkFieldErrors = function () {
      var errorsForField = $(this).data('fg.validationErrors');
      return !!(errorsForField && errorsForField.length > 0);
    };

    return !!this.targetElement.find(formControlSelector).filter(checkFieldErrors).length;
  };

  // Checks if any required form control is currently incomplete (empty or unchecked).
  FormGuardian.prototype.hasMissingRequiredInputs = function () {
    var checkFieldIncomplete = function () {
      var inputElement = $(this);
      if (!inputElement.is('[required]')) {
        return false; // Only check required fields.
      }

      var inputType = this.type;
      if (inputType === 'checkbox') {
        return !this.checked;
      } else if (inputType === 'radio') {
        return !$('[name="' + this.name + '"]:checked', inputElement.closest('form')).length;
      } else {
        return $.trim(this.value) === '';
      }
    };

    return !!this.targetElement.find(formControlSelector).filter('[required]').filter(checkFieldIncomplete).length;
  };

  // Handles the form submission event, performing final validation.
  FormGuardian.prototype.handleFormSubmission = function (submitEvent) {
    this.triggerAllValidations(); // Run full validation on all fields.

    // Prevent form submission if there are any errors or incomplete required fields.
    if (this.hasMissingRequiredInputs() || this.containsErrors()) {
      submitEvent.preventDefault();
    }
  };

  // Manages the disabled/enabled state of the form's submission button.
  FormGuardian.prototype.manageSubmissionButtonState = function () {
    if (!this.configuration.disableSubmitButton) {
      return; // If disabling is not configured, do nothing.
    }

    var formId = this.targetElement.attr('id');
    var submitButtons = $('button[type="submit"], input[type="submit"]');

    // Filter submit buttons that are explicitly linked to this form via 'form' attribute,
    // or are direct children of this form.
    var relevantButtons = submitButtons
      .filter(`[form="${formId}"]`)
      .add(this.targetElement.find('input[type="submit"], button[type="submit"]'));

    var shouldDisable = this.hasMissingRequiredInputs() || this.containsErrors();

    relevantButtons.toggleClass('disabled', shouldDisable);

    // Override pointer-events for disabled buttons to ensure mouse events are still captured
    // (e.g., for tooltips, or if the disabled state is visual only).
    relevantButtons.css({ 'pointer-events': 'all', 'cursor': shouldDisable ? 'not-allowed' : 'pointer' });
  };

  // Schedules a callback function to be executed after a specified delay.
  FormGuardian.prototype.scheduleDelayedAction = function (inputElement, actionCallback) {
    var boundCallback = actionCallback.bind(this); // Ensure callback runs in context of FormGuardian.
    var delayValue = this.configuration.evaluationDelay;

    if (!delayValue) {
      return boundCallback(); // Execute immediately if no delay.
    }

    // Clear any existing timeout for this element to prevent multiple executions.
    var existingTimeout = inputElement.data('fg.actionTimeout');
    if (existingTimeout) {
      window.clearTimeout(existingTimeout);
    }

    // Set a new timeout and store its ID.
    var newTimeout = window.setTimeout(boundCallback, delayValue);
    inputElement.data('fg.actionTimeout', newTimeout);
  };

  // Cleans up the FormGuardian instance, removing event listeners and data.
  FormGuardian.prototype.disposeInstance = function () {
    this.targetElement
      .removeAttr('novalidate')
      .removeData('fg.instance') // Remove instance data.
      .off('.fg.check'); // Unbind all namespaced events.

    // Clean up data and events on individual form controls.
    this.targetElement.find(formControlSelector)
      .off('.fg.check')
      .removeData(['fg.validationErrors', 'fg.asyncValidation'])
      .each(function () {
        var currentControl = $(this);
        var controlTimeout = currentControl.data('fg.actionTimeout');
        if (controlTimeout) {
          window.clearTimeout(controlTimeout);
          currentControl.removeData('fg.actionTimeout');
        }
      });

    // Restore original content to help blocks.
    this.targetElement.find('.help-block.with-errors').each(function () {
      var helpBlock = $(this);
      var storedOriginalContent = helpBlock.data('fg.originalContent');

      if (storedOriginalContent !== undefined) {
        helpBlock
          .removeData('fg.originalContent')
          .html(storedOriginalContent);
      } else {
        helpBlock.empty(); // If no original content, just clear it.
      }
    });

    // Ensure submit buttons are re-enabled.
    this.targetElement.find('input[type="submit"], button[type="submit"]').removeClass('disabled');

    // Remove validation-related classes from form groups.
    this.targetElement.find('.has-error, .has-success').removeClass('has-error has-success');

    // Remove the `isInitialized` flag.
    delete this.isInitialized;

    return this; // Allow method chaining.
  };

  // FORM GUARDIAN JQUERY PLUGIN DEFINITION
  // ======================================

  function formGuardianPlugin(methodOption) {
    return this.each(function () {
      var currentElement = $(this);
      // Merge defaults with element data attributes and user-provided options.
      var resolvedOptions = $.extend(
        {},
        FormGuardian.DEFAULT_CONFIG,
        currentElement.data(),
        typeof methodOption === 'object' && methodOption
      );
      var instanceData = currentElement.data('fg.instance');

      // If 'dispose' method is called and no instance exists, do nothing.
      if (!instanceData && methodOption === 'dispose') {
        return;
      }

      // If no instance exists, create a new one.
      if (!instanceData) {
        instanceData = new FormGuardian(this, resolvedOptions);
        currentElement.data('fg.instance', instanceData);
      }

      // If a string method is passed, call it on the instance.
      if (typeof methodOption === 'string' && instanceData[methodOption]) {
        instanceData[methodOption]();
      } else if (typeof methodOption === 'string' && !instanceData[methodOption]) {
        console.error(`FormGuardian: Method "${methodOption}" does not exist on the instance.`);
      }
    });
  }

  var priorPluginReference = $.fn.formGuardian; // Store original plugin reference.

  $.fn.formGuardian = formGuardianPlugin;
  $.fn.formGuardian.Constructor = FormGuardian;


  // FORM GUARDIAN NO CONFLICT MODE
  // ==============================

  $.fn.formGuardian.noConflict = function () {
    $.fn.formGuardian = priorPluginReference;
    return this;
  };


  // FORM GUARDIAN DATA-API AUTO-INITIALIZATION
  // ==========================================

  // Automatically initialize FormGuardian on forms with `data-validate-form="guardian"`
  // when the DOM is fully loaded (or window load for full resources).
  $(window).on('load', function () {
    $('form[data-validate-form="guardian"]').each(function () {
      var targetForm = $(this);
      // Pass the form's data attributes as options for initialization.
      formGuardianPlugin.call(targetForm, targetForm.data());
    });
  });

}(jQuery);