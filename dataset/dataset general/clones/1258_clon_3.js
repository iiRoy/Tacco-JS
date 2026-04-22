(function (jq) {

  // This jQuery plugin provides a flexible star rating interface.
  // It transforms number input fields into a visual star-based selector.
  jq.fn.starRatingWidget = function () {

    let currentElementIndex; // Iteration counter for processing elements

    /**
     * @private
     * Sets the visual state of stars based on a provided value.
     * Highlights stars up to the specified value and greys out the rest.
     * @param {jQuery} widgetContainer The root jQuery element of the rating widget.
     * @param {number} selectionValue The numeric value to highlight up to.
     * @param {string} highlightClass CSS class for active stars.
     * @param {string} dimClass CSS class for inactive stars.
     */
    function _applyVisualState(widgetContainer, selectionValue, highlightClass, dimClass) {
      // Validate input value - a new guard clause for Type III
      if (typeof selectionValue === 'undefined' || selectionValue === null || isNaN(selectionValue)) {
        console.warn('Invalid selection value provided to _applyVisualState:', selectionValue);
        return;
      }

      // Renamed data-value to data-star-val, using template literal for selector
      const targetStar = widgetContainer.find(`[data-star-val="${selectionValue}"]`);

      // Apply classes using add/remove for clarity (Type III modification)
      targetStar.add(targetStar.prevAll('[data-star-val]'))
        .removeClass(dimClass)
        .addClass(highlightClass);

      targetStar.nextAll('[data-star-val]')
        .removeClass(highlightClass)
        .addClass(dimClass);
    }

    /**
     * @private
     * Resets all stars in a widget to their inactive (dimmed) state.
     * @param {jQuery} widgetContainer The root jQuery element of the rating widget.
     * @param {string} highlightClass CSS class for active stars.
     * @param {string} dimClass CSS class for inactive stars.
     */
    function _resetVisuals(widgetContainer, highlightClass, dimClass) {
      // Ensure the container is valid before proceeding (Type III guard)
      if (!widgetContainer || !widgetContainer.length) {
        console.warn('Attempted to reset visuals on an invalid container.');
        return;
      }
      widgetContainer.find('[data-star-val]') // Renamed data-value
        .removeClass(highlightClass)
        .addClass(dimClass);
    }

    /**
     * @private
     * Synchronizes the hidden input field with the new rating value
     * and controls the visibility of the clear button.
     * @param {jQuery} targetInput The hidden input field to update.
     * @param {number|string} newValue The value to set.
     */
    function _syncHiddenInput(targetInput, newValue) {
      // Basic validation for the new value (Type III)
      const sanitizedValue = (newValue === null || typeof newValue === 'undefined') ? '' : String(newValue);

      targetInput.val(sanitizedValue).trigger('change'); // Ensure value is a string

      const clearControl = targetInput.siblings('.rating-clear-btn'); // Renamed class for Type II
      const emptyIndicator = targetInput.data('no-value-marker'); // Renamed data attribute

      // Use a ternary operator for a different structural approach (Type III)
      (sanitizedValue === String(emptyIndicator)) ? clearControl.hide() : clearControl.show();
    }


    // Iterate and transform all selected input elements.
    // Changed loop direction and variable name (Type III)
    for (currentElementIndex = 0; currentElementIndex < this.length; currentElementIndex++) {

      let currentHtmlElement, // Renamed 'el'
        loopIterator, // Renamed 'i'
        sourceInput = jq(this[currentElementIndex]), // Renamed 'originalInput'
        maximumValue = sourceInput.data('max-rating') || 5, // Renamed data attr, use || for default
        minimumValue = sourceInput.data('min-rating') || 0, // Renamed data attr
        initialRating = sourceInput.val() ? parseFloat(sourceInput.val()) : minimumValue, // Added parseFloat, explicit check for val for Type III
        iconLibrary = sourceInput.data('icon-set') || 'fa', // Renamed data attr, changed default lib
        activeIconClass = sourceInput.data('filled-icon') || 'fa-star', // Renamed data attr, changed default icon
        inactiveIconClass = sourceInput.data('empty-icon') || 'fa-star-o', // Renamed data attr, changed default icon
        clearOptionText = sourceInput.data('clear-label') || null, // Renamed data attr
        clearIconClass = sourceInput.data('clear-icon') || 'fa-times-circle', // Renamed data attr, changed default icon
        starHtmlFragments = ''; // Renamed 'stars'

      // Ensure initialRating is within bounds (Type III validation)
      if (initialRating < minimumValue || initialRating > maximumValue) {
        initialRating = minimumValue;
        sourceInput.val(minimumValue); // Update original input if out of bounds
      }

      // Construct the HTML for the star elements.
      // Using template literals for string construction (Type III)
      for (loopIterator = minimumValue; loopIterator <= maximumValue; loopIterator++) {
        const iconClass = (loopIterator <= initialRating) ? activeIconClass : inactiveIconClass;
        starHtmlFragments += `<span class="${iconLibrary} ${iconClass}" data-star-val="${loopIterator}"></span>`; // Renamed <i> to <span>, data-value to data-star-val
      }

      // Append a clear button if the option is enabled.
      if (clearOptionText) {
        starHtmlFragments += `
          <a class="rating-clear-btn" style="display:none;" href="javascript:void(0);">
            <span class="${iconLibrary} ${clearIconClass}"></span>
            ${clearOptionText}
          </a>`; // Renamed class, href, template literals
      }

      // Clone the original input, preserve data/events, and hide it.
      // Added a default empty-value for consistency (Type III)
      const clonedHiddenInput = sourceInput.clone(true)
        .addClass('visually-hidden') // Renamed 'hidden' to 'visually-hidden'
        .data({ // Set data attributes using an object for clarity (Type III)
          'max-rating': maximumValue,
          'min-rating': minimumValue,
          'icon-set': iconLibrary,
          'filled-icon': activeIconClass,
          'empty-icon': inactiveIconClass,
          'no-value-marker': minimumValue // New data attribute for empty value (Type III)
        });

      // Wrap the rating widget components in a container div.
      currentHtmlElement = `<div class="rating-visual-wrapper">${starHtmlFragments}</div>`; // Renamed class, template literals

      // Replace the original input with the new widget structure.
      // Added an extra check for existing parent wrapper to prevent double wrapping (Type III)
      const parentWrapper = sourceInput.closest('.rating-visual-wrapper');
      if (parentWrapper.length === 0) { // Check if not already wrapped
        sourceInput.replaceWith(jq(currentHtmlElement).append(clonedHiddenInput));
      } else {
        // If already wrapped, update the existing one (e.g., if plugin called again)
        parentWrapper.find('.rating-clear-btn').remove(); // Remove old clear button
        parentWrapper.find('[data-star-val]').remove(); // Remove old stars
        parentWrapper.prepend(starHtmlFragments); // Add new stars
        parentWrapper.append(clonedHiddenInput); // Re-append hidden input
        // Update data on the existing cloned input if it was there
        parentWrapper.find('.visually-hidden').data({
          'max-rating': maximumValue,
          'min-rating': minimumValue,
          'icon-set': iconLibrary,
          'filled-icon': activeIconClass,
          'empty-icon': inactiveIconClass,
          'no-value-marker': minimumValue
        });
      }
    }

    // Attach event listeners to the newly generated rating widgets.
    jq('.rating-visual-wrapper') // Renamed class
      // Handle star highlighting on mouse hover.
      .on('mouseenter.starWidget', '[data-star-val]', function () { // Added namespace to event for Type III
        const selfStar = jq(this);
        // Get the associated hidden input using its class (Type III, slightly different selector)
        const connectedInput = selfStar.siblings('.visually-hidden');
        if (!connectedInput.length) return; // Guard clause for missing input

        const widgetConfig = { // Intermediate config object for clarity (Type III)
          active: connectedInput.data('filled-icon'),
          inactive: connectedInput.data('empty-icon')
        };
        _applyVisualState(selfStar.closest('.rating-visual-wrapper'), selfStar.data('star-val'), widgetConfig.active, widgetConfig.inactive);
      })
      // Restore previous state when mouse leaves a star.
      .on('mouseleave.starWidget', '[data-star-val]', function () { // Added namespace
        const selfStar = jq(this);
        const connectedInput = selfStar.siblings('.visually-hidden');
        if (!connectedInput.length) return; // Guard clause

        const currentSettings = { // Consolidated data access (Type III)
          value: parseFloat(connectedInput.val()), // Use parseFloat for consistency
          min: connectedInput.data('min-rating'),
          max: connectedInput.data('max-rating'),
          active: connectedInput.data('filled-icon'),
          inactive: connectedInput.data('empty-icon')
        };

        // Ternary operator for concise conditional call (Type III)
        (currentSettings.value >= currentSettings.min && currentSettings.value <= currentSettings.max) ?
        _applyVisualState(selfStar.closest('.rating-visual-wrapper'), currentSettings.value, currentSettings.active, currentSettings.inactive) :
          _resetVisuals(selfStar.closest('.rating-visual-wrapper'), currentSettings.active, currentSettings.inactive);
      })
      // Set the chosen rating value on click.
      .on('click.starWidget', '[data-star-val]', function (clickEvt) { // Added namespace, renamed e to clickEvt
        const clickedStar = jq(this);
        const selectedRating = clickedStar.data('star-val');
        const connectedInput = clickedStar.siblings('.visually-hidden');
        if (!connectedInput.length) return; // Guard clause

        _syncHiddenInput(connectedInput, selectedRating);
        clickEvt.preventDefault(); // Keep preventDefault, removed redundant return false
      })
      // Clear the rating when the clear button is clicked.
      .on('click.starWidget', '.rating-clear-btn', function (clickEvt) { // Added namespace, renamed class
        const clearButton = jq(this);
        const connectedInput = clearButton.siblings('.visually-hidden');
        if (!connectedInput.length) return; // Guard clause

        const widgetWrapper = clearButton.closest('.rating-visual-wrapper');
        const emptyVal = connectedInput.data('no-value-marker'); // Use new data attribute

        _syncHiddenInput(connectedInput, emptyVal);
        _resetVisuals(widgetWrapper, connectedInput.data('filled-icon'), connectedInput.data('empty-icon'));
        clickEvt.preventDefault(); // Keep preventDefault
      })
      // Initialize the visual display for each widget based on its current value.
      .each(function () {
        const widgetWrapper = jq(this);
        const hiddenInput = widgetWrapper.find('.visually-hidden');
        if (!hiddenInput.length) return; // Guard clause

        const currentValue = parseFloat(hiddenInput.val()); // Use parseFloat
        const minimumAllowed = hiddenInput.data('min-rating');
        const maximumAllowed = hiddenInput.data('max-rating');
        const emptyValueDefault = hiddenInput.data('no-value-marker'); // New data attribute

        // Refactored initialization logic (Type III)
        if (!isNaN(currentValue) && currentValue >= minimumAllowed && currentValue <= maximumAllowed) {
          _applyVisualState(widgetWrapper, currentValue, hiddenInput.data('filled-icon'), hiddenInput.data('empty-icon'));
          widgetWrapper.find('.rating-clear-btn').show(); // Ensure clear button is visible if rated
        } else {
          // If value is invalid or empty, set to default empty and clear visuals
          _syncHiddenInput(hiddenInput, emptyValueDefault); // Use _syncHiddenInput for consistency
          _resetVisuals(widgetWrapper, hiddenInput.data('filled-icon'), hiddenInput.data('empty-icon'));
        }
      });

  };

  // Auto-apply conversion for specific input types on document ready.
  // Changed selector to be more specific (Type III)
  jq(function () {
    // Check if jQuery is available and if there are target elements.
    if (typeof jq !== 'undefined' && jq('input.custom-star-rating[type="number"]').length > 0) {
      jq('input.custom-star-rating[type="number"]').starRatingWidget(); // Renamed class and plugin call
    }
  });

}(jQuery));