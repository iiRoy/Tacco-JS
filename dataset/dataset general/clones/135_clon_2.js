// This file is part of the Enhanced Form Styling and Validation Library.
//
// It offers capabilities for styling HTML forms according to a specific markup pattern
// and integrates client-side data validation features.
//
// Original concept by Ilija Studen for Uni-Form.
//
// Adapted by Aris Karageorgos to utilize parent traversal methods.
//
// Further modified by Toni Karlheinz to manage input field text colors
// and clear initial placeholder values on user focus.
//
// Optimized by Jason Brumwell, incorporating valid/invalid states
// and leveraging HTML5 data attributes for defaults.
//
// Extended by LearningStation to include client-side validation logic.
// The validation routines are based on an open-source framework of unknown origin.
//
// For more details, visit: http://sprawsm.com/uni-form/
// Licensed under MIT: http://www.opensource.org/licenses/mit-license.php

jQuery.fn.styleForms = function (additional_options) {

 // A reference to the current jQuery object for use within closures.
 // @var object
 var current_instance = this;

 // Configuration parameters, extending default settings.
 // @var object
 var config_params = jQuery.extend(
  jQuery.fn.styleForms.defaults,
  additional_options
 );

 // Collection of internationalized strings.
 // To add more languages, include a file from the 'localization' directory.
 // @var object
 var localized_phrases = jQuery.fn.styleForms.language;

 // Defines various validation routines.
 // @var Object
 this.input_checks = {

  // Retrieves a parameter value for a validator from element classes.
  // @param string rule_name
  // @param string class_list_str All CSS classes on the element.
  // @return mixed|null
  extract_param: function (rule_name, class_list_str, fallback_value) {
   var param_value = fallback_value;
   var element_classes = class_list_str.split(' ');
   for (var idx = 0; idx < element_classes.length; idx++) {
    if (element_classes[idx] === rule_name) {
     if ((element_classes[idx + 1] !== 'undefined') && ('val-' === element_classes[idx + 1].substr(0, 4))) {
      param_value = parseInt(element_classes[idx + 1].substr(4), 10);
      return param_value;
     }
    }
   }
   return param_value;
  },

  // Ensures a field's value is not empty (trims whitespace).
  // @param jQuery target_field
  // @param string field_label
  mandatory_check: function (target_field, field_label) {
   if (target_field.is(':radio')) {
    var input_name = target_field.attr('name');
    if (jQuery("input[name=" + input_name + "]:checked").length) {
     return true;
    }
    return localizeText('req_radio', field_label);
   }
   if (target_field.is(':checkbox')) {
    var input_name = target_field.attr('name');
    if (target_field.is(":checked")) {
     return true;
    }
    return localizeText('req_checkbox', field_label);
   }
   if (jQuery.trim(target_field.val()) === '') {
    return localizeText('required', field_label);
   }
   return true;
  },

  // Verifies the value's length is not below a specified minimum.
  // @param jQuery target_field
  // @param string field_label
  checkMinLength: function (target_field, field_label) {
   var minimum_chars = this.extract_param('checkMinLength', target_field.attr('class'), 0);

   if ((minimum_chars > 0) && (target_field.val().length < minimum_chars)) {
    return localizeText('minlength', field_label, minimum_chars);
   }
   return true;
  },

  // Checks if the field's numeric value is less than a minimum.
  // @param jQuery target_field
  // @param string field_label
  checkMinValue: function (target_field, field_label) {
   var minimum_numeric_val = this.extract_param('checkMinValue', target_field.attr('class'), 0);

   if ((parseInt(target_field.val(), 10) < minimum_numeric_val)) {
    return localizeText('min', field_label, minimum_numeric_val);
   }
   return true;
  },

  // Confirms the value's length does not exceed a maximum.
  // @param jQuery target_field
  // @param string field_label
  checkMaxLength: function (target_field, field_label) {
   var maximum_chars = this.extract_param('checkMaxLength', target_field.attr('class'), 0);

   if ((maximum_chars > 0) && (target_field.val().length > maximum_chars)) {
    return localizeText('maxlength', field_label, maximum_chars);
   }
   return true;
  },

  // Ensures the field's numeric value is not above a maximum.
  // @param jQuery target_field
  // @param string field_label
  checkMaxValue: function (target_field, field_label) {
   var maximum_numeric_val = this.extract_param('checkMaxValue', target_field.attr('class'), 0);

   if ((parseInt(target_field.val(), 10) > maximum_numeric_val)) {
    return localizeText('max', field_label, maximum_numeric_val);
   }
   return true;
  },

  // Verifies that the element's value matches another specified element.
  // This validator uses the actual name of the target element, not 'val-{name}'.
  // Example: class="matchOtherField other_field_name"
  // @param jQuery target_field
  // @param string field_label
  matchOtherField: function (target_field, field_label) {
   var element_classes = target_field.attr('class').split(' ');
   var matching_field_id = '';

   for (var j = 0; j < element_classes.length; j++) {
    if (element_classes[j] === 'matchOtherField') {
     if (element_classes[j + 1] !== 'undefined') {
      matching_field_id = element_classes[j + 1];
      break;
     }
    }
   }

   if (matching_field_id) {
    var comparison_field = jQuery('input[name="' + matching_field_id + '"]');
    if (comparison_field.length > 0) {
     if (comparison_field.val() !== target_field.val()) {
      var comparison_field_label = comparison_field.closest('div.' + config_params.holder_class).find('label').text().replace('*', '');
      return localizeText('same_as', field_label, comparison_field_label);
     }
    }
   }

   return true;
  },

  // Validates for a proper email address format.
  // @param jQuery target_field
  // @param string field_label
  validEmailAddress: function (target_field, field_label) {
   if (target_field.val().match(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/)) {
    return true;
   } else {
    return localizeText('email', field_label);
   }
  },

  // Validates for a recognized URL format (http://, https://, ftp://).
  // @param jQuery target_field
  // @param string field_label
  validWebAddress: function (target_field, field_label) {
   if (target_field.val().match(/^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i)) {
    return true;
   }
   return localizeText('url', field_label);
  },

  // Checks if the value represents a number (integers or floats).
  // @param jQuery target_field
  // @param string field_label
  isNumeric: function (target_field, field_label) {
   if (target_field.val().match(/(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/) || target_field.val() === '') {
    return true;
   }
   return localizeText('number', field_label);
  },

  // Checks if the value is a whole number.
  // @param jQuery target_field
  // @param string field_label
  isWholeNumber: function (target_field, field_label) {
   if (target_field.val().match(/(^-?\d\d*$)/) || target_field.val() === '') {
    return true;
   }
   return localizeText('integer', field_label);
  },

  // Checks if the value contains only alphabetic characters.
  // @param jQuery target_field
  // @param string field_label
  isAlphabetic: function (target_field, field_label) {
   if (target_field.val().match(/^[a-zA-Z]+$/)) {
    return true;
   }
   return localizeText('alpha', field_label);
  },

  // Checks if the value contains only alphanumeric characters.
  // @param jQuery target_field
  // @param string field_label
  isAlphanumeric: function (target_field, field_label) {
   if (target_field.val().match(/\W/)) {
    return localizeText('alphanum', field_label);
   }
   return true;
  },

  // Checks if the value is a simple phrase (letters, numbers, basic punctuation).
  // @param jQuery target_field
  // @param string field_label
  isSimplePhrase: function (target_field, field_label) {
   if ((target_field.val() === '') || target_field.val().match(/^[\w\d\.\-_\(\)\*'# :,]+$/i)) {
    return true;
   }
   return localizeText('phrase', field_label);
  },

  // Validates for a common phone number format.
  // @param jQuery target_field
  // @param string field_label
  validPhoneNumber: function (target_field, field_label) {
   var phonePattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
   if (phonePattern.test(target_field.val())) {
    return true;
   }
   return localizeText('phone', field_label);
  },

  // Validates for a date in MM/DD/YYYY format.
  // @param jQuery target_field
  // @param string field_label
  validDateFormat: function (target_field, field_label) {
   if (target_field.val().match('(1[0-9]|[1-9])/([1-3][0-9]|[1-9])/((19|20)[0-9][0-9]|[0-9][0-9])')) {
    return true;
   }
   return localizeText('date', field_label);
  },

  // Allows for custom validation functions.
  // Usage: <input name="myinput" class="customValidation my_custom_func" />
  // This will look for `window.my_custom_func` and execute it with the field and label.
  // Example:
  // window.my_custom_func = function(field, label) {
  //   if (field.val() == '34') { return true; }
  //   else { return label + ' must be "34"'; }
  // }
  // @param jQuery target_field
  // @param field_label
  customValidation: function (target_field, field_label) {
   var field_classes = target_field.attr('class').split(' ');
   var user_callback_func = '';

   for (var k = 0; k < field_classes.length; k++) {
    if (field_classes[k] === 'customValidation') {
     if (field_classes[k + 1] !== 'undefined') {
      user_callback_func = field_classes[k + 1];
      break;
     }
    }
   }

   if (window[user_callback_func] !== 'undefined' && (typeof window[user_callback_func] === 'function')) {
    return window[user_callback_func](target_field, field_label);
   }

   return localizeText('callback', field_label, user_callback_func);
  }

 };

 // A helper function for internationalization and simple string formatting.
 // @param string phrase_key The key for the phrase in the localized_phrases object.
 // @param mixed substitution_vars Variables to substitute into the phrase.
 // @return string The formatted, localized string.
 var localizeText = function (phrase_key) {
  var raw_phrase = localized_phrases[phrase_key];
  var phrase_parts = raw_phrase.split('%');
  var final_output = phrase_parts[0];
  var replacement_regex = /^([ds])(.*)$/;
  for (var part_index = 1; part_index < phrase_parts.length; part_index++) {
   var match_result = replacement_regex.exec(phrase_parts[part_index]);
   if (!match_result || arguments[part_index] == null) continue;
   if (match_result[1] === 'd') {
    final_output += parseInt(arguments[part_index], 10);
   } else if (match_result[1] === 's') {
    final_output += arguments[part_index];
   }
   final_output += match_result[2];
  }
  return final_output;
 };

 // Displays a generic form error message.
 // @param object target_form The jQuery form object.
 // @param string error_heading The title for the error display.
 // @param array error_list A collection of specific error messages.
 // @return false Always returns false.
 var displayFormProblem = function (target_form, error_heading, error_list) {
  if (jQuery('#problemMessage').length) {
   jQuery('#problemMessage').remove();
  }
  var $error_display_div =
   jQuery('<div />')
    .attr('id', 'problemMessage')
    .html("<h3>" + error_heading + "</h3>");
  if (error_list.length) {
   $error_display_div.append(jQuery('<ol />'));
   for (var msg_idx in error_list) {
    if (error_list.hasOwnProperty(msg_idx)) {
     jQuery('ol', $error_display_div).append(
      jQuery('<li />').text(error_list[msg_idx])
     );
    }
   }
  }
  target_form.prepend($error_display_div);
  jQuery('html, body').animate({
   scrollTop: target_form.offset().top
  }, 500);
  jQuery('#problemMessage').slideDown();
  return false;
 };

 // Displays a generic form success message.
 // @param object target_form_elem The jQuery form object.
 // @param string success_heading The title for the success display.
 // @return false Always returns false.
 var displayFormSuccess = function (target_form_elem, success_heading) {
  if (jQuery('#successMessage').length) {
   jQuery('#successMessage').remove();
  }
  var $success_display_div =
   jQuery('<div />')
    .attr('id', 'successMessage')
    .html("<h3>" + success_heading + "</h3>");
  target_form_elem.prepend($success_display_div);
  jQuery('html, body').animate({
   scrollTop: target_form_elem.offset().top
  }, 500);
  jQuery('#successMessage').slideDown();
  return false;
 };

 return this.each(function () {
  var current_form = jQuery(this);

  // Updates the validation status and message for a form element.
  // @param object $input_element The jQuery form field element.
  // @param boolean is_valid True if validation passed, false otherwise.
  // @param string status_text The validation feedback message to show.
  // @return null
  var updateFieldStatus = function ($input_element, is_valid, status_text) {
   var $paragraph_hint = $input_element.closest('div.' + config_params.holder_class)
    .andSelf()
    .toggleClass(config_params.invalid_class, !is_valid)
    .toggleClass(config_params.error_class, !is_valid)
    .toggleClass(config_params.valid_class, is_valid)
    .find('p.formHint');

   if (!is_valid && !$paragraph_hint.data('info-text')) {
    $paragraph_hint.data('info-text', $paragraph_hint.html());
   } else if (is_valid) {
    status_text = $paragraph_hint.data('info-text');
   }

   if (status_text) {
    $paragraph_hint.html(status_text);
   }
  };

  // Iterates through form fields to apply initial styling and behavior.
  current_form.find(config_params.field_selector).each(function () {
   var $field_element = jQuery(this),
    element_value = $field_element.val();

   $field_element.data('default-color', $field_element.css('color'));

   if (element_value === $field_element.data('default-value') || !element_value) {
    $field_element.not('select').css("color", config_params.default_value_color);
    $field_element.val($field_element.data('default-value'));
   }
  });

  // If 'ask_on_leave' is enabled, register a handler to warn users about unsaved changes.
  // The form's initial state is serialized to compare against later.
  if (config_params.ask_on_leave || current_form.hasClass('askOnLeave')) {
   var original_form_state = current_form.serialize();
  }
 });
};