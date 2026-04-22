/*
 * Modern Toggle Plugin - A jQuery-based UI component for enhanced checkboxes.
 * Version 1.0.0 - Developed for improved clarity and modularity.
 * Licensed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
 */

!function (jq) {
  "use strict";

  // Extend jQuery's prototype to add our new plugin.
  jq.fn['modernToggle'] = function (actionIdentifier) {

    // Collection of methods available for the 'modernToggle' plugin.
    var pluginMethods = {

      // Initializes the toggle component for each matched element.
      initialize: function () {
        return this.each(function () {
          var currentHostElement = jq(this); // The jQuery object for the current DOM element.

          // Pre-check: Ensure the element contains a valid checkbox input.
          var hostedCheckbox = currentHostElement.find(':checkbox');
          if (hostedCheckbox.length === 0) {
            console.warn("ModernToggle: Target element does not contain a checkbox. Skipping initialization.", currentHostElement);
            return;
          }

          // Prevent re-initialization on elements already processed.
          if (currentHostElement.data('modernToggleInitialized')) {
            return;
          }
          currentHostElement.data('modernToggleInitialized', true);

          // Default configuration settings for the toggle.
          var componentConfig = {
            onText: "YES", // Text for the 'ON' state.
            offText: "NO",  // Text for the 'OFF' state.
            sizeClass: "",  // CSS class for size (e.g., 'toggle-compact').
            onColor: "toggle-primary", // CSS class for 'ON' state color.
            offColor: "toggle-secondary",// CSS class for 'OFF' state color.
            displayIcon: false, // Icon to display in the middle label.
            isAnimated: true    // Whether transitions should be animated.
          };

          // Helper to safely retrieve data attributes, providing a fallback.
          var retrieveDataAttribute = function (key, defaultValue) {
            var attributeValue = currentHostElement.data(key);
            return (attributeValue !== undefined) ? attributeValue : defaultValue;
          };

          // Merge data attributes into the configuration.
          componentConfig.onText = retrieveDataAttribute('on-label', componentConfig.onText);
          componentConfig.offText = retrieveDataAttribute('off-label', componentConfig.offText);
          componentConfig.displayIcon = retrieveDataAttribute('icon', componentConfig.displayIcon);
          componentConfig.isAnimated = retrieveDataAttribute('animated', componentConfig.isAnimated);

          // Determine the appropriate size class from existing CSS classes.
          jq.each(['toggle-tiny', 'toggle-compact', 'toggle-spacious'], function (idx, cls) {
            if (currentHostElement.hasClass(cls)) {
              componentConfig.sizeClass = cls;
              return false; // Exit loop once a matching class is found.
            }
          });

          // Set colors based on data attributes, falling back to defaults.
          componentConfig.onColor = 'toggle-' + retrieveDataAttribute('on', 'primary');
          componentConfig.offColor = 'toggle-' + retrieveDataAttribute('off', 'secondary');

          // Wrap the original checkbox with a new container div.
          var toggleWrapper = hostedCheckbox.wrap(jq('<div>')).parent();
          toggleWrapper.addClass('toggle-container'); // Apply base container class.

          // Create the left (ON) segment.
          var leftSegment = jq('<span>')
            .addClass("toggle-left")
            .addClass(componentConfig.sizeClass)
            .addClass(componentConfig.onColor)
            .html(componentConfig.onText);

          // Create the right (OFF) segment.
          var rightSegment = jq('<span>')
            .addClass("toggle-right")
            .addClass(componentConfig.sizeClass)
            .addClass(componentConfig.offColor)
            .html(componentConfig.offText);

          // Create the central label segment.
          var middleLabel = jq('<label>')
            .addClass(componentConfig.sizeClass)
            .attr('for', hostedCheckbox.attr('id') || '') // Link to checkbox ID if available.
            .html("&nbsp;"); // Placeholder for content.

          // If an icon is specified, embed it into the label.
          if (componentConfig.displayIcon) {
            middleLabel.html('<i class="icon icon-' + componentConfig.displayIcon + '"></i>');
          }

          // Assemble the toggle structure.
          toggleWrapper
            .append(leftSegment)
            .append(middleLabel)
            .append(rightSegment);

          // Apply animation class if configured.
          if (componentConfig.isAnimated) {
            toggleWrapper.addClass('toggle-animated');
          } else {
            toggleWrapper.removeClass('toggle-animated'); // Ensure no animation if explicitly disabled.
          }

          // Set initial visual state based on the checkbox's checked property.
          currentHostElement.addClass('has-toggle'); // Mark the parent as hosting a toggle.
          toggleWrapper.addClass(hostedCheckbox.is(':checked') ? 'toggle-active' : 'toggle-inactive');

          // Apply disabled styling if the checkbox is initially disabled.
          if (hostedCheckbox.is(':disabled')) {
            currentHostElement.addClass('toggle-disabled');
          }

          // Utility function to stop event propagation and prevent default action.
          var haltEvent = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
          };

          // Function to simulate a click on the label to change checkbox state.
          var activateToggleInteraction = function (triggeringElement) {
            triggeringElement.siblings('label').trigger('mousedown').trigger('mouseup').trigger('click');
          };

          // Event handler for keyboard navigation (spacebar to toggle).
          currentHostElement.on('keydown', function (evt) {
            if (evt.keyCode === 32) { // Space key.
              haltEvent(evt);
              activateToggleInteraction(jq(evt.target).find('span:first')); // Target the 'ON' segment.
            }
          });

          // Click handlers for the ON/OFF segments.
          leftSegment.on('click', function (evt) {
            haltEvent(evt);
            activateToggleInteraction(jq(this));
          });

          rightSegment.on('click', function (evt) {
            haltEvent(evt);
            activateToggleInteraction(jq(this));
          });

          // Handler for the internal checkbox's 'change' event.
          hostedCheckbox.on('change', function (evt, suppressUserCallback) {
            var currentCheckbox = jq(this);
            var parentToggleWrapper = currentCheckbox.parent();
            var isCurrentlyChecked = currentCheckbox.is(':checked');
            var isWrapperInactive = parentToggleWrapper.hasClass('toggle-inactive');

            haltEvent(evt);

            // Reset any temporary 'left' CSS property from dragging.
            parentToggleWrapper.css('left', '');

            // Update visual state only if it doesn't match the current checkbox state.
            if ((isWrapperInactive && isCurrentlyChecked) || (!isWrapperInactive && !isCurrentlyChecked)) {
              parentToggleWrapper
                .toggleClass('toggle-active', isCurrentlyChecked)
                .toggleClass('toggle-inactive', !isCurrentlyChecked);

              // Re-apply animation class if it was removed during a drag operation.
              if (componentConfig.isAnimated) {
                parentToggleWrapper.addClass("toggle-animated");
              }

              // Trigger a custom event for external listeners, unless suppressed.
              if (!suppressUserCallback) {
                currentHostElement.trigger('toggle-value-changed', {'element': currentCheckbox, 'value': isCurrentlyChecked});
              }
            }
          });

          // State variable to track if a drag operation is active.
          var isDraggingLabel = false;

          // Mouse and touch interaction for the middle label (dragging).
          middleLabel.on('mousedown touchstart', function (evt) {
            var currentLabel = jq(this);
            isDraggingLabel = false; // Reset drag flag at the start of interaction.
            haltEvent(evt);

            // Temporarily remove animation for smoother dragging feedback.
            currentLabel.closest('.toggle-container').removeClass('toggle-animated');

            // If the toggle is disabled, prevent any further interaction.
            if (currentLabel.closest('.has-toggle').hasClass('toggle-disabled')) {
              return;
            }

            // Bind 'mousemove'/'touchmove' for the dragging action.
            currentLabel.on('mousemove touchmove', function (dragEvt) {
              isDraggingLabel = true; // Mark as dragging.
              var parentToggle = jq(this).closest('.toggle-container');
              var currentX = (dragEvt.pageX || (dragEvt.originalEvent.targetTouches && dragEvt.originalEvent.targetTouches[0] && dragEvt.originalEvent.targetTouches[0].pageX));

              if (currentX === undefined) return; // Guard for missing touch data in some events.

              var relativeCoordX = currentX - parentToggle.offset().left;
              var percentage = (relativeCoordX / parentToggle.width()) * 100;

              // Define the boundaries for the label's movement.
              var minDragBoundary = 18; // Minimum percentage for label's left edge.
              var maxDragBoundary = 82; // Maximum percentage for label's left edge.

              percentage = Math.max(minDragBoundary, Math.min(maxDragBoundary, percentage));

              // Adjust the wrapper's 'left' CSS property to simulate drag.
              parentToggle.find('>div').css('left', (percentage - maxDragBoundary) + "%");
            });

            // Bind 'click'/'touchend' for releasing the label.
            currentLabel.on('click touchend', function (releaseEvt) {
              var releasedLabel = jq(this);
              var targetInput = releasedLabel.siblings('input');
              haltEvent(releaseEvt);

              // Unbind all move and leave events previously attached.
              releasedLabel.off('mousemove touchmove mouseleave');

              if (isDraggingLabel) {
                // Determine final checked state based on where the label was released.
                var finalLeftPosition = parseInt(releasedLabel.parent().css('left'), 10);
                targetInput.prop('checked', (finalLeftPosition < -15)); // If moved significantly left, it's 'off'.
              } else {
                // If it was a simple click (no drag), just toggle the current state.
                targetInput.prop("checked", !targetInput.is(":checked"));
              }

              isDraggingLabel = false; // Reset drag flag.
              targetInput.trigger('change'); // Trigger the checkbox's change event.
            });

            // Handle 'mouseleave' event during a drag operation.
            currentLabel.on('mouseleave', function (leaveEvt) {
              var leavingLabel = jq(this);
              var associatedCheckbox = leavingLabel.siblings('input');
              haltEvent(leaveEvt);

              leavingLabel.off('mousemove touchmove mouseleave'); // Unbind all drag-related events.
              leavingLabel.trigger('mouseup'); // Simulate a mouseup to finalize state.

              // Determine state based on position when mouse leaves.
              var currentOffset = parseInt(leavingLabel.parent().css('left'), 10);
              associatedCheckbox.prop('checked', (currentOffset < -15)).trigger('change');
            });

            // 'mouseup' event to clean up 'mousemove' binding.
            currentLabel.on('mouseup', function (upEvt) {
              haltEvent(upEvt);
              jq(this).off('mousemove touchmove'); // Remove only the move event handlers.
            });
          });
        });
      },

      // Toggles the disabled/enabled state of the toggle.
      flipActiveState: function () {
        return this.each(function () {
          jq(this).toggleClass('toggle-disabled');
        });
      },

      // Checks if the toggle is currently enabled.
      isToggleEnabled: function () {
        // Returns true if the 'toggle-disabled' class is NOT present.
        return !jq(this).hasClass('toggle-disabled');
      },

      // Sets the enabled/disabled state explicitly.
      setToggleEnabled: function (isEnabled) {
        return this.each(function () {
          var currentHost = jq(this);
          if (isEnabled) {
            currentHost.removeClass('toggle-disabled');
          } else {
            currentHost.addClass('toggle-disabled');
          }
        });
      },

      // Toggles the ON/OFF state of the internal checkbox.
      switchState: function (omitChangeEvent) {
        return this.each(function () {
          var targetCheckbox = jq(this).find('input:checkbox');
          // Invert the checked property and trigger its change event.
          targetCheckbox.prop('checked', !targetCheckbox.is(':checked')).trigger('change', omitChangeEvent);
        });
      },

      // Sets the ON/OFF state to a specific boolean value.
      setSpecificState: function (newState, omitChangeEvent) {
        return this.each(function () {
          // Ensure newState is a boolean and apply it.
          jq(this).find('input:checkbox').prop('checked', !!newState).trigger('change', omitChangeEvent);
        });
      },

      // Retrieves the current ON/OFF status of the toggle.
      getToggleStatus: function () {
        return jq(this).find('input:checkbox').is(':checked');
      },

      // Removes the toggle functionality and restores the original checkbox.
      dispose: function () {
        return this.each(function () {
          var elementHost = jq(this);
          var toggleDiv = elementHost.find('.toggle-container');
          var originalCheckbox;

          // If the toggle wrapper doesn't exist, it's either not initialized or already disposed.
          if (toggleDiv.length === 0) {
             return;
          }

          // Remove all elements within the wrapper except the original checkbox.
          toggleDiv.find(':not(input:checkbox)').remove();

          originalCheckbox = toggleDiv.children(); // The checkbox should now be the only child.
          originalCheckbox.unwrap().unwrap(); // Remove the two layers of wrappers.

          originalCheckbox.off('change'); // Unbind internal change handler from the checkbox.
          elementHost.off('.modernToggle'); // Unbind all events namespaced by this plugin from the host.

          elementHost.removeData('modernToggleInitialized'); // Clean up the initialization flag.
          elementHost.removeClass('has-toggle toggle-disabled'); // Remove host-specific classes.

          // Return the original checkbox for potential further manipulation.
          return originalCheckbox;
        });
      }
    };

    // Method dispatcher: check if a specific method is called or if it's an initialization.
    if (pluginMethods[actionIdentifier]) {
      // Execute the specified method with the provided arguments.
      return pluginMethods[actionIdentifier].apply(this, [].slice.call(arguments, 1));
    } else if (typeof actionIdentifier === 'object' || !actionIdentifier) {
      // If no method name or an options object is provided, call the 'initialize' method.
      return pluginMethods.initialize.apply(this, arguments);
    } else {
      // Log an error for unknown method calls.
      console.error('ModernToggle: Method "' + actionIdentifier + '" does not exist!');
      return this; // Return 'this' for chaining, even in case of an error.
    }
  };

}(jQuery); // Pass jQuery object to the self-executing function.

// Auto-initialize any elements with the 'toggle-switch' class on document ready.
jQuery(function () {
  jQuery('.toggle-switch')['modernToggle']();
});