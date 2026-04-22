/*
 * DynamicInputLabel.js
 * revised: 2023-10-27
 */

(function (jqLib) {
  'use strict';

  // Define the dynamic labeling enhancement
  jqLib.fn.dynamicLabel = function () {
    // Exclude submit buttons, process only relevant input types
    return this.filter('input:not([type=submit]), textarea, select').each(function () {
      // Helper to retrieve the textual hint for the input
      function fetchHintText($targetField) {
        let hintContent = $targetField.attr('placeholder');

        if (typeof hintContent === 'undefined') {
          hintContent = $targetField.attr('title');
        }

        return hintContent;
      }

      // Adjusts the visual state of the floating label based on field content
      function updateVisualState() {
        let currentFieldValue = $targetField.val();

        if (currentFieldValue === null) {
          currentFieldValue = '';
        } else if ($targetField.is('select')) {
          const initialHintValue = fetchHintText($targetField); // Re-fetch for select comparison

          if (initialHintValue === currentFieldValue) {
            currentFieldValue = '';
          }
        }

        // Toggle 'is-active' class if the field has content
        floatingLabel.toggleClass('is-active', currentFieldValue !== '');
      }

      // Generates a short unique ID (4 alphanumeric characters)
      function generateShortUniqueKey() {
        let generatedKey = '';
        do {
          generatedKey = ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
        } while (!!jqLib('#' + generatedKey).length); // Ensure uniqueness in the DOM
        return generatedKey;
      }

      // Assigns an ID to the element if it doesn't already possess one
      function ensureElementHasID($targetField) {
        const newIdentifier = generateShortUniqueKey();
        $targetField.prop('id', newIdentifier);
        return newIdentifier;
      }

      // Wrap the current input element in a new container div
      const $targetField = jqLib(this).wrap('<div class="dyn-label-wrapper">');
      let fieldIdentifier = $targetField.attr('id'); // Get the element's ID

      // If no ID exists, create and assign one
      if (!fieldIdentifier) {
        fieldIdentifier = ensureElementHasID($targetField);
      }

      // Determine if the input is marked as required
      const mandatoryFlag = $targetField.attr('required') || '';

      // Prepare variable for the floating label element
      let floatingLabel = '';
      const labelTextContent = fetchHintText($targetField); // Extract the hint text

      // Differentiate label creation for text areas for better styling
      if (jqLib(this).is('textarea')) {
        floatingLabel = jqLib('<label class="floating-hint multi-line-text ' + mandatoryFlag + '" for="' + fieldIdentifier + '">' + labelTextContent + '</label>').insertBefore($targetField);
      } else {
        floatingLabel = jqLib('<label class="floating-hint ' + mandatoryFlag + '" for="' + fieldIdentifier + '">' + labelTextContent + '</label>').insertBefore($targetField);
      }

      // Set initial state of the label (active/inactive)
      updateVisualState();

      // Bind events to refresh the label state on user interaction
      $targetField.on('keyup blur', updateVisualState);
    });
  };
// Ensure compatibility with both jQuery and Zepto
})(window.jQuery || window.Zepto || window.$);