/*
 * Persistent Element Plugin for jQuery
 * Version: 2.0.0
 * Author: CodeCrafter
 * License: MIT
 * Website: https://www.example.com/persistent-elements
 */

(function(globalScope, factory) {
  'use strict';

  // Universal Module Definition (UMD) for broader compatibility
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS.
    // Exports the factory function which expects jQuery as an argument.
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals (window object).
    // Assumes jQuery is already loaded and available on the global scope.
    factory(globalScope.jQuery);
  }

}(typeof window !== 'undefined' ? window : this, function($) {
  // Ensure jQuery is available before proceeding.
  if (!$) {
    console.error("Persistent Element Plugin: jQuery dependency not found. Please ensure jQuery is loaded.");
    return;
  }

  // Cache frequently used jQuery objects for performance.
  const currentWindow = $(window);
  const documentBody = $(document.body);

  /**
   * Simple debounce utility to limit function calls over time.
   * Useful for events like 'resize' and 'scroll'.
   * @param {Function} func - The function to debounce.
   * @param {number} delay - The debounce delay in milliseconds.
   * @returns {Function} - The debounced function.
   */
  function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      const context = this;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
  }

  /**
   * The main jQuery plugin function to make elements persistent (sticky).
   * @param {Object} userSettings - Configuration options for the plugin.
   * @param {string} [userSettings.pinnedClass="is-pinned-active"] - CSS class applied when element is pinned.
   * @param {boolean} [userSettings.allowScrollAdjust=true] - Allows element to scroll within its pinned state if taller than viewport.
   * @param {number} [userSettings.recheckFrequency=10] - Recalculate dimensions every N scroll/resize events.
   * @param {string} [userSettings.containerSelector=undefined] - Selector for the parent container that limits pinning.
   * @param {number} [userSettings.topOffset=0] - Vertical offset from the top of the viewport when pinned.
   * @param {string|jQuery|boolean|null} [userSettings.customSpacerElement=null] - Custom spacer element (selector string, jQuery object, or `false` to disable auto-spacer).
   * @param {boolean} [userSettings.enableBottomLimit=true] - Prevents element from scrolling past its parent's bottom.
   * @param {boolean} [userSettings.debugMode=false] - Enables console logging for debugging purposes.
   * @returns {jQuery} - The jQuery object for chaining.
   */
  $.fn.pinElement = function(userSettings) {
    // Define default configuration options.
    const defaultSettings = {
      pinnedClass: "is-pinned-active",
      allowScrollAdjust: true,
      recheckFrequency: 10,
      containerSelector: undefined,
      topOffset: 0,
      customSpacerElement: null,
      enableBottomLimit: true,
      debugMode: false
    };

    // Merge user settings with defaults to create the final configuration.
    const config = { ...defaultSettings,
      ...userSettings
    };

    /**
     * Sets up the pinning behavior for a single target element.
     * This function encapsulates all the logic for an individual sticky element.
     * @param {jQuery} targetElement - The jQuery object representing the element to make sticky.
     */
    const setupElementPinning = function(targetElement) {
      // Guard: Prevent re-initialization if the element is already managed.
      if (targetElement.data("pinningStatus")) {
        config.debugMode && console.log("Persistent Element Plugin: Element already initialized, skipping.", targetElement);
        return;
      }

      // Mark the element as initialized.
      targetElement.data("pinningStatus", true);

      let parentContainer = targetElement.parent();
      // If a container selector is provided, find the closest matching ancestor.
      if (config.containerSelector) {
        parentContainer = parentContainer.closest(config.containerSelector);
      }

      // Guard: Ensure a valid parent container is found to limit the sticky behavior.
      if (parentContainer.length === 0) {
        console.warn("Persistent Element Plugin: Could not find a valid parent container for element.", targetElement);
        // Clean up the initialization status if setup fails.
        targetElement.removeData("pinningStatus");
        return;
      }

      // Internal state variables for the current element.
      let isElementPinned = false; // True when the element is in 'fixed' position.
      let isAtBottomLimit = false; // True when the element has hit the parent's bottom.
      let lastScrollPosition; // Stores the previous scroll position for calculating delta.
      let currentVerticalOffset = config.topOffset; // Dynamic top offset for inner scrolling.
      let recalculationCountdown = config.recheckFrequency; // Counter for periodic dimension recalculations.

      // Variables to store element and parent dimensions/positions, updated by `updateDimensionsAndPosition`.
      let elementComputedTop; // The absolute top position of the element when not pinned.
      let elementActualHeight; // The full outer height of the element including margins.
      let elementDisplayFloat; // The float style of the element.
      let parentBorderTop; // Top border width of the parent.
      let parentPaddingTop; // Top padding of the parent.
      let parentPaddingBottom; // Bottom padding of the parent.
      let parentAbsoluteTop; // Absolute top position of the parent's content area.
      let parentActualHeight; // The full height of the parent.

      // Spacer element management.
      // This element takes up space when the target element is pinned, preventing content reflow.
      let spacerReference;
      const disableSpacer = (config.customSpacerElement === false); // Explicitly disable spacer.

      if (!disableSpacer) {
        if (config.customSpacerElement === null || config.customSpacerElement === undefined) {
          // Default: auto-generate a new div as a spacer.
          spacerReference = $('<div></div>');
        } else if (typeof config.customSpacerElement === 'string') {
          // If customSpacerElement is a string, assume it's a selector.
          spacerReference = targetElement.closest(config.customSpacerElement);
          if (spacerReference.length === 0) {
            config.debugMode && console.warn("Persistent Element Plugin: Custom spacer selector did not find an element. Using auto-generated spacer instead.", config.customSpacerElement);
            spacerReference = $('<div></div>');
          }
        } else {
          // Assume customSpacerElement is a jQuery object or a DOM element.
          spacerReference = $(config.customSpacerElement);
        }
      }

      /**
       * Recalculates all necessary dimensions and positions for the element and its parent.
       * This function also handles temporarily unpinning the element to get accurate measurements.
       * @param {boolean} [isRestoring=false] - True if this call is part of restoring a previously pinned state.
       */
      const updateDimensionsAndPosition = function(isRestoring = false) {
        // If the element has been marked for detachment, abort further updates.
        if (targetElement.data("isDetached")) {
          return;
        }

        // Temporarily unpin the element if it's currently pinned, to get its natural dimensions.
        if (isElementPinned) {
          isElementPinned = false;
          isAtBottomLimit = false;
          // If using an auto-generated spacer, put the element back and remove the spacer.
          if (spacerReference && (config.customSpacerElement === null || config.customSpacerElement === undefined)) {
            targetElement.insertAfter(spacerReference);
            spacerReference.detach();
          }
          // Reset CSS properties and remove the pinned class.
          targetElement.css({
            position: "",
            top: "",
            width: "",
            bottom: ""
          }).removeClass(config.pinnedClass);
        }

        // Get parent container's dimensions and position.
        parentBorderTop = parseFloat(parentContainer.css("border-top-width")) || 0;
        parentPaddingTop = parseFloat(parentContainer.css("padding-top")) || 0;
        parentPaddingBottom = parseFloat(parentContainer.css("padding-bottom")) || 0;
        parentAbsoluteTop = parentContainer.offset().top + parentBorderTop + parentPaddingTop;
        parentActualHeight = parentContainer.height();

        // Get target element's dimensions and position.
        elementComputedTop = targetElement.offset().top - (parseFloat(targetElement.css("margin-top")) || 0) - config.topOffset;
        elementActualHeight = targetElement.outerHeight(true); // Includes margin.
        elementDisplayFloat = targetElement.css("float");

        // Update spacer dimensions to match the target element, if a spacer is in use.
        if (spacerReference) {
          spacerReference.css({
            width: targetElement.outerWidth(true),
            height: elementActualHeight,
            display: targetElement.css("display"),
            "vertical-align": targetElement.css("vertical-align"),
            "float": elementDisplayFloat
          });
        }

        // If this recalculation was part of a restoration, immediately process the scroll event
        // to re-apply the pinned state if necessary.
        if (isRestoring) {
          return processScrollEvent();
        }
      };

      // Perform initial dimension calculation.
      updateDimensionsAndPosition();

      // Guard: If the element is taller than or equal to its parent, pinning is not necessary or possible.
      if (elementActualHeight >= parentActualHeight) {
        config.debugMode && console.log("Persistent Element Plugin: Element height is greater than or equal to parent height, pinning disabled for:", targetElement);
        targetElement.removeData("pinningStatus"); // Clean up initialization status.
        return;
      }

      /**
       * Handles scroll and touchmove events to manage the element's pinned state.
       * This is the core logic that determines when to pin, unpin, or adjust the element.
       */
      const processScrollEvent = function() {
        // If the element has been marked for detachment, abort further processing.
        if (targetElement.data("isDetached")) {
          return;
        }

        // Periodically recalculate dimensions to account for DOM changes (e.g., dynamic content loading).
        if (recalculationCountdown !== undefined) {
          recalculationCountdown--;
          if (recalculationCountdown <= 0) {
            recalculationCountdown = config.recheckFrequency;
            updateDimensionsAndPosition(); // Recalculate without restoring state.
          }
        }

        const currentScroll = currentWindow.scrollTop();
        let scrollDelta = 0; // Change in scroll position.
        if (lastScrollPosition !== undefined) {
          scrollDelta = currentScroll - lastScrollPosition;
        }
        lastScrollPosition = currentScroll;

        let willReachBottom = false; // Flag to check if the element is about to hit its parent's bottom.

        if (isElementPinned) {
          // Logic for when the element is currently pinned (position: fixed).

          if (config.enableBottomLimit) {
            // Check if the element is about to go past the parent's bottom boundary.
            willReachBottom = currentScroll + elementActualHeight + currentVerticalOffset > parentActualHeight + parentAbsoluteTop;
            if (isAtBottomLimit && !willReachBottom) {
              // If it was at the bottom limit but is now scrolling up and can un-bottom.
              isAtBottomLimit = false;
              targetElement.css({
                position: "fixed",
                bottom: "",
                top: currentVerticalOffset
              }).trigger("pinning:unbottom"); // Custom event.
              config.debugMode && console.log("Persistent Element Plugin: Element unbottomed.", targetElement);
            }
          }

          if (currentScroll < elementComputedTop) {
            // If the user scrolls above the element's original position, unpin it.
            isElementPinned = false;
            currentVerticalOffset = config.topOffset; // Reset offset.
            // If using an auto-generated spacer, move the element back and detach the spacer.
            if (spacerReference && (config.customSpacerElement === null || config.customSpacerElement === undefined)) {
              if (elementDisplayFloat === "left" || elementDisplayFloat === "right") {
                targetElement.insertAfter(spacerReference);
              }
              spacerReference.detach();
            }
            targetElement.css({
              position: "",
              width: "",
              top: ""
            }).removeClass(config.pinnedClass).trigger("pinning:unpin"); // Custom event.
            config.debugMode && console.log("Persistent Element Plugin: Element unpinned.", targetElement);
          }

          if (config.allowScrollAdjust) {
            // If inner scrolling is allowed and the element is taller than the viewport,
            // adjust its top position to allow it to scroll within the viewport.
            const viewportHeight = currentWindow.height();
            if (elementActualHeight + config.topOffset > viewportHeight) {
              if (!isAtBottomLimit) {
                currentVerticalOffset -= scrollDelta; // Adjust offset based on scroll direction.
                currentVerticalOffset = Math.max(viewportHeight - elementActualHeight, currentVerticalOffset); // Prevent element from going off bottom.
                currentVerticalOffset = Math.min(config.topOffset, currentVerticalOffset); // Prevent element from going off top beyond initial offset.
                if (isElementPinned) { // Only apply if still pinned.
                  targetElement.css({
                    top: currentVerticalOffset + "px"
                  });
                }
                config.debugMode && console.log("Persistent Element Plugin: Adjusting pinned element offset.", targetElement, currentVerticalOffset);
              }
            }
          }
        } else {
          // Logic for when the element is not pinned (position: static/relative).
          // Check if the user has scrolled past the element's original position, triggering pinning.
          if (currentScroll > elementComputedTop) {
            isElementPinned = true;
            const elementStyles = {
              position: "fixed",
              top: currentVerticalOffset
            };
            // Calculate width considering box-sizing to prevent reflow.
            elementStyles.width = targetElement.css("box-sizing") === "border-box" ?
              targetElement.outerWidth() + "px" :
              targetElement.width() + "px";

            targetElement.css(elementStyles).addClass(config.pinnedClass);

            // If using an auto-generated spacer, insert it into the DOM to hold the space.
            if (spacerReference && (config.customSpacerElement === null || config.customSpacerElement === undefined)) {
              targetElement.after(spacerReference);
              // If the element has a float, move it inside the spacer to maintain layout.
              if (elementDisplayFloat === "left" || elementDisplayFloat === "right") {
                spacerReference.append(targetElement);
              }
            }
            targetElement.trigger("pinning:pin"); // Custom event.
            config.debugMode && console.log("Persistent Element Plugin: Element pinned.", targetElement);
          }
        }

        // Final check for the bottom limit, applies regardless of initial pinned state.
        if (isElementPinned && config.enableBottomLimit) {
          if (willReachBottom === false) { // Re-evaluate if not already set by earlier logic.
            willReachBottom = currentScroll + elementActualHeight + currentVerticalOffset > parentActualHeight + parentAbsoluteTop;
          }

          if (!isAtBottomLimit && willReachBottom) {
            isAtBottomLimit = true;
            // If the parent container has static positioning, change it to relative
            // so that the absolutely positioned child (sticky element) can be contained.
            if (parentContainer.css("position") === "static") {
              parentContainer.data("originalPosition", "static"); // Store original position.
              parentContainer.css({
                position: "relative"
              });
            }
            targetElement.css({
              position: "absolute",
              bottom: parentPaddingBottom,
              top: "auto" // Reset top to allow bottom to take effect.
            }).trigger("pinning:bottom"); // Custom event.
            config.debugMode && console.log("Persistent Element Plugin: Element reached bottom limit.", targetElement);
          }
        }
      };

      /**
       * Combines dimension recalculation and scroll processing.
       * Used for events like resize where a full update is needed.
       */
      const fullUpdateCycle = function() {
        updateDimensionsAndPosition(true); // Recalculate dimensions and then restore the pinned state.
      };

      /**
       * Cleans up all event listeners and resets the element's styles.
       * This effectively "detaches" the element from the pinning behavior.
       */
      const cleanupPinning = function() {
        targetElement.data("isDetached", true); // Mark element as detached to prevent further processing.
        config.debugMode && console.log("Persistent Element Plugin: Detaching element.", targetElement);

        // Remove all event listeners associated with this element.
        currentWindow.off("touchmove", processScrollEvent);
        currentWindow.off("scroll", processScrollEvent);
        currentWindow.off("resize", debouncedFullUpdateCycle);
        documentBody.off("pinning:recalc", fullUpdateCycle);
        targetElement.off("pinning:detach", cleanupPinning);

        // Remove all plugin-related data from the element.
        targetElement.removeData("pinningStatus");
        targetElement.removeData("isDetached");

        // Reset the element's inline styles.
        targetElement.css({
          position: "",
          bottom: "",
          top: "",
          width: ""
        });
        // Restore parent's original position if it was modified by the plugin.
        if (parentContainer.data("originalPosition") !== undefined) {
          parentContainer.css("position", parentContainer.data("originalPosition"));
          parentContainer.removeData("originalPosition");
        }

        // If the element was pinned, handle spacer removal and class cleanup.
        if (isElementPinned) {
          if (spacerReference && (config.customSpacerElement === null || config.customSpacerElement === undefined)) {
            // If element was moved inside spacer, move it back out before removing spacer.
            if (elementDisplayFloat === "left" || elementDisplayFloat === "right") {
                targetElement.insertAfter(spacerReference);
            }
            spacerReference.remove();
          }
          targetElement.removeClass(config.pinnedClass);
        }
        config.debugMode && console.log("Persistent Element Plugin: Element detached successfully.", targetElement);
      };

      // Debounce the full update cycle for resize events to improve performance.
      const debouncedFullUpdateCycle = debounce(fullUpdateCycle, 150);

      // Attach event listeners for scroll, touchmove, and resize events.
      currentWindow.on("touchmove", processScrollEvent);
      currentWindow.on("scroll", processScrollEvent);
      currentWindow.on("resize", debouncedFullUpdateCycle);
      // Custom event to allow external triggers for recalculation.
      documentBody.on("pinning:recalc", fullUpdateCycle);
      // Custom event to allow external triggers for detachment.
      targetElement.on("pinning:detach", cleanupPinning);

      // Perform an initial scroll event processing to set the element's state correctly on load.
      // Use requestAnimationFrame for smoother initial rendering if available, otherwise fallback to setTimeout.
      (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : setTimeout)(processScrollEvent, 0);
    };

    // Iterate over each selected element in the jQuery collection and apply the pinning logic.
    this.each(function() {
      setupElementPinning($(this));
    });

    return this; // Enable jQuery method chaining.
  };

}));