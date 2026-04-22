jQuery(document).on('DOMContentLoaded', function() {
  // Initial application setup alert
  window.alert('Application initialized!');

  // Event handler for initiating drag operations on design elements within the editor form
  jQuery("div.editor-form").on("dragstart", ".design-element", function(dragStartEvent) {
    // Hide any currently visible floating configuration panels
    jQuery(".floating-panel").css("display", "none");

    dragStartEvent.preventDefault(); // Prevent default browser drag behavior

    let elementPositionsOnTop; // Stores elements above the current mouse position in the drop zone
    let cursorPositionX = dragStartEvent.pageX;
    let cursorPositionY = dragStartEvent.pageY;
    let $draggedObject; // Reference to the temporary element being dragged
    let delayIdentifier; // Handle for the initial delay timer
    const $currentDesignItem = jQuery(this); // The design element that was clicked/dragged

    const operationDelays = { // Configurable delays for different operation types
      primary: 0, // No delay for elements from the main component library
      secondary: 150 // Short delay for elements already in the form
    };
    let operationKind; // Distinguishes between adding new elements and moving existing ones

    // Determine if the element is from the main component library or already in the form
    if ($currentDesignItem.parent().parent().parent().parent().attr("id") === "component-library") {
      operationKind = "primary"; // From the component library
    } else {
      operationKind = "secondary"; // Already part of the editable form structure
    }

    // Set a delay before creating the draggable clone to prevent accidental drags
    const activationDelayTimer = setTimeout(function() {
      // Create a temporary representation of the dragged element
      if (operationKind === "primary") {
        $draggedObject = jQuery("<div class='layout-container grid-6' id='temporary-drag-item'>").append($currentDesignItem.clone());
      } else {
        // If it's an existing element, append the element itself (not a clone)
        if ($currentDesignItem.attr("id") !== "element-placeholder") { // Exclude the placeholder element
          $draggedObject = jQuery("<div class='layout-container grid-6' id='temporary-drag-item'>").append($currentDesignItem);
        }
      }

      // Add the temporary draggable object to the body
      jQuery("body").append($draggedObject);

      // Position and style the draggable object
      $draggedObject.css({
        "position": "absolute",
        "top": cursorPositionY - ($draggedObject.outerHeight() / 2) + "px",
        "left": cursorPositionX - ($draggedObject.outerWidth() / 2) + "px",
        "opacity": "0.85"
      }).fadeIn(100); // Fade in the temporary object

      const itemHalfHeight = ($draggedObject.outerHeight() / 2); // Half height for centering
      const itemHalfWidth = ($draggedObject.outerWidth() / 2); // Half width for centering
      const $dropTargetZone = jQuery("#build-area"); // The primary area where elements can be dropped
      const zoneBoundingBox = $dropTargetZone.position(); // Position of the drop zone
      const $currentZoneElements = jQuery("#build-area .design-element"); // All design elements currently in the drop zone

      // Bind mousemove event to the document body for dragging functionality
      jQuery(document).on("mousemove", "body", function(mouseMoveEvent) {

        let currentCursorX = mouseMoveEvent.pageX;
        let currentCursorY = mouseMoveEvent.pageY;

        // Update the position of the dragged object
        $draggedObject.css({
          "top": currentCursorY - itemHalfHeight + "px",
          "left": currentCursorX - itemHalfWidth + "px"
        });

        // Check if the dragged item is within the drop zone boundaries
        if (currentCursorX > zoneBoundingBox.left &&
          currentCursorX < zoneBoundingBox.left + $dropTargetZone.outerWidth() + $draggedObject.outerWidth() / 2 &&
          currentCursorY > zoneBoundingBox.top &&
          currentCursorY < zoneBoundingBox.top + $dropTargetZone.outerHeight() + $draggedObject.outerHeight() / 2
        ) {
          // Highlight the drop zone
          jQuery("#build-area").css("background-color", "#eefaff");
          // Reset borders for all existing elements in the zone
          $currentZoneElements.css({
            "border-top": "1px solid #ffffff",
            "border-bottom": "none"
          });

          // Find elements positioned above the current mouse Y coordinate
          elementPositionsOnTop = jQuery.grep($currentZoneElements, function(elementNode) {
            return (jQuery(elementNode).position().top - currentCursorY + itemHalfHeight > 0 && jQuery(elementNode).attr("id") !== "element-placeholder");
          });

          // Apply a highlight border to indicate insertion point
          if (elementPositionsOnTop.length > 0) {
            jQuery(elementPositionsOnTop[0]).css("border-top", "1px solid #0099ff");
          } else {
            // If no elements are above, highlight the bottom of the last element (or the zone itself if empty)
            if ($currentZoneElements.length > 0) {
              jQuery($currentZoneElements[$currentZoneElements.length - 1]).css("border-bottom", "1px solid #0099ff");
            }
          }
        } else {
          // If outside the drop zone, reset background and borders
          jQuery("#build-area").css("background-color", "#ffffff");
          $currentZoneElements.css({
            "border-top": "1px solid #ffffff",
            "border-bottom": "none"
          });
          $dropTargetZone.css("background-color", "#ffffff");
        }
      });

      // Bind mouseup event to the temporary draggable object for drop functionality
      jQuery("body").on("mouseup", "#temporary-drag-item", function(mouseUpEvent) {
        mouseUpEvent.preventDefault();

        let finalCursorX = mouseUpEvent.pageX;
        let finalCursorY = mouseUpEvent.pageY;
        const finalZonePosition = $dropTargetZone.position(); // Recalculate drop zone position

        // Clear all element borders before determining final placement
        jQuery("#build-area .design-element").css({
          "border-top": "1px solid #ffffff",
          "border-bottom": "none"
        });

        // Process drop only if the mouse is within the designated drop zone
        if (finalCursorX + itemHalfWidth > finalZonePosition.left &&
          finalCursorX - itemHalfWidth < finalZonePosition.left + $dropTargetZone.outerWidth() &&
          finalCursorY + itemHalfHeight > finalZonePosition.top &&
          finalCursorY - itemHalfHeight < finalZonePosition.top + $dropTargetZone.outerHeight()
        ) {
          $draggedObject.attr("style", null); // Remove inline styles from the dropped object
          // Determine placement within the target area
          if (elementPositionsOnTop.length > 0) {
            jQuery($draggedObject.html()).insertBefore(elementPositionsOnTop[0]); // Insert before the first element above
          } else {
            jQuery("#build-area fieldset").append($draggedObject.html()); // Append to the fieldset if no elements above
          }
        } else {
          // If not dropped in valid zone, revert styling and clear potential insertion points
          jQuery("#build-area .design-element").css({
            "border-top": "1px solid #ffffff",
            "border-bottom": "none"
          });
          elementPositionsOnTop = []; // Clear the list of elements above
        }

        // Final cleanup after drag operation and re-enable component info popovers
        $dropTargetZone.css("background-color", "#ffffff"); // Reset drop zone background
        jQuery(document).off("mousemove", "body"); // Unbind the global mousemove handler
        jQuery("body").off("mouseup", "#temporary-drag-item"); // Unbind the temporary item's mouseup handler
        jQuery("#build-area .design-element").popover({
          trigger: "manual"
        }); // Re-initialize popovers for all elements
        $draggedObject.remove(); // Remove the temporary draggable object
        generateCodeSnippet(); // Regenerate the source code display
      });
    }, operationDelays[operationKind]); // Apply the appropriate delay based on operation kind

    // Handle early mouseup or mouseleave to cancel the drag delay
    jQuery(document).on("mouseup", function() {
      clearTimeout(activationDelayTimer); // Clear the delay timer if mouse button is released
      return false; // Prevent default action
    });
    jQuery(this).on("mouseleave", function() {
      clearTimeout(activationDelayTimer); // Clear the delay timer if mouse leaves the element
      return false; // Prevent default action
    });
  });

  // Function to generate and display the current HTML source code of the build area
  const generateCodeSnippet = function() {
    const $temporaryOutputDiv = jQuery("<div>").html(jQuery("#build-area").html());
    // Extensive cleanup of temporary attributes and classes from the generated HTML
    $temporaryOutputDiv.find(".design-element").attr({
      "title": null,
      "data-original-title": null,
      "data-element-category": null,
      "data-display-content": null,
      "rel": null,
      "data-trigger-action": null,
      "style": null
    });
    $temporaryOutputDiv.find(".value-field").attr("data-value-field-id", null).removeClass("value-field");
    $temporaryOutputDiv.find(".design-element").removeClass("design-element");
    $temporaryOutputDiv.find("div.layout-container").attr({
      "id": null,
      "style": null
    });
    // Set the cleaned HTML as the value of the source code display textarea
    jQuery("#output-code-display").val($temporaryOutputDiv.html().replace(/\n {12}/g, "\n"));
  };

  // Initialize dynamic information panels for design elements
  jQuery("#build-area .design-element").popover({
    trigger: "manual"
  });

  // Handle click events on design elements to show their configuration panels
  jQuery("#build-area").on("click", ".design-element", function(clickEvent) {
    clickEvent.preventDefault(); // Prevent default link/button action
    jQuery(".floating-panel").css("display", "none"); // Hide any other open panels
    const $selectedDesignElement = jQuery(this); // The element that was clicked
    $selectedDesignElement.popover("show"); // Show the configuration panel for the selected element
    const elementValueFields = $selectedDesignElement.find(".value-field"); // Find all configurable value fields within the element

    // Iterate through each value field to populate the popover inputs
    jQuery.each(elementValueFields, function(idx, currentFieldNode) {
      const fieldIdentifier = "#" + jQuery(currentFieldNode).attr("data-value-field-id"); // Get the ID for the popover input
      let fieldCurrentValue;

      // Conditional logic to extract and set values based on the field type
      if (fieldIdentifier === "#input-placeholder") {
        fieldCurrentValue = jQuery(currentFieldNode).attr("placeholder");
        jQuery(".floating-panel " + fieldIdentifier).val(fieldCurrentValue);
      } else if (fieldIdentifier === "#input-checkbox") {
        fieldCurrentValue = jQuery(currentFieldNode).prop("checked");
        jQuery(".floating-panel " + fieldIdentifier).prop("checked", fieldCurrentValue);
      } else if (fieldIdentifier === "#select-option") {
        fieldCurrentValue = jQuery.map(jQuery(currentFieldNode).find("option"), function(optNode, optIndex) {
          return jQuery(optNode).text();
        });
        fieldCurrentValue = fieldCurrentValue.join("\n");
        jQuery(".floating-panel " + fieldIdentifier).text(fieldCurrentValue);
      } else if (fieldIdentifier === "#multiple-checkboxes") {
        fieldCurrentValue = jQuery.map(jQuery(currentFieldNode).find("label"), function(labelNode, labelIndex) {
          return jQuery(labelNode).text().trim();
        });
        fieldCurrentValue = fieldCurrentValue.join("\n");
        jQuery(".floating-panel " + fieldIdentifier).text(fieldCurrentValue);
      } else if (fieldIdentifier === "#single-radios") {
        fieldCurrentValue = jQuery.map(jQuery(currentFieldNode).find("label"), function(labelNode, labelIndex) {
          return jQuery(labelNode).text().trim();
        });
        fieldCurrentValue = fieldCurrentValue.join("\n");
        jQuery(".floating-panel " + fieldIdentifier).text(fieldCurrentValue);
      } else if (fieldIdentifier === "#inline-multiple-checkboxes") {
        fieldCurrentValue = jQuery.map(jQuery(currentFieldNode).find("label"), function(labelNode, labelIndex) {
          return jQuery(labelNode).text().trim();
        });
        fieldCurrentValue = fieldCurrentValue.join("\n");
        jQuery(".floating-panel " + fieldIdentifier).text(fieldCurrentValue);
      } else if (fieldIdentifier === "#inline-single-radios") {
        fieldCurrentValue = jQuery.map(jQuery(currentFieldNode).find("label"), function(labelNode, labelIndex) {
          return jQuery(labelNode).text().trim();
        });
        fieldCurrentValue = fieldCurrentValue.join("\n");
        jQuery(".floating-panel " + fieldIdentifier).text(fieldCurrentValue);
      } else if (fieldIdentifier === "#action-button") {
        fieldCurrentValue = jQuery(currentFieldNode).text();
        const buttonStyleType = jQuery(currentFieldNode).find("button").attr("class").split(" ").filter(function(cls) {
          return cls.match(/action-button-.*/);
        });
        jQuery(".floating-panel #button-color-selector option").prop("selected", false); // Deselect all options
        if (buttonStyleType.length === 0) {
          jQuery(".floating-panel #button-color-selector #default-style").prop("selected", true);
        } else {
          jQuery(".floating-panel #button-color-selector #" + buttonStyleType[0]).prop("selected", true);
        }
        fieldCurrentValue = jQuery(currentFieldNode).find(".action-button").text();
        jQuery(".floating-panel #action-button").val(fieldCurrentValue);
      } else {
        fieldCurrentValue = jQuery(currentFieldNode).text();
        jQuery(".floating-panel " + fieldIdentifier).val(fieldCurrentValue);
      }
    });

    // Handle click on the cancel button within the popover
    jQuery(".floating-panel").on("click", ".button-cancel", function(cancelEvent) {
      cancelEvent.preventDefault();
      $selectedDesignElement.popover("hide"); // Hide the popover
    });

    // Handle click on the confirm button within the popover to apply changes
    jQuery(".floating-panel").on("click", ".button-confirm", function(confirmEvent) {
      confirmEvent.preventDefault();
      let configurationInputs = jQuery(".floating-panel input"); // Get all input fields from the popover
      configurationInputs.push(jQuery(".floating-panel textarea")[0]); // Add the textarea to the list
      console.log("Applying changes to element configurations:", configurationInputs);

      // Iterate through each input in the popover to apply changes to the design element
      jQuery.each(configurationInputs, function(inputIndex, inputElement) {
        const inputFieldType = jQuery(inputElement).attr("id"); // Get the ID of the popover input
        const targetElementValue = $selectedDesignElement.find('[data-value-field-id="' + inputFieldType + '"]'); // Find the corresponding field in the design element

        // Apply changes based on the input field type
        if (inputFieldType === "input-placeholder") {
          jQuery(targetElementValue).attr("placeholder", jQuery(inputElement).val());
        } else if (inputFieldType === "input-checkbox") {
          if (jQuery(inputElement).is(":checked")) {
            jQuery(targetElementValue).prop("checked", true);
          } else {
            jQuery(targetElementValue).prop("checked", false);
          }
        } else if (inputFieldType === "select-option") {
          const newOptions = jQuery(inputElement).val().split("\n");
          jQuery(targetElementValue).html(""); // Clear existing options
          jQuery.each(newOptions, function(optIdx, optValue) {
            jQuery(targetElementValue).append("\n        ");
            jQuery(targetElementValue).append(jQuery("<option>").text(optValue));
          });
        } else if (inputFieldType === "multiple-checkboxes") {
          const newCheckboxes = jQuery(inputElement).val().split("\n");
          jQuery(targetElementValue).html("\n      <!-- Multiple Checkboxes Configuration -->");
          jQuery.each(newCheckboxes, function(chkIdx, chkValue) {
            if (chkValue.length > 0) {
              jQuery(targetElementValue).append('\n      <label class="checkbox">\n        <input type="checkbox" value="' + chkValue + '">\n        ' + chkValue + '\n      </label>');
            }
          });
          jQuery(targetElementValue).append("\n  ");
        } else if (inputFieldType === "single-radios") {
          const newRadios = jQuery(inputElement).val().split("\n");
          jQuery(targetElementValue).html("\n      <!-- Multiple Radios Configuration -->");
          jQuery.each(newRadios, function(radioIdx, radioValue) {
            if (radioValue.length > 0) {
              jQuery(targetElementValue).append('\n      <label class="radio">\n        <input type="radio" value="' + radioValue + '">\n        ' + radioValue + '\n      </label>');
            }
          });
          jQuery(targetElementValue).append("\n  ");
          jQuery(jQuery(targetElementValue).find("input")[0]).prop("checked", true); // Select the first radio button by default
        } else if (inputFieldType === "inline-multiple-checkboxes") {
          const newInlineCheckboxes = jQuery(inputElement).val().split("\n");
          jQuery(targetElementValue).html("\n      <!-- Inline Checkboxes Configuration -->");
          jQuery.each(newInlineCheckboxes, function(inlineChkIdx, inlineChkValue) {
            if (inlineChkValue.length > 0) {
              jQuery(targetElementValue).append('\n      <label class="checkbox inline">\n        <input type="checkbox" value="' + inlineChkValue + '">\n        ' + inlineChkValue + '\n      </label>');
            }
          });
          jQuery(targetElementValue).append("\n  ");
        } else if (inputFieldType === "inline-single-radios") {
          const newInlineRadios = jQuery(inputElement).val().split("\n");
          jQuery(targetElementValue).html("\n      <!-- Inline Radios Configuration -->");
          jQuery.each(newInlineRadios, function(inlineRadioIdx, inlineRadioValue) {
            if (inlineRadioValue.length > 0) {
              jQuery(targetElementValue).append('\n      <label class="radio inline">\n        <input type="radio" value="' + inlineRadioValue + '">\n        ' + inlineRadioValue + '\n      </label>');
            }
          });
          jQuery(targetElementValue).append("\n  ");
          jQuery(jQuery(targetElementValue).find("input")[0]).prop("checked", true); // Select the first inline radio button by default
        } else if (inputFieldType === "action-button") {
          const selectedButtonType = jQuery(".floating-panel #button-color-selector option:selected").attr("id");
          jQuery(targetElementValue).find("button").text(jQuery(inputElement).val()).attr("class", "action-button " + selectedButtonType);
        } else {
          jQuery(targetElementValue).text(jQuery(inputElement).val());
        }
        $selectedDesignElement.popover("hide"); // Hide the popover after applying changes
        generateCodeSnippet(); // Regenerate source code
      });
    });
  });

  // Handle navigation tab click to refresh code output
  jQuery("#navigation-tabs").on("click", "#code-view-tab", function(tabEvent) {
    generateCodeSnippet(); // Update the displayed code snippet
  });
});