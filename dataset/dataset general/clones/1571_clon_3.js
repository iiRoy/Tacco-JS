(function(_jq) {
  // Ensure we have a jQuery/Zepto-like object to work with
  if (!_jq || typeof _jq.fn === 'undefined') {
    console.error('Floating label plugin requires jQuery or Zepto.');
    return;
  }

  'use strict';

  // Floating Label Input Manager
  // Version 2.1.0 - Adapted from an earlier variant, late 2023.
  // This script enhances form fields by transforming their placeholder or title attributes
  // into dynamic, floating labels.

  _jq.fn.floatLabel = function (options) {

    // Default configuration for the plugin
    var settings = _jq.extend({
      wrapperClass: 'input-wrapper-floater',
      labelClass: 'label-floater-text',
      activeClass: 'is-active',
      textAreaClass: 'multi-line-field',
      requiredClass: 'is-required-field',
      focusedClass: 'has-focus',
      dataProcessedAttr: 'data-float-label-processed'
    }, options);

    // Filter elements to process: standard text inputs, textareas, and selects.
    // Exclude submit buttons, hidden fields, and already processed elements.
    return this.filter('input:not([type=submit]):not([type=hidden]), textarea, select')
               .not('[' + settings.dataProcessedAttr + '="true"]') // Prevent re-processing
               .each(function() {

      var $currentField = _jq(this); // Reference to the current DOM element being processed
      var $labelElement; // Placeholder label element
      var uniqueFieldId; // Unique ID for the field and its associated label

      // --- Utility Functions (nested for scope encapsulation) ---

      // Function to extract suitable text for the floating label
      function retrieveLabelContent($element) {
        var potentialText = $element.attr('placeholder') || $element.attr('title');

        // If no placeholder or title, check for a data attribute
        if (!potentialText || potentialText.trim() === '') {
          potentialText = $element.data('float-label-text');
        }
        
        // Ensure we always return a string, even if empty
        return potentialText ? potentialText.trim() : 'Field Label';
      }

      // Function to assign a unique ID to the input element if it doesn't have one
      function assignUniqueFieldId($element) {
        var currentId = $element.attr('id');
        if (currentId) {
          return currentId;
        }

        // Generate a new, short, unique ID
        var newId = 'fl-' + Math.random().toString(36).substr(2, 6);
        // Basic check for existing ID (less robust than original, but simpler for clone)
        while (_jq('#' + newId).length) {
          newId = 'fl-' + Math.random().toString(36).substr(2, 6);
        }
        $element.attr('id', newId);
        return newId;
      }

      // Function to update the visual state of the floating label
      function updateLabelState() {
        var fieldValue = $currentField.val();
        var isEmpty = true;

        if (typeof fieldValue === 'string') {
          fieldValue = fieldValue.trim();
          isEmpty = (fieldValue === '');
        } else if ($currentField.is('select')) {
          // For select elements, consider it empty if the selected option's value
          // matches the placeholder text, or if no option is selected.
          var selectedOptionText = $currentField.find('option:selected').text();
          var initialLabelText = retrieveLabelContent($currentField);
          isEmpty = (fieldValue === null || fieldValue === '' || selectedOptionText === initialLabelText);
        } else {
          isEmpty = (fieldValue === null || fieldValue === undefined || fieldValue === '');
        }

        // Toggle the 'active' class based on content presence
        $labelElement.toggleClass(settings.activeClass, !isEmpty);
      }

      // --- Initialization Steps ---

      // 1. Ensure the input field has a unique ID for label association
      uniqueFieldId = assignUniqueFieldId($currentField);

      // 2. Wrap the input element in a container div
      $currentField.wrap('<div class="' + settings.wrapperClass + '">');
      var $fieldWrapper = $currentField.parent('.' + settings.wrapperClass); // Get reference to the new wrapper

      // 3. Determine if the field is required
      var isRequired = $currentField.prop('required');
      var requiredClassToApply = isRequired ? settings.requiredClass : '';

      // 4. Extract the text for the floating label
      var labelContent = retrieveLabelContent($currentField);

      // 5. Create and insert the floating label element
      var labelClasses = settings.labelClass + ' ' + requiredClassToApply;
      if ($currentField.is('textarea')) {
        labelClasses += ' ' + settings.textAreaClass; // Add specific class for textareas
      }
      $labelElement = _jq('<label class="' + labelClasses + '" for="' + uniqueFieldId + '">' + labelContent + '</label>');
      $labelElement.insertBefore($currentField);

      // 6. Set initial state based on pre-populated values
      updateLabelState();

      // 7. Bind event listeners for state updates and focus management
      $currentField.on('keyup blur change', updateLabelState); // 'change' for select elements

      // Add focus/blur classes for styling
      $currentField.on('focus', function() {
        $fieldWrapper.addClass(settings.focusedClass);
      }).on('blur', function() {
        $fieldWrapper.removeClass(settings.focusedClass);
      });

      // Mark this element as processed
      $currentField.attr(settings.dataProcessedAttr, 'true');

    }); // End .each()
  }; // End _jq.fn.floatLabel

// Compatibility with jQuery, Zepto, or a global '$'
})(window.jQuery || window.Zepto || window.$);