(function ($) {
// This is an Immediately Invoked Function Expression (IIFE).
// It encapsulates the plugin's code to prevent global scope pollution
// and ensures jQuery is properly aliased as '$'.

  $.fn.rating = function () {

    // Declare a variable 'element' which will be used later in the loop.
    var element;

    /*
     * Private helper function: _paintValue
     * Purpose: To visually highlight stars based on a given rating value.
     * @param {HTMLElement} ratingInput - The DOM element representing the rating widget container.
     * @param {number} value - The numerical value up to which stars should be highlighted.
     * @param {string} active_icon - CSS class for an active (filled) star icon.
     * @param {string} inactive_icon - CSS class for an inactive (empty) star icon.
     */
    function _paintValue (ratingInput, value, active_icon, inactive_icon)
    {
      // Locate the specific star element corresponding to the 'value'.
      var selectedStar = $(ratingInput).find('[data-value="' + value + '"]');

      // First, set the selected star itself to the active state.
      selectedStar.removeClass(inactive_icon).addClass(active_icon);

      // Then, set all preceding stars (stars with lower values) to the active state.
      selectedStar.prevAll('[data-value]').removeClass(inactive_icon).addClass(active_icon);

      // Finally, set all succeeding stars (stars with higher values) to the inactive state.
      selectedStar.nextAll('[data-value]').removeClass(active_icon).addClass(inactive_icon);
    }

    /**
     * Private helper function: _clearValue
     * Purpose: To remove all highlighting from stars within a rating widget,
     *          effectively setting them all to their inactive state.
     * @param {HTMLElement} ratingInput - The DOM element of the rating widget.
     * @param {string} active_icon - CSS class for active icon.
     * @param {string} inactive_icon - CSS class for inactive icon.
     */
    function _clearValue( ratingInput, active_icon, inactive_icon )
    {
      var self = $(ratingInput); // Cache the jQuery object for the rating input.

      // Find all star elements within the rating input and apply the inactive icon class.
      self.find('[data-value]').removeClass(active_icon).addClass(inactive_icon);
    }

    /**
     * Private helper function: _updateValue
     * Purpose: To update the value of the hidden input field and trigger a 'change' event.
     *          It also manages the visibility of the "clear" button.
     * @param {jQuery} input - The jQuery object of the hidden input field.
     * @param {number|string} val - The new value to be set.
     */
    function _updateValue( input, val )
    {
      // Set the input's value and programmatically trigger the 'change' event.
      input.val(val).trigger('change');

      // Check if the current value matches the 'empty-value' data attribute.
      if ( val === input.data('empty-value') ) {
        // If it's the empty value, hide the associated clear button.
        input.siblings('.rating-clear').hide();
      } else {
        // Otherwise, ensure the clear button is visible.
        input.siblings('.rating-clear').show();
      }
    }


    // Loop through each selected input element that the plugin was called upon.
    // The loop iterates in reverse order, which can sometimes be beneficial
    // when modifying a collection that might shift indices.
    for ( element = this.length - 1; element >= 0; element-- ) {

      // Declare variables for the current iteration.
      var el, i,
        // Get the original input element as a jQuery object.
        originalInput = $(this[element]),

        // Retrieve 'max' rating value from data attribute, defaulting to 5 if not set.
        max = originalInput.data('max') || 5,

        // Retrieve 'min' rating value from data attribute, defaulting to 0.
        min = originalInput.data('min') || 0,

        // Get the default value of the input, defaulting to 0 if empty.
        def_val = originalInput.val() || 0,

        // Icon library prefix (e.g., 'glyphicon'), defaulting to 'glyphicon'.
        lib = originalInput.data('icon-lib') || 'glyphicon',

        // CSS class for active (filled) icon, defaulting to 'glyphicon-star'.
        active = originalInput.data('active-icon') || 'glyphicon-star',

        // CSS class for inactive (empty) icon, defaulting to 'glyphicon-star-empty'.
        inactive = originalInput.data('inactive-icon') || 'glyphicon-star-empty',

        // Text for the clear button; if present, the button will be rendered.
        clearable = originalInput.data('clearable') || null,

        // Icon for the clear button, defaulting to 'glyphicon-remove'.
        clearable_i = originalInput.data('clearable-icon') || 'glyphicon-remove',

        // Initialize an empty string to build the HTML for the stars.
        stars = '';

      // Start HTML element construction: dynamically generate the star icons.
      // This loop creates each individual star element.
      for ( i = min; i <= max; i++ ) {
        // Determine whether the current star should be active or inactive based on def_val.
        if( i <= def_val ) {
          // If the star's value is less than or equal to the default value, it's active.
          stars += ['<i class="', lib, ' ', active, '" data-value="', i, '"></i>'].join('');
        }
        else {
          // Otherwise, it's an inactive (empty) star.
          stars += ['<i class="', lib, ' ', inactive, '" data-value="', i, '"></i>'].join('');
        }
      }

      // Conditionally add a "clear" link if the 'clearable' option is enabled.
      if ( clearable ) {
          stars += [
          ' <a class="rating-clear" style="display:none;" href="javascript:void">', // The anchor tag for clearing.
          '<span class="', lib, ' ', clearable_i, '"></span> ', // The icon for the clear button.
          clearable, // The custom text provided for the clear button.
          '</a>'].join(''); // Close the anchor tag.
      }

      // Clone the original input element, preserving its data and event handlers.
      // This cloned input will serve as the hidden field to store the rating value.
      var newInput = originalInput.clone(true)
        .addClass('hidden') // Add 'hidden' class to conceal the original input.
        .data('max', max) // Transfer 'max' data attribute.
        .data('min', min) // Transfer 'min' data attribute.
        .data('icon-lib', lib) // Transfer 'icon-lib' data attribute.
        .data('active-icon', active) // Transfer 'active-icon' data attribute.
        .data('inactive-icon', inactive); // Transfer 'inactive-icon' data attribute.

      // Assemble the main wrapper for the rating widget.
      el = [
        '<div class="rating-input">', // Opening div for the rating container.
        stars, // The generated star icons and optional clear button.
        '</div>'].join(''); // Closing div for the rating container.

      // Replace the original input element with the new rating widget structure.
      // This check prevents re-wrapping if the plugin is called multiple times on an already processed element.
      if ( originalInput.parents('.rating-input').length <= 0 ) {
        // Replace the original input with the new HTML structure, then append the hidden input inside it.
        originalInput.replaceWith($(el).append(newInput));
      }

    } // End of the 'for' loop processing input elements.


    // Attach event handlers to the newly generated rating widgets.
    // Event delegation is used on the '.rating-input' class to efficiently manage events.
    $('.rating-input')
      // Event: Mouse enters a star element (hover effect).
      .on('mouseenter', '[data-value]', function () {
        var self = $(this); // The specific star element being hovered over.
        var input = self.siblings('input'); // The associated hidden input.
        // Paint the stars up to the hovered star's value.
        _paintValue( self.closest('.rating-input'), self.data('value'), input.data('active-icon'), input.data('inactive-icon') );
      })
      // Event: Mouse leaves a star element (reset to current value).
      .on('mouseleave', '[data-value]', function () {
        var self = $(this), // The star element the mouse just left.
          input = self.siblings('input'), // The hidden input field.
          val = input.val(), // The current selected value from the hidden input.
          min = input.data('min'), // Minimum allowed rating value.
          max = input.data('max'), // Maximum allowed rating value.
          active = input.data('active-icon'), // Active icon class.
          inactive = input.data('inactive-icon'); // Inactive icon class.

        // If the stored value is within the valid range, re-paint to that value.
        if ( val >= min && val <= max ) {
          _paintValue( self.closest('.rating-input'), val, active, inactive );
        } else {
          // Otherwise, clear all stars (e.g., if the value is outside min/max or empty).
          _clearValue( self.closest('.rating-input'), active, inactive );
        }
      })
      // Event: A star is clicked (select a rating value).
      .on('click', '[data-value]', function (e) {
        var self = $(this), // The clicked star element.
          val = self.data('value'), // The data-value of the clicked star.
          input = self.siblings('input'); // The hidden input field.

        _updateValue( input, val ); // Update the hidden input with the new value.
        e.preventDefault(); // Prevent the default action (e.g., if it were a link).
        return false; // Stop event propagation and prevent default.
      })
      // Event: The 'clear' button is clicked (reset rating to empty).
      .on('click', '.rating-clear', function (e) {
        var self = $(this), // The 'clear' button element.
          input = self.siblings('input'), // The associated hidden input.
          active = input.data('active-icon'), // Active icon class.
          inactive = input.data('inactive-icon'); // Inactive icon class.

        _updateValue( input, input.data('empty-value') ); // Set the input to its 'empty-value'.
        _clearValue( self.closest('.rating-input'), active, inactive ); // Clear all star highlights.
        e.preventDefault(); // Prevent default link behavior.
        return false; // Stop event propagation and prevent default.
      })
      // Post-creation initialization: Set the initial view based on the input's default value.
      .each(function () {
        var input = $(this).find('input'), // Find the hidden input within this rating widget.
          val = input.val(), // Get the current value from the input.
          min = input.data('min'), // Get the minimum value.
          max = input.data('max'); // Get the maximum value.

        // Check if the value is not empty and falls within the min/max range.
        if ( val !== "" && +val >= min && +val <= max ) {
          _paintValue( this, val ); // Paint the stars according to the initial value.
          $(this).find('.rating-clear').show(); // Ensure the clear button is shown if a value is set.
        }
        else {
          // If no valid initial value, set the input to its 'empty-value' and clear all stars.
          input.val(input.data('empty-value'));
          _clearValue( this );
        }
      });

  }; // End of $.fn.rating plugin definition.


  // Auto-initialization block: This code runs once the DOM is fully loaded.
  // It automatically converts specific number input fields into rating widgets.
  $(function () {
    // Check if there are any <input type="number" class="rating"> elements present.
    if ( $('input.rating[type=number]').length > 0 ) {
      // If found, apply the 'rating' plugin to them.
      $('input.rating[type=number]').rating();
    }
  });

}(jQuery)); // Pass jQuery object to the IIFE.