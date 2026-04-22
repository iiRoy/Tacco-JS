/*
 * ============================================================
 * Custom Toggle Switch Component v1.0 by Code Clone Bot
 * Enhanced for modern web applications.
 * ============================================================
 * This code is provided under an open-source license.
 * For details, please refer to the project's official repository.
 * ============================================================
 */

(function (jq_lib_instance) {

  "use strict"; // Enforce stricter parsing and error handling

  // Extend jQuery's prototype with our new toggle functionality
  jq_lib_instance.fn['binaryToggleControl'] = function (operationType) {

    // Define internal functions for component management
    var internalRoutines = {

      // Initializes each matched element into a toggle switch
      initializeComponent: function () {
        return this.each(function () {
          // Cache the current host element as a jQuery object
          var currentHost = jq_lib_instance(this),
            mainContainer, // Main wrapper for the toggle
            leftButtonPanel, // Left side of the toggle (e.g., "ON")
            rightButtonPanel, // Right side of the toggle (e.g., "OFF")
            centralLabelElement, // The draggable label in the middle
            specificCssClasses = "", // Stores size classes like 'switch-small'
            allHostClasses = currentHost.attr('class'), // All classes on the host element
            visualStyle, // Color theme for the toggle
            isUserDragging, // Flag to track if the user is dragging the label
            activeStateText = "ON", // Text for the active state
            inactiveStateText = "OFF", // Text for the inactive state
            displayIcon = false; // Optional icon for the label

          // Iterate through common size classes to find one on the host
          jq_lib_instance.each(['switch-mini', 'switch-small', 'switch-large'], function (indexVal, classNameString) {
            if (allHostClasses.indexOf(classNameString) >= 0) {
              specificCssClasses = classNameString;
            }
          });

          // Mark the host element as a toggle container
          currentHost.addClass('has-switch');

          // Read custom 'on' color from data attributes
          if (currentHost.data('on') !== undefined) {
            visualStyle = "switch-" + currentHost.data('on');
          }

          // Read custom 'on' label text
          if (currentHost.data('on-label') !== undefined) {
            activeStateText = currentHost.data('on-label');
          }

          // Read custom 'off' label text
          if (currentHost.data('off-label') !== undefined) {
            inactiveStateText = currentHost.data('off-label');
          }

          // Read custom icon name
          if (currentHost.data('icon') !== undefined) {
            displayIcon = currentHost.data('icon');
          }

          // Create the left button element
          leftButtonPanel = jq_lib_instance('<span>')
            .addClass("switch-left")
            .addClass(specificCssClasses)
            .addClass(visualStyle)
            .html(activeStateText);

          // Reset visual style for the right button
          visualStyle = '';
          // Read custom 'off' color from data attributes
          if (currentHost.data('off') !== undefined) {
            visualStyle = "switch-" + currentHost.data('off');
          }

          // Create the right button element
          rightButtonPanel = jq_lib_instance('<span>')
            .addClass("switch-right")
            .addClass(specificCssClasses)
            .addClass(visualStyle)
            .html(inactiveStateText);

          // Create the central label element
          centralLabelElement = jq_lib_instance('<label>')
            .html("&nbsp;") // Non-breaking space for initial sizing
            .addClass(specificCssClasses)
            .attr('for', currentHost.find('input').attr('id')); // Link to the hidden checkbox

          // If an icon is specified, replace the label content
          if (displayIcon) {
            centralLabelElement.html('<i class="icon icon-' + displayIcon + '"></i>');
          }

          // Wrap the hidden checkbox with a new div, then store a reference to this div
          mainContainer = currentHost.find(':checkbox').wrap(jq_lib_instance('<div>')).parent().data('animated', false);

          // Check if animation is enabled via data attribute
          if (currentHost.data('animated') !== false) {
            mainContainer.addClass('switch-animate').data('animated', true);
          }

          // Append all parts to the main container
          mainContainer
            .append(leftButtonPanel)
            .append(centralLabelElement)
            .append(rightButtonPanel);

          // Set initial state based on checkbox checked property
          currentHost.find('>div').addClass(
            currentHost.find('input').is(':checked') ? 'switch-on' : 'switch-off'
          );

          // Add 'deactivate' class if the input is disabled
          if (currentHost.find('input').is(':disabled')) {
            jq_lib_instance(this).addClass('deactivate');
          }

          // Helper function to simulate a click on the label to change state
          var adjustToggleStatus = function (eventSource) {
            eventSource.siblings('label').trigger('mousedown').trigger('mouseup').trigger('click');
          };

          // Handle keyboard interaction for accessibility (spacebar)
          currentHost.on('keydown', function (eventObject) {
            if (eventObject.keyCode === 32) { // Spacebar key code
              eventObject.stopImmediatePropagation();
              eventObject.preventDefault();
              adjustToggleStatus(jq_lib_instance(eventObject.target).find('span:first'));
            }
          });

          // Click handler for the left part of the toggle
          leftButtonPanel.on('click', function (eventObject) {
            adjustToggleStatus(jq_lib_instance(this));
          });

          // Click handler for the right part of the toggle
          rightButtonPanel.on('click', function (eventObject) {
            adjustToggleStatus(jq_lib_instance(this));
          });


          // Handle actual checkbox state changes
          currentHost.find('input').on('change', function (eventInfo, suppressExternalChange) {
            var changedInput = jq_lib_instance(this),
              parentContainer = changedInput.parent(),
              newCheckedStatus = changedInput.is(':checked'),
              isCurrentlyOff = parentContainer.is('.switch-off');

            eventInfo.preventDefault();

            // Clear inline 'left' style to allow CSS transitions
            parentContainer.css('left', '');

            // Only proceed if the visual state needs to change
            if (isCurrentlyOff === newCheckedStatus) {

              if (newCheckedStatus) { // If newly checked
                parentContainer.removeClass('switch-off').addClass('switch-on');
              } else { // If newly unchecked
                parentContainer.removeClass('switch-on').addClass('switch-off');
              }

              // Re-add animation class if configured
              if (parentContainer.data('animated') !== false) {
                parentContainer.addClass("switch-animate");
              }

              // Prevent triggering external change event if suppressed
              if (typeof suppressExternalChange === 'boolean' && suppressExternalChange) {
                return;
              }

              // Trigger a custom event for external listeners
              parentContainer.parent().trigger('switch-change', {
                'element': changedInput,
                'status': newCheckedStatus
              })
            }
          });


          // Handle mouse/touch interactions for the central label
          currentHost.find('label').on('mousedown touchstart', function (mouseEvent) {
            var currentLabel = jq_lib_instance(this);
            isUserDragging = false; // Reset drag flag

            mouseEvent.preventDefault(); // Prevent default browser behavior
            mouseEvent.stopImmediatePropagation(); // Stop event propagation

            // Temporarily remove animation class during drag
            currentLabel.closest('div').removeClass('switch-animate');

            // If the control is disabled, unbind click
            if (currentLabel.closest('.has-switch').is('.deactivate')) {
              currentLabel.unbind('click');
            } else {
              // Mouse/touch move handler for dragging
              currentLabel.on('mousemove touchmove', function (mouseEvent) {
                var affectedToggle = jq_lib_instance(this).closest('.switch'),
                  pointerXPosition = (mouseEvent.pageX || mouseEvent.originalEvent.targetTouches[0].pageX) - affectedToggle.offset().left,
                  slidePercentage = (pointerXPosition / affectedToggle.width()) * 100,
                  minThreshold = 25, // Minimum percentage for label movement
                  maxThreshold = 75; // Maximum percentage for label movement

                isUserDragging = true; // Set drag flag

                // Constrain the label movement within bounds
                if (slidePercentage < minThreshold) {
                  slidePercentage = minThreshold;
                } else if (slidePercentage > maxThreshold) {
                  slidePercentage = maxThreshold;
                }

                // Apply the calculated position to the inner div
                affectedToggle.find('>div').css('left', (slidePercentage - maxThreshold) + "%")
              });

              // Click/touchend handler for finalizing the drag or simple click
              currentLabel.on('click touchend', function (mouseEvent) {
                var labelInstance = jq_lib_instance(this),
                  eventTriggerElement = jq_lib_instance(mouseEvent.target),
                  associatedCheckbox = eventTriggerElement.siblings('input');

                mouseEvent.stopImmediatePropagation();
                mouseEvent.preventDefault();

                labelInstance.unbind('mouseleave'); // Clear mouseleave handler

                if (isUserDragging) { // If it was a drag, set state based on final position
                  associatedCheckbox.prop('checked', !(parseInt(labelInstance.parent().css('left')) < -25));
                } else { // If it was a simple click, just toggle the state
                  associatedCheckbox.prop("checked", !associatedCheckbox.is(":checked"));
                }

                isUserDragging = false; // Reset drag flag
                associatedCheckbox.trigger('change'); // Trigger change event
              });

              // Mouseleave handler to finalize state if drag ends outside
              currentLabel.on('mouseleave', function (mouseEvent) {
                var labelRef = jq_lib_instance(this),
                  linkedInput = labelRef.siblings('input');

                mouseEvent.preventDefault();
                mouseEvent.stopImmediatePropagation();

                labelRef.unbind('mouseleave'); // Remove itself
                labelRef.trigger('mouseup'); // Simulate mouseup to clean upmousemove

                // Set checkbox state based on current label position and trigger change
                linkedInput.prop('checked', !(parseInt(labelRef.parent().css('left')) < -25)).trigger('change');
              });

              // Mouseup handler to stop tracking mousemove
              currentLabel.on('mouseup', function (mouseEvent) {
                mouseEvent.stopImmediatePropagation();
                mouseEvent.preventDefault();

                jq_lib_instance(this).unbind('mousemove'); // Detach mousemove handler
              });
            }
          });
        });
      },

      // Toggles the activation state of the control
      flipControlActivity: function () {
        jq_lib_instance(this).toggleClass('deactivate');
      },

      // Checks if the control is currently active
      checkControlActivity: function () {
        return !jq_lib_instance(this).hasClass('deactivate');
      },

      // Sets the activation state of the control
      setControlActivity: function (shouldBeActive) {
        if (shouldBeActive) {
          jq_lib_instance(this).removeClass('deactivate');
        } else {
          jq_lib_instance(this).addClass('deactivate');
        }
      },

      // Toggles the checked state of the internal checkbox
      cycleControlState: function (suppressEvent) {
        var linkedInputBox = jq_lib_instance(this).find('input:checkbox');
        linkedInputBox.prop('checked', !linkedInputBox.is(':checked')).trigger('change', suppressEvent);
      },

      // Sets the checked state of the internal checkbox to a specific value
      setSpecificState: function (newStateValue, suppressEvent) {
        jq_lib_instance(this).find('input:checkbox').prop('checked', newStateValue).trigger('change', suppressEvent);
      },

      // Returns the current checked status of the internal checkbox
      getControlState: function () {
        return jq_lib_instance(this).find('input:checkbox').is(':checked');
      },

      // Removes the custom toggle structure and restores the original checkbox
      dismantleComponent: function () {
        var wrapperElement = jq_lib_instance(this).find('div'),
          originalCheckbox;

        // Remove all elements except the original checkbox
        wrapperElement.find(':not(input:checkbox)').remove();

        // Get the original checkbox element
        originalCheckbox = wrapperElement.children();
        // Unwrap the checkbox from its parent divs
        originalCheckbox.unwrap().unwrap();

        // Remove any change event handlers attached by the component
        originalCheckbox.unbind('change');

        return originalCheckbox; // Return the restored checkbox
      }
    };

    // Execute the requested method or initialize if no method is specified
    if (internalRoutines[operationType]) {
      // Call the method with arguments, excluding the method name itself
      return internalRoutines[operationType].apply(this, [].slice.call(arguments, 1));
    } else if (typeof operationType === 'object' || !operationType) {
      // If no method or an object (options) is passed, initialize the component
      return internalRoutines.initializeComponent.apply(this, arguments);
    } else {
      // If an unknown method is requested, throw an error
      jq_lib_instance.error('Operation ' + operationType + ' not found!');
    }
  };

}(jQuery)); // Pass jQuery object to the immediately invoked function

// Initialize all toggle controls on document ready
jq_lib_instance(function () {
  jq_lib_instance('.switch-element')['binaryToggleControl']();
});