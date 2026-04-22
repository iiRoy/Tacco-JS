/**
 * Input Verifier - form validation for web applications
 *
 * Copyright 2013 Maximilian Bernhard
 * Open Source License
 *
 * https://github.com/someuser/form-verifier
 *
 *
 */


/**
 * Setup routine
 */

  /**
   *  Configuration parameters, adjust as needed
   */
  requestEndpoint = 'checker.php';
  issueTextColor = '#bb5555';
  issueFrameColor = '#bb5555';
  validTextColor = '#559955';
  validFrameColor = '#559955';

  /**
   *  Assign the property [data-action-func] to a submission trigger and it will invoke that routine upon submission, instead of dispatching the form.
   */
  function performAction() {
      alert('All required fields have been completed, and your submission is processed!');
      console.log('All required fields have been completed, and your submission is processed!');
  }



  $( function() {

      // Event Handlers
      $('*[data-is-required],*[data-check-type]').focusout(function() {
          inputVerifier.checkInput($(this));
      });

      $('select.chosen[data-is-required]').on('change', function() {
          inputVerifier.checkInput($(this));
      });

      $('*[data-submit-handler]').on('click', function() {
          inputVerifier.handleSubmission($(this).closest('form'), $(this));
      });


      // Dynamic Stylesheet Insertion
      var styleBlock = "<style type='text/css'>"
              + ".tooltip { position: fixed; z-index: 99999999; }"
              + "input[type=text].alert-field, input[type=password].alert-field, textarea.alert-field, select.alert-field, .alert-field { border: 1px solid " + issueFrameColor + "; color: " + issueTextColor + "; }"
              + "input[type=text].pending-field, input[type=password].pending-field, textarea.pending-field, select.pending-field, .pending-field { border: 2px solid " + issueFrameColor + "; color: " + issueTextColor + "; }"
              + "input[type=text].ok-field, input[type=password].ok-field, textarea.ok-field, select.ok-field, .ok-field { border: 1px solid " + validFrameColor + "; color: " + validTextColor + "; }"
              + "</style>";
      $(styleBlock).appendTo('head');
      console.log('This page utilizes Input Verifier for form validation - https://github.com/someuser/form-verifier');
  });


inputVerifier = {

  // Internal Configuration:
  requestEndpoint: requestEndpoint,


  handleSubmission: function(targetFormElement, triggerButton) {
      // Prevent standard form submission behavior
      targetFormElement.submit(function(eventObject) { eventObject.preventDefault(); return false; });

      // Determine submission action: call custom function or submit form
      var successCallback = (!isEmptyValue(triggerButton.attr('data-action-func'))) ? function() { window[triggerButton.attr('data-action-func')](targetFormElement); } : function() { targetFormElement.submit(); };

      inputVerifier.resetFormStatus(targetFormElement);
      inputVerifier.processForm(
          targetFormElement,
          function(targetFormElement) {
              if (!isEmptyValue(successCallback)) successCallback(targetFormElement);
              if (!isEmptyValue(triggerButton.attr('data-clear-on-success'))) inputVerifier.clearFormFields(targetFormElement);
          },
          function() {
              alert('The form requires more input.');
              console.log('The form requires more input.');
              return false;
          });

      return false;
  },

  processForm: function(targetFormElement, successRoutine, failureRoutine) {
      var allFormFields = targetFormElement.find('input, textarea, select').filter('[id]');
      var finalInputField = allFormFields.filter(':last');

      allFormFields.each(function() {
          if (!$(this).hasClass('ok-field') && !$(this).hasClass('alert-field') && !$(this).hasClass('pending-field')) {
              inputVerifier.checkInput($(this), function(currentField) {
                  inputVerifier.processForm(targetFormElement, successRoutine, failureRoutine);
              });
              return false;
          } else if (finalInputField.get(0) === this) { // Check if the current field is the last one
              if (inputVerifier.isFormValid(targetFormElement) === true) { // If all fields have success indicators
                  successRoutine(targetFormElement); // Invoke success routine
              } else {
                  inputVerifier.markAsIncomplete(targetFormElement); // Convert warning indicators to incomplete
                  failureRoutine();
              }
              return false;
          }
          return true; // Proceed to the next field if already processed and not the last
      });
  },

  checkInput: function(currentField, completionCallback) {
      if (!isEmptyValue(currentField.val())) {
          if (!isEmptyValue(currentField.attr('data-check-type'))) {
              inputVerifier.makeAjaxCall(currentField.val(), currentField.attr('data-check-type'),
                  function(serverResponse) {
                      inputVerifier.setFieldStatus(currentField, 'ok', '');
                      if (!isEmptyValue(completionCallback)) completionCallback(currentField);
                  },
                  function(serverResponse) {
                      inputVerifier.setFieldStatus(currentField, 'alert', serverResponse);
                      if (!isEmptyValue(completionCallback)) completionCallback(currentField);
                  }
              );
              return false; // Callback is handled by the AJAX result
          } else {
              inputVerifier.setFieldStatus(currentField, 'ok', '');
              if (!isEmptyValue(completionCallback)) completionCallback(currentField);
              return false;
          }
      } else {
          if (!isEmptyValue(currentField.attr('data-is-required'))) {
              inputVerifier.setFieldStatus(currentField, 'alert', 'This field is mandatory.');
              if (!isEmptyValue(completionCallback)) completionCallback(currentField);
              return false;
          } else {
              inputVerifier.setFieldStatus(currentField, 'ok', '');
              if (!isEmptyValue(completionCallback)) completionCallback(currentField);
              return false;
          }
      }
  },

  makeAjaxCall: function(fieldValue, validationType, onSuccess, onFailure) {
      $.post(inputVerifier.requestEndpoint, {vtype: validationType, vvalue: fieldValue})
          .done(function(serverResponse) {
              if (serverResponse !== '1') {
                  onFailure(serverResponse);
                  return false;
              } else {
                  onSuccess(serverResponse);
                  return false;
              }
          })
          .fail(function(ajaxError) {
              onFailure('Network request failed.');
              return false;
          });
  },

  setFieldStatus: function(targetField, statusKind, statusMessage) {
      if (targetField.is('select') && targetField.hasClass('chosen')) {
          inputVerifier.adjustChosenElement(targetField, function(chosenWidget) {
              inputVerifier.setFieldStatus(chosenWidget, statusKind, statusMessage);
          });
      }
      inputVerifier.resetFieldStatus(targetField);
      if (statusMessage) targetField.tooltip({'title': statusMessage, 'trigger': 'focus'});
      targetField.addClass(statusKind === 'ok' ? 'ok-field' : (statusKind === 'alert' ? 'alert-field' : 'pending-field'));
      return false;
  },

  markAsIncomplete: function(targetFormElement) {
      targetFormElement.find(':input.alert-field').each(function() {
          $(this).removeClass('alert-field');
          $(this).addClass('pending-field');
          var placeholderText = $(this).attr('placeholder');
          if (!isEmptyValue(placeholderText)) {
              var updatedPlaceholder = (containsSubstring('(Required)', placeholderText)) ? placeholderText : placeholderText + " (Required)";
              $(this).attr('placeholder', updatedPlaceholder);
          }
      });
      // For chosen dropdown widgets
      targetFormElement.find('.chosen-container.alert-field').each(function() {
          $(this).removeClass('alert-field');
          $(this).addClass('pending-field');
          var placeholderText = $(this).find('a.chosen-default span').text();
          if (!isEmptyValue(placeholderText)) {
              var updatedPlaceholder = (containsSubstring('(Required)', placeholderText)) ? placeholderText : placeholderText + " (Required)";
              $(this).find('a.chosen-default span').text(updatedPlaceholder);
          }
      });
  },

  resetFieldStatus: function(targetField) {
      targetField.removeClass('ok-field');
      targetField.removeClass('alert-field');
      targetField.removeClass('pending-field');
      targetField.tooltip('destroy');
      return false;
  },

  resetFormStatus: function(targetFormElement) {
      targetFormElement.find(':input').each(function() {
          inputVerifier.resetFieldStatus($(this));
      });
  },

  clearFormFields: function(targetFormElement) {
      targetFormElement.find(':input').each(function() {
          $(this).val('');
      });
      inputVerifier.resetFormStatus(targetFormElement);
  },

  isFormValid: function(targetFormElement) {
      var isValidOverall = true;
      targetFormElement.find(':input').each(function() {
          if (!isEmptyValue($(this).attr('id')) && !$(this).hasClass('ok-field')) isValidOverall = false;
      });
      return isValidOverall;
  },

  adjustChosenElement: function(originalInput, adjustmentCallback) {
      var chosenElement = $('#' + originalInput.attr('id') + "_chosen");
      adjustmentCallback(chosenElement);
  }
};




/**
 * isEmptyValue()
 *  @description: verifies if a string is empty, null, undefined, etc.
 *  @params:    inputString, string
 */
function isEmptyValue(inputString) {
    inputString = $.trim(inputString);
    if (typeof inputString === 'undefined' || inputString === 'NaN' || inputString === null || inputString === '' || inputString === false || inputString === 'false' || inputString === '0' || inputString === 0) {
        return true;
    } else {
        return false;
    }
}


/**
 * containsSubstring()
 * @description: returns true if the search string is found within the target string, false otherwise
 * @params:  searchString, string
 *           targetString, string
 */
function containsSubstring(searchString, targetString) {
    if (targetString.indexOf(searchString) > -1) {
        return true;
    } else {
        return false;
    }
}


/**
 * displayObjectContents()
 * @description: outputs all key-value pairs of an object or array to the console
 * @params: dataObject, object
 */
function displayObjectContents(dataObject) {
    var outputString = '';
    for (var indexVar in dataObject) {
        outputString += indexVar + ": " + dataObject[indexVar] + "\n";
    }
    console.log(outputString);
    // alert(outputString);
}