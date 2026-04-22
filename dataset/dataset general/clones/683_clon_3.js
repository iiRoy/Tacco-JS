(function ($) {
  'use strict';

  // Comprehensive default configuration for the custom dropdown enhancement.
  // These settings can be overridden during plugin initialization.
  const DEFAULT_ENHANCER_CONFIG = {
    verticalShift: 0,           // Pixels to offset the dropdown vertically.
    horizontalShift: 0,         // Pixels to offset the dropdown horizontally.
    maxVisibleOptions: 8,       // Number of options shown in the native select listbox.
    enableTouchMode: false,     // Force touch-optimized behavior (true/false).
    transitionDuration: 120     // Milliseconds for any future UI animations.
  };

  /**
   * Helper function to detect if the current device is likely a touch-enabled one.
   * This helps in deciding whether to trigger native OS select dialogs or custom UI.
   * @returns {boolean} True if a touch device is detected.
   */
  function checkTouchCapability() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0 ||
      (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent))
    );
  }

  /**
   * jQuery plugin to transform standard <select> elements into stylable custom dropdowns.
   * @param {object} clientSettings - Configuration options provided by the user.
   * @returns {jQuery} The jQuery object for chaining.
   */
  $.fn.customDropdownWidget = function (clientSettings) {
    // If no elements are selected, return early to maintain chainability.
    if (!this.length) {
      return this;
    }

    // Merge default settings with user-provided options.
    // Deep merge (true) ensures nested objects are also merged properly.
    const currentSettings = $.extend(true, {}, DEFAULT_ENHANCER_CONFIG, clientSettings);

    // Iterate over each <select> element in the current jQuery collection.
    return this.each(function (elementIterator, nativeHtmlSelectElement) {
      const $originalSelect = $(nativeHtmlSelectElement);

      // Prevent re-initialization on elements that have already been processed.
      if ($originalSelect.data('dropdownWidgetInitialized')) {
        return;
      }
      $originalSelect.data('dropdownWidgetInitialized', true); // Mark as initialized.

      // Apply initial absolute positioning and transparency to the native select.
      // This makes it visually hidden but keeps it functional for interactions.
      $originalSelect.css({
        position: 'absolute',
        top: currentSettings.verticalShift,
        left: currentSettings.horizontalShift,
        zIndex: 5, // Ensures it's above the visual display for click/tap capture.
        opacity: 0.0001, // Almost completely transparent.
        width: '100%', // Match the width of its containing element.
        height: '100%', // Match the height of its containing element.
        boxSizing: 'border-box' // Include padding and border in the element's total width and height.
      }).addClass('custom-dropdown-native-hidden'); // Add a class for specific CSS targeting.

      // Construct the visual components of the custom dropdown.
      const $displayedTextElement = $('<span class="custom-dropdown-label"></span>');
      const $visualDisplayContainer = $('<div class="custom-dropdown-display" tabindex="0"></div>')
        .append($displayedTextElement);
      const $widgetRootContainer = $('<div class="custom-dropdown-root" style="position:relative;"></div>');

      // Assemble the DOM structure:
      // 1. Insert the root container before the original select.
      // 2. Append the visual display and the (now hidden) original select to the root.
      $originalSelect.before($widgetRootContainer);
      $widgetRootContainer.append($visualDisplayContainer);
      $widgetRootContainer.append($originalSelect); // Move the native select inside the root.

      // --- Core Utility Functions ---

      /**
       * Retrieves the text of the currently selected option from the native <select>.
       * @returns {string} The text content of the selected option.
       */
      const getCurrentOptionLabel = function () {
        return $originalSelect.find('option:selected').text();
      };

      /**
       * Updates the text shown in the custom display and adjusts the native select's position.
       * @param {boolean} shouldFocusDisplay - If true, focuses the visual display container after update.
       */
      const refreshDisplayContent = function (shouldFocusDisplay = false) {
        $displayedTextElement.text(getCurrentOptionLabel());

        // When the native select is shown as a listbox (desktop mode),
        // it needs to be positioned directly below the custom display.
        $originalSelect.css({
          top: $visualDisplayContainer.outerHeight() + currentSettings.verticalShift
        });

        if (shouldFocusDisplay) {
          $visualDisplayContainer.focus();
        }
      };

      /**
       * Manages the 'open' or 'active' state of the custom dropdown.
       * This toggles a class on the root container and controls the visibility of the native select.
       * @param {boolean} isOpen - True to open/activate, false to close/deactivate.
       */
      const manageDropdownState = function (isOpen) {
        $widgetRootContainer.toggleClass('custom-dropdown-active', isOpen);

        // In non-touch mode, the native select is explicitly shown/hidden.
        if (!isDeviceTouchOptimized) {
          $originalSelect.toggle(isOpen);
          if (isOpen) {
            // A small delay is often needed to ensure the element is rendered and interactive
            // before attempting to focus it, preventing immediate blur events.
            setTimeout(() => $originalSelect.focus(), 15);
          }
        }
      };

      // --- Initialization Logic Based on Device Capabilities ---

      // Determine if touch optimization should be enabled (either forced by settings or detected).
      const isDeviceTouchOptimized = currentSettings.enableTouchMode || checkTouchCapability();

      if (isDeviceTouchOptimized) {
        // For touch-enabled devices, the native select is always transparently overlaid.
        // It serves as a click/tap target to trigger the operating system's native select dialog.
        $originalSelect
          .css({ opacity: 0.0001, zIndex: 10 }) // Ensure it's on top and nearly invisible.
          .on('change.customDropdown', function () {
            refreshDisplayContent(); // Update the visual display after a native selection.
          });
        // Prevent the native select from visually gaining focus on touch devices.
        $originalSelect.on('focus.customDropdown', function() { $(this).blur(); });

        // Perform initial display update for touch mode.
        refreshDisplayContent();
        return; // Exit; desktop-specific event handlers are not needed.
      }

      // --- Desktop/Non-Touch Specific Event Handling ---

      // Event handlers for the native <select> element in desktop mode.
      $originalSelect
        .on('keydown.customDropdown', function (event) {
          const keyCode = event.which;
          // Handle Enter (13) or Spacebar (32) key presses.
          if (keyCode === 13 || keyCode === 32) {
            event.preventDefault(); // Prevent default browser actions (e.g., form submission, page scroll).
            refreshDisplayContent(true); // Update display and return focus to the custom wrapper.
            manageDropdownState(false); // Close the dropdown.
          }
        })
        .on('change.customDropdown', function () {
          refreshDisplayContent(); // Update the display whenever the selection changes.
        })
        .on('blur.customDropdown', function () {
          // When the native select loses focus, hide it.
          manageDropdownState(false);
        })
        .on('click.customDropdown', function (event) {
          event.stopPropagation(); // Stop click event from bubbling up to parent elements.
          // If the native select is currently hidden, show it to allow interaction.
          if ($originalSelect.is(':hidden')) {
            manageDropdownState(true);
          } else {
            // If it's visible, a click implies a selection or an intent to close.
            refreshDisplayContent(true);
            manageDropdownState(false);
          }
        });

      // Event handlers for the custom visual display wrapper.
      $visualDisplayContainer
        .on('mousedown.customDropdown', function (event) {
          event.preventDefault(); // Prevent default text selection and potential focus issues.
          // Simulate a click on the native select to trigger its open/close behavior.
          $originalSelect.click();
        })
        .on('keydown.customDropdown', function (event) {
          const keyCode = event.which;
          const isActivationKey = (keyCode === 13 || keyCode === 32); // Enter, Spacebar.
          const isNavigationKey = (keyCode >= 37 && keyCode <= 40); // Arrow keys (Left, Up, Right, Down).

          if (isActivationKey || isNavigationKey) {
            event.preventDefault(); // Prevent default browser actions (e.g., page scrolling).
            $originalSelect.click(); // Open the native select for interaction.
          }
        });

      // Set the 'size' attribute of the native <select>.
      // This makes it render as a listbox (scrollable list) rather than a dropdown menu,
      // allowing the plugin to control its visibility and position.
      nativeHtmlSelectElement.size = Math.min(
        nativeHtmlSelectElement.options.length,
        currentSettings.maxVisibleOptions
      );

      // Perform the initial update of the custom display.
      refreshDisplayContent();
    });
  };

  // Attach the default configuration directly to the plugin function for external access.
  $.fn.customDropdownWidget.defaults = DEFAULT_ENHANCER_CONFIG;

})(jQuery); // Pass jQuery object as an argument for scope isolation.