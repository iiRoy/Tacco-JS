(function($) {
  // A utility object to manage popover interactions, demonstrating a new code fragment.
  const ElementPopupHandler = (function() {
    // Private function to hide all active popovers.
    function concealAllPopups() {
      $(".form-element-properties-popup").hide();
    }

    // Public method to activate popover on a given jQuery element.
    function enableManualPopup($targetElement) {
      // Guard clause: ensure element exists before trying to activate popover.
      if ($targetElement && $targetElement.length > 0) {
        $targetElement.popover({
          trigger: "manual",
          placement: "auto", // Automatically determine best placement
          container: "body" // Attach popover to body to avoid clipping issues
        });
      }
    }

    return {
      hideAll: concealAllPopups,
      activateFor: enableManualPopup
    };
  })();

  // Main application entry point: executes when the DOM is fully loaded.
  $(function() { // Using shorthand for $(document).ready()

    // Initialize popovers for all existing form elements in the design area.
    $("#designArea .form-element").each(function() {
      ElementPopupHandler.activateFor($(this));
    });

    // Function to generate and update the displayed HTML source code.
    // This is a refactored and renamed version of the original 'genSource'.
    const updateSourceCodePreview = function() {
      const $workingCopy = $("<div>").html($("#formBuilderCanvas").html()); // Renamed #build to #formBuilderCanvas

      // Systematically remove builder-specific attributes and classes for clean output.
      $workingCopy.find(".form-element").removeAttr("title data-original-title data-type data-content rel trigger style");
      $workingCopy.find(".property-editor-target").removeAttr("data-property-type").removeClass("property-editor-target");
      $workingCopy.find(".form-element").removeClass("form-element draggable-item"); // Remove drag-related classes
      $workingCopy.find("form").removeAttr("id style");

      // Format the HTML output: remove excessive line breaks and leading spaces.
      const cleanedHtmlString = $workingCopy.html().replace(/\n\s*(\S)/g, "\n$1").replace(/\n{2,}/g, "\n").trim();
      $("#generatedMarkupOutput").val(cleanedHtmlString); // Renamed #source to #generatedMarkupOutput
    };

    // Event handler for initiating a drag operation on form elements.
    // Replaced 'delegate' with 'on' for modern jQuery event delegation.
    $("#componentPalette, #designArea").on("mousedown", ".draggable-item", function(dragInitiateEvent) {
      ElementPopupHandler.hideAll(); // Ensure all popups are closed when drag starts.
      dragInitiateEvent.preventDefault(); // Prevent default browser drag behavior.

      let initialCursorX = dragInitiateEvent.pageX;
      let initialCursorY = dragInitiateEvent.pageY;
      let $activeDragPreview; // Renamed $temp to $activeDragPreview
      let dragStartDelayTimer; // Renamed timeout to dragStartDelayTimer
      const $originalDraggable = $(this); // Renamed $this to $originalDraggable

      // Configuration for drag initiation delays based on element origin.
      const dragDelayConfig = { // Renamed delays to dragDelayConfig
        palette: 75, // Slightly adjusted delay for palette items
        designer: 175 // Slightly adjusted delay for items already in the designer
      };

      // Determine the source category of the draggable item.
      let elementSourceCategory; // Renamed type to elementSourceCategory
      // Rewritten parent check using .closest() for better performance and readability.
      if ($originalDraggable.closest("#componentPalette").length > 0) {
        elementSourceCategory = "palette";
      } else {
        elementSourceCategory = "designer";
      }

      let componentToManipulate; // This will hold the actual jQuery object being moved/cloned.
      let storedOriginalParent; // To keep track of the original parent if an element is detached.

      // Set a delayed timer for the drag operation to visually begin.
      dragStartDelayTimer = setTimeout(function() {
        // Guard clause: if the original draggable element somehow became invalid, abort.
        if (!($originalDraggable && $originalDraggable.length)) {
          return;
        }

        if (elementSourceCategory === "palette") {
          // Clone the element if it's from the component palette.
          componentToManipulate = $originalDraggable.clone();
        } else { // From the designer area
          // Only allow dragging if it's not the special 'formLegendItem'.
          if ($originalDraggable.attr("id") !== "formLegendItem") { // Renamed 'legend'
            storedOriginalParent = $originalDraggable.parent(); // Store parent for potential return.
            componentToManipulate = $originalDraggable.detach(); // Detach the original element to move it.
          } else {
            // If it's the legend, prevent dragging and clear the timer.
            clearTimeout(dragStartDelayTimer);
            return;
          }
        }

        // Another guard clause: ensure we have a valid component to work with.
        if (!componentToManipulate || componentToManipulate.length === 0) {
          clearTimeout(dragStartDelayTimer);
          return;
        }

        // Create a visual preview of the component (always a clone for the preview itself).
        $activeDragPreview = $("<div class='drag-preview-container' id='liveDragPreview'>").append(componentToManipulate.clone());
        $(document.body).append($activeDragPreview);

        // Calculate dimensions for accurate positioning.
        const previewHalfDimensionY = $activeDragPreview.outerHeight() / 2; // Renamed half_box_height
        const previewHalfDimensionX = $activeDragPreview.outerWidth() / 2; // Renamed half_box_width

        // Position and style the drag preview.
        $activeDragPreview.css({
          "position": "absolute",
          "top": initialCursorY - previewHalfDimensionY + "px",
          "left": initialCursorX - previewHalfDimensionX + "px",
          "opacity": "0.8", // Slightly different opacity value
          "z-index": "10000" // Ensure the preview is always on top.
        }).show();

        const $targetDropZone = $("#designArea"); // Renamed $target to $targetDropZone
        const dropZoneBoundaries = $targetDropZone.position(); // Renamed tar_pos to dropZoneBoundaries
        const $existingDesignElements = $("#designArea .form-element"); // Renamed $target_component

        let potentialInsertionPoints = []; // Renamed tops to potentialInsertionPoints

        // Event handler for mouse movement during an active drag.
        $(document).on("mousemove.activeDrag", function(dragMoveEvent) { // Using namespaced event
          const currentMoveCursorX = dragMoveEvent.pageX; // Renamed mm_mouseX
          const currentMoveCursorY = dragMoveEvent.pageY; // Renamed mm_mouseY

          // Update the position of the drag preview.
          $activeDragPreview.css({
            "top": currentMoveCursorY - previewHalfDimensionY + "px",
            "left": currentMoveCursorX - previewHalfDimensionX + "px"
          });

          // Check if the drag preview is currently overlapping the drop zone.
          const isCursorOverDropZone = (
            currentMoveCursorX > dropZoneBoundaries.left &&
            currentMoveCursorX < dropZoneBoundaries.left + $targetDropZone.width() + previewHalfDimensionX &&
            currentMoveCursorY > dropZoneBoundaries.top &&
            currentMoveCursorY < dropZoneBoundaries.top + $targetDropZone.height() + previewHalfDimensionY
          );

          if (isCursorOverDropZone) {
            $targetDropZone.css("background-color", "#edf8ff"); // New highlight color for drop zone.
            $existingDesignElements.css({ "border-top": "none", "border-bottom": "none" }); // Reset all component borders.

            // Find elements that could serve as insertion points (above the current cursor position).
            potentialInsertionPoints = $.grep($existingDesignElements, function(element) {
              const $elem = $(element);
              // Consider elements that are visually below the cursor and not the legend.
              return ($elem.position().top - currentMoveCursorY + previewHalfDimensionY > 0 && $elem.attr("id") !== "formLegendItem");
            });

            if (potentialInsertionPoints.length > 0) {
              // Highlight the border of the first potential insertion point.
              $(potentialInsertionPoints[0]).css("border-top", "2px solid #0056b3"); // New border color.
            } else if ($existingDesignElements.length > 0) {
              // If no elements are above, highlight the bottom border of the last element.
              $($existingDesignElements[$existingDesignElements.length - 1]).css("border-bottom", "2px solid #0056b3");
            }
          } else {
            // Reset drop zone and component styles if outside the zone.
            $targetDropZone.css("background-color", "#ffffff");
            $existingDesignElements.css({ "border-top": "none", "border-bottom": "none" });
          }
        });

        // Event handler for mouse up (end of drag operation).
        $(document).on("mouseup.activeDrag", function(dragEndEvent) { // Using namespaced event
          dragEndEvent.preventDefault();

          const finalCursorX = dragEndEvent.pageX; // Renamed mu_mouseX
          const finalCursorY = dragEndEvent.pageY; // Renamed mu_mouseY
          const currentDropZonePosition = $targetDropZone.position();

          // Check if the component was dropped within the valid drop zone boundaries.
          const isSuccessfullyDropped = (
            finalCursorX + previewHalfDimensionX > currentDropZonePosition.left &&
            finalCursorX - previewHalfDimensionX < currentDropZonePosition.left + $targetDropZone.width() &&
            finalCursorY + previewHalfDimensionY > currentDropZonePosition.top &&
            finalCursorY - previewHalfDimensionY < currentDropZonePosition.top + $targetDropZone.height()
          );

          // Reset borders of all components in the design area.
          $existingDesignElements.css({ "border-top": "none", "border-bottom": "none" });

          if (isSuccessfullyDropped) {
            componentToManipulate.removeAttr("style"); // Remove temporary inline styles.
            // Determine where to insert the component.
            if (potentialInsertionPoints.length > 0) {
              componentToManipulate.insertBefore(potentialInsertionPoints[0]);
            } else {
              $targetDropZone.find("fieldset").append(componentToManipulate);
            }
            ElementPopupHandler.activateFor(componentToManipulate); // Activate popover for the newly placed element.
          } else {
            // If drop was unsuccessful, and the element was moved from designer, return it to its original position.
            // This is a new fragment, enhancing the drag-and-drop behavior.
            if (elementSourceCategory === "designer" && componentToManipulate && storedOriginalParent && storedOriginalParent.length) {
              componentToManipulate.appendTo(storedOriginalParent);
            }
            potentialInsertionPoints = []; // Clear insertion points.
          }

          // Clean up after the drag operation.
          $targetDropZone.css("background-color", "#ffffff"); // Reset drop zone background.
          $(document).off("mousemove.activeDrag"); // Unbind the mousemove handler.
          $(document).off("mouseup.activeDrag"); // Unbind this mouseup handler.
          $activeDragPreview.remove(); // Remove the temporary drag preview.

          updateSourceCodePreview(); // Update the generated source code.
        });
      }, dragDelayConfig[elementSourceCategory]);

      // Global mouseup handler to cancel the delayed drag if the mouse button is released too soon.
      $(document).on("mouseup.dragCancellation", function() {
        clearTimeout(dragStartDelayTimer); // Correctly use clearTimeout for setTimeout.
        $(document).off("mouseup.dragCancellation"); // Unbind self.
        $originalDraggable.off("mouseleave.dragCancellation"); // Unbind related mouseleave.
      });

      // Mouseleave handler on the initial element to cancel the delayed drag if cursor leaves it.
      $originalDraggable.on("mouseleave.dragCancellation", function() {
        clearTimeout(dragStartDelayTimer);
        $(document).off("mouseup.dragCancellation"); // Unbind related mouseup.
        $originalDraggable.off("mouseleave.dragCancellation"); // Unbind self.
      });
    });

    // Event handler for clicking on form elements within the design area to open their property popover.
    $("#designArea").on("click", ".form-element", function(componentClickEvent) {
      componentClickEvent.preventDefault();
      ElementPopupHandler.hideAll(); // Hide any other open popups.

      const $selectedComponent = $(this); // Renamed $active_component
      ElementPopupHandler.activateFor($selectedComponent); // Ensure popover is activated for this component.
      $selectedComponent.popover("show");

      // Clear any previous values in the popover input fields.
      $(".form-element-properties-popup input, .form-element-properties-popup textarea").val('');

      // Iterate through data-property-type attributes to populate popover inputs.
      $selectedComponent.find("[data-property-type]").each(function() { // Renamed valtype to property-editor-target
        const $currentPropertyTarget = $(this);
        const propertyKeyIdentifier = $currentPropertyTarget.attr("data-property-type"); // Renamed valID
        let extractedPropertyValue; // Renamed val

        // Using a switch statement for cleaner handling of different property types (Type III change).
        switch (propertyKeyIdentifier) {
          case "inputPlaceholder": // Renamed #placeholder
            extractedPropertyValue = $currentPropertyTarget.attr("placeholder");
            break;
          case "inputCheckedState": // Renamed #checkbox
            extractedPropertyValue = $currentPropertyTarget.prop("checked"); // Use .prop() for boolean attributes.
            break;
          case "selectOptionsList": // Renamed #option
            extractedPropertyValue = $.map($currentPropertyTarget.find("option"), function(optionElement) {
              return $(optionElement).text();
            }).join("\n");
            break;
          case "multiCheckboxes": // Renamed #checkboxes
          case "multiRadios": // Renamed #radios
          case "inlineCheckboxes": // Renamed #inline-checkboxes
          case "inlineRadios": // Renamed #inline-radios
            extractedPropertyValue = $.map($currentPropertyTarget.find("label"), function(labelElement) {
              return $(labelElement).text().trim();
            }).join("\n");
            break;
          case "actionButton": // Renamed #button
            extractedPropertyValue = $currentPropertyTarget.find("button").text();
            const buttonStyleClass = $currentPropertyTarget.find("button").attr("class").split(" ").filter(cls => cls.match(/btn-.*/))[0];
            $(".form-element-properties-popup #buttonStyle option").prop("selected", false); // Clear all selections first.
            if (buttonStyleClass) {
              $(".form-element-properties-popup #buttonStyle #" + buttonStyleClass).prop("selected", true);
            } else {
              $(".form-element-properties-popup #buttonStyle #btn-default").prop("selected", true);
            }
            break;
          default:
            extractedPropertyValue = $currentPropertyTarget.text();
            break;
        }

        // Populate the corresponding input field in the popover.
        const $popoverInputControl = $(".form-element-properties-popup #" + propertyKeyIdentifier);
        if ($popoverInputControl.is(':checkbox')) {
          $popoverInputControl.prop("checked", extractedPropertyValue);
        } else {
          $popoverInputControl.val(extractedPropertyValue);
        }
      });

      // Delegate click event for the 'Cancel' button within the popover.
      $(".form-element-properties-popup").on("click", ".btn-cancel-edit", function(cancelActionEvent) {
        cancelActionEvent.preventDefault();
        $selectedComponent.popover("hide");
        // Unbind these specific handlers to prevent multiple bindings on subsequent popover opens.
        $(".form-element-properties-popup").off("click", ".btn-cancel-edit .btn-save-changes");
      });

      // Delegate click event for the 'Save' button within the popover.
      $(".form-element-properties-popup").on("click", ".btn-save-changes", function(saveActionEvent) {
        saveActionEvent.preventDefault();

        // Collect all relevant input fields from the popover.
        const allPropertyInputs = $(".form-element-properties-popup input, .form-element-properties-popup textarea");

        // Iterate through popover inputs to apply changes to the component.
        allPropertyInputs.each(function() {
          const $currentPopupInput = $(this);
          const inputPropertyKey = $currentPopupInput.attr("id"); // Renamed vartype
          const $targetComponentProperty = $selectedComponent.find('[data-property-type="' + inputPropertyKey + '"]'); // Renamed value

          // Guard clause: skip if the target element for this property type doesn't exist.
          if (!$targetComponentProperty.length) {
            return;
          }

          switch (inputPropertyKey) {
            case "inputPlaceholder":
              $targetComponentProperty.attr("placeholder", $currentPopupInput.val());
              break;
            case "inputCheckedState":
              $targetComponentProperty.prop("checked", $currentPopupInput.is(":checked")); // Use .prop()
              break;
            case "selectOptionsList":
              const optionsArray = $currentPopupInput.val().split("\n").filter(Boolean); // Filter out empty strings.
              $targetComponentProperty.empty(); // Clear existing options.
              $.each(optionsArray, function(idx, optionText) {
                $targetComponentProperty.append($("<option>").text(optionText));
              });
              break;
            case "multiCheckboxes":
            case "multiRadios":
            case "inlineCheckboxes":
            case "inlineRadios":
              const itemLabels = $currentPopupInput.val().split("\n").filter(Boolean);
              $targetComponentProperty.empty();
              const isInlineLayout = inputPropertyKey.includes("inline");
              const inputHtmlType = inputPropertyKey.includes("checkboxes") ? "checkbox" : "radio";
              const labelClasses = `${inputHtmlType} ${isInlineLayout ? 'inline' : ''}`.trim();

              $.each(itemLabels, function(idx, labelText) {
                const $labelElement = $(`<label class="${labelClasses}">`);
                const $inputElement = $(`<input type="${inputHtmlType}" value="${labelText}">`);
                if (inputHtmlType === "radio" && idx === 0) {
                  $inputElement.prop("checked", true); // Check the first radio button by default.
                }
                $labelElement.append($inputElement, ` ${labelText}`);
                $targetComponentProperty.append($labelElement);
              });
              break;
            case "actionButton":
              const selectedButtonTheme = $(".form-element-properties-popup #buttonStyle option:selected").attr("id");
              $targetComponentProperty.find("button").text($currentPopupInput.val()).attr("class", "btn " + selectedButtonTheme);
              break;
            default:
              $targetComponentProperty.text($currentPopupInput.val());
              break;
          }
        });

        $selectedComponent.popover("hide");
        // Unbind handlers after saving.
        $(".form-element-properties-popup").off("click", ".btn-cancel-edit .btn-save-changes");
        updateSourceCodePreview(); // Update source after changes.
      });
    });

    // Event handler for clicking the 'Source Code' tab in the navigation.
    $("#mainNavigationTabs").on("click", "#sourceCodeViewTab", function(tabSelectionEvent) { // Renamed #navtab, #sourcetab
      tabSelectionEvent.preventDefault();
      updateSourceCodePreview(); // Regenerate and display the source code.
    });

    // Initial generation of source code when the application loads.
    updateSourceCodePreview();
  });

})(jQuery); // Pass jQuery object to protect the '$' alias.