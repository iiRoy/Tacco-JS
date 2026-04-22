/**
 * Dynamic Menu Layout Utility 2.1.0
 *
 * This script provides a flexible and adaptive layout solution for horizontal navigation menus.
 * It intelligently distributes width among menu items, ensuring a consistent and visually
 * appealing presentation across various browser environments.
 *
 * Developed by a seasoned JavaScript architect.
 * All rights reserved.
 *
 * License: MIT
 */
; (function (globalLib) {
  // Enforce strict mode for enhanced code quality and error detection.
  'use strict';

  /**
   * Extends jQuery's prototype to provide a dynamic menu layout function.
   * This method adjusts the width of list items within a menu to fill available space.
   *
   * @param {object} customizationOptions - An object containing user-defined settings
   *                                        to customize the plugin's behavior.
   * @returns {jQuery} The jQuery object, allowing for method chaining.
   */
  globalLib.fn.dynamicMenuLayout = function (customizationOptions) {

    // Merge default configuration with any options provided by the user.
    // A deep merge is used to handle nested options gracefully.
    const effectiveConfig = globalLib.extend(true, {}, globalLib.fn.dynamicMenuLayout.defaultSettings, customizationOptions);

    // Iterate over each selected DOM element to apply the layout logic.
    // This ensures the plugin works correctly when multiple elements are targeted.
    return this.each(function () {

      const $targetElement = globalLib(this); // Cache the current element for efficiency.

      // Prevent re-initialization if the element has already been processed by this utility.
      // This avoids redundant operations and potential conflicts.
      if ($targetElement.data('dynamicMenuLayoutInitialized')) {
        // console.warn('dynamicMenuLayout: Element already initialized, skipping.', $targetElement);
        return;
      }

      // Determine the outer container that dictates the menu's overall width.
      // If the target element is a <ul>, its parent is considered the wrapper; otherwise, the target itself is the wrapper.
      const $listWrapper = $targetElement.is('ul') ? $targetElement.parent() : $targetElement;

      // Crucial validation: if no valid list wrapper is found, exit early.
      if (!$listWrapper.length) {
        // console.error('dynamicMenuLayout: Could not find a suitable list wrapper.', $targetElement);
        return;
      }

      // Identify and cache the main unordered list and its direct list items.
      const $mainList = $targetElement.is('ul') ? $targetElement : $listWrapper.find('> ul');
      const $menuItems = $mainList.find('> li');
      const totalItems = $menuItems.length; // Count the number of menu items.

      // Early exit if no menu items are present, as there's nothing to layout.
      if (totalItems === 0) {
        // console.warn('dynamicMenuLayout: No list items found in the menu.', $targetElement);
        $targetElement.addClass("dynamic-layout-skipped"); // Mark element as skipped.
        return;
      }

      // Reset padding on anchor elements within list items. This ensures accurate
      // width calculations by removing browser default styles that might interfere.
      $menuItems.find('> a').css({ 'padding-left': 0, 'padding-right': 0 });

      // Apply a minimum item count validation. If the number of items is below
      // the configured minimum, the layout process is halted for this element.
      if (effectiveConfig.minRequiredItems > 0 && totalItems < effectiveConfig.minRequiredItems) {
        $targetElement.addClass("dynamic-layout-insufficient-items"); // Indicate failure reason.
        return; // Terminate processing for this element.
      }

      // Ensure a clearfix element is present within the wrapper to handle floated content correctly.
      // If not found, a new helper element is created and appended with essential CSS properties.
      let $layoutFixer = $listWrapper.find('> .layout-clear-helper');
      if ($layoutFixer.length === 0) {
        $layoutFixer = globalLib('<div>').addClass('layout-clear-helper');
        $listWrapper.append($layoutFixer);
        $layoutFixer.css({
          'display': 'block',
          'overflow': 'hidden',
          'visibility': 'hidden',
          'width': 0,
          'height': 0,
          'clear': 'both'
        });
      }
      // Apply zoom:1 for older IE versions to trigger 'hasLayout' and ensure proper rendering.
      $listWrapper.css({ 'zoom': '1' });


      /**
       * Calculates the true content width of an element by subtracting its horizontal padding.
       * This is crucial for precise layout calculations where padding should not be part of the distributable width.
       * @param {jQuery} elementRef - The jQuery object of the element to measure.
       * @returns {number} The content width in pixels.
       */
      const obtainContentWidth = function (elementRef) {
        const currentPaddingLeft = parseInt(elementRef.css('padding-left'), 10) || 0;
        const currentPaddingRight = parseInt(elementRef.css('padding-right'), 10) || 0;
        return elementRef.innerWidth() - (currentPaddingLeft + currentPaddingRight);
      };

      /**
       * The core function responsible for orchestrating the menu's layout adjustments.
       * It determines whether to use a legacy floating approach or modern CSS table display.
       */
      const adjustMenuDimensions = function () {

        // Decide on the layout strategy: legacy floating or modern CSS table display.
        // The legacy method is used if 'cssTableLayout' is explicitly disabled.
        const useLegacyLayoutStrategy = !effectiveConfig.cssTableLayout;

        if (useLegacyLayoutStrategy) {
          // --- Legacy Layout Strategy (Floating Elements) ---
          // This approach involves floating list items and manually distributing widths.
          // It's robust for older browsers that lack full CSS table display support.

          // Apply necessary float styles and reset widths to allow for recalculation.
          $mainList.css({ 'float': 'left', 'width': 'auto' });
          $menuItems.css({ 'float': 'left', 'width': 'auto' });

          // Measure current dimensions to calculate available space.
          const initialListContentWidth = obtainContentWidth($mainList);
          const listOuterMetrics = $mainList.outerWidth(true); // Includes padding and margin.
          const listHorizontalOverhead = listOuterMetrics - initialListContentWidth;

          const totalContainerContentWidth = obtainContentWidth($listWrapper);
          const availableDistributableSpace = (totalContainerContentWidth - listHorizontalOverhead) - initialListContentWidth;

          // Calculate the base padding to distribute evenly among items.
          // Guard against division by zero if, unexpectedly, totalItems is zero.
          const basePaddingPerItem = totalItems > 0 ? Math.floor(availableDistributableSpace / totalItems) : 0;

          let remainingPixelsForDistribution = availableDistributableSpace % totalItems; // Pixels left after floor division.

          // Iterate through each menu item to assign its calculated width.
          $menuItems.each(function (itemIndex) {
            const $currentItem = globalLib(this);
            const currentItemIntrinsicWidth = obtainContentWidth($currentItem);
            let finalAssignedWidth = currentItemIntrinsicWidth + basePaddingPerItem;

            // Distribute remaining pixels one by one to the first few items
            // to ensure the total width sums up correctly without fractional pixels.
            if (remainingPixelsForDistribution > 0) {
              finalAssignedWidth += 1;
              remainingPixelsForDistribution -= 1;
            }
            $currentItem.css({ 'width': finalAssignedWidth + 'px' });
          });

          // After individual item width adjustments, re-evaluate the total list width.
          const finalAggregatedListWidth = obtainContentWidth($mainList);
          const finalPixelDiscrepancy = (totalContainerContentWidth - listHorizontalOverhead) - finalAggregatedListWidth;

          // If there's any remaining discrepancy (e.g., due to rounding or browser quirks),
          // add it to the last item to ensure the menu fills its container perfectly.
          if (finalPixelDiscrepancy > 0 && $menuItems.length > 0) {
            const $lastMenuItem = $menuItems.last();
            const lastMenuItemCurrentWidth = obtainContentWidth($lastMenuItem);
            $lastMenuItem.css({ 'width': (lastMenuItemCurrentWidth + finalPixelDiscrepancy) + 'px' });
          }

        } else {
          // --- Modern Layout Strategy (CSS Table Display) ---
          // This approach leverages CSS 'display: table' and 'display: table-cell' properties.
          // It's generally more robust and simpler for modern browsers, allowing them to handle
          // proportional width distribution automatically.
          $mainList.css({ 'display': 'table', 'float': 'none', 'width': '100%' });
          $menuItems.css({ 'display': 'table-cell', 'float': 'none' });
        }

        // Mark the element as successfully processed and update its state classes.
        $targetElement.addClass("dynamic-layout-processed").removeClass("dynamic-layout-insufficient-items dynamic-layout-skipped");
        $targetElement.data('dynamicMenuLayoutInitialized', true);
      };

      /**
       * Establishes a debounced event listener for window resize events.
       * This prevents the layout adjustment function from being called excessively
       * during a resize operation, improving performance.
       *
       * @param {Function} callbackFn - The function to execute after the resize event settles.
       * @param {number} delayMs - The debounce delay in milliseconds before the callback is invoked.
       */
      const setupDebouncedResize = function (callbackFn, delayMs) {
        let resizeTimerIdentifier;
        globalLib(window).on('resize.dynamicMenuLayout', function () {
          clearTimeout(resizeTimerIdentifier);
          resizeTimerIdentifier = setTimeout(callbackFn, delayMs);
        });
      };

      // Execute the initial layout adjustment immediately upon plugin invocation.
      adjustMenuDimensions();

      // If adaptive layout (responsiveness) is enabled, set up the resize listener.
      // The resize listener is primarily critical for the legacy layout strategy,
      // as modern CSS table display often adapts automatically.
      if (effectiveConfig.adaptiveLayout === true && useLegacyLayoutStrategy) {
        setupDebouncedResize(adjustMenuDimensions, effectiveConfig.debounceInterval);
      }

    }); // End of the `each` iteration loop.
  };

  // Define the default configuration settings for the dynamic menu layout plugin.
  // These settings can be overridden by users when invoking the plugin.
  globalLib.fn.dynamicMenuLayout.defaultSettings = {
    adaptiveLayout: true,      // `true` to enable dynamic resizing on window resize events.
    debounceInterval: 120,     // Delay in milliseconds for debouncing resize events to optimize performance.
    cssTableLayout: true,      // `true` to use modern CSS 'display: table' for layout; `false` for legacy float-based method.
    minRequiredItems: 0        // Minimum number of list items necessary for the plugin to process an element.
  };

})(jQuery);