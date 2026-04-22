/*
 * Visual Tone Selector JS v2.0.0
 * Copyright 2023 Acme Corp. and Creative Labs
 * Licensed under the MIT License
 */
;(function (domUtil) {
    "use strict";

    domUtil.fn.tonePaletteSelector = function (userOptions) {

      // Environmental checks and device capabilities

      const touchCapable = 'ontouchstart' in window;
      const compactLayout = (parseInt(domUtil(window).width(), 10) < 767); // Determine if viewport is narrow
      const localDataStoreAvailable = 'localStorage' in window && window.localStorage !== null &&
        typeof JSON === 'object'; // Ensure JSON is present for local storage use
      const legacyBrowserMode = document.all && !window.atob; // Detect older IE versions (pre-IE10)

      // Event definitions for consistent interaction across devices
      const pointerDownAction = touchCapable ? "touchstart.tonePalette" : "mousedown.tonePalette";
      const pointerMoveAction = touchCapable ? "touchmove.tonePalette"  : "mousemove.tonePalette";
      const pointerUpAction   = touchCapable ? "touchend.tonePalette"   : "mouseup.tonePalette";
      const tapOrClickAction  = touchCapable ? "touchend.tonePalette"   : "click.tonePalette";
      const dragActiveAction  = "dragging.tonePalette";
      const dragEndAction     = "endDrag.tonePalette";

      // Component configuration
      const pickerConfiguration = domUtil.extend( {}, {
        displayHueSpectrum          : true,
        enableStoredTones           : true,
        storeTonesPerInstance       : false,
        animatePanelTransitions     : true,
        exposeAdvancedControls      : true,
        offerStandardTones          : true,
        allowHexInput               : true,
        predefinedTones             : {
          alabaster : 'fff',
          crimson   : 'f00',
          tangerine : 'f60',
          canary    : 'ff0',
          forest    : '008000',
          azure     : '00f',
          amethyst  : '800080',
          obsidian  : '000'
        }
      }, userOptions);

      // Ensure at least one color selection method is available
      if (!pickerConfiguration.exposeAdvancedControls && !pickerConfiguration.offerStandardTones) {
        pickerConfiguration.offerStandardTones = true;
      }

      // Determine if tabs are needed for navigation
      const requiresTabbedInterface = (pickerConfiguration.enableStoredTones && pickerConfiguration.exposeAdvancedControls) ||
        (pickerConfiguration.offerStandardTones && pickerConfiguration.enableStoredTones) ||
        (pickerConfiguration.offerStandardTones && pickerConfiguration.exposeAdvancedControls);

      // --- UI Markup Generation ---
      // This function constructs the dynamic HTML for the color picker interface.
      const buildInterfaceElements = function () {
        const $rootContainer = domUtil("<div>").addClass("control-cluster");
        const $actionButton = domUtil("<button type='button'>").addClass("btn tone-selector dropdown-toggle");
        const $currentToneDisplay = domUtil("<span>").addClass("tone-swatch active-hue-display");
        const $caretIcon = domUtil("<span>").addClass("caret");
        const $panelWrapper = domUtil("<div>").addClass("palette-panel dropdown-menu");

        // Adjust button and panel styling if hex input is not allowed
        if (!pickerConfiguration.allowHexInput) {
          $actionButton.addClass("no-hex-input");
          $panelWrapper.addClass("no-hex-input");
        }
        $rootContainer.append($actionButton.append($currentToneDisplay).append($caretIcon));

        // Apply a compact class if no tabs and no spectrum are shown
        if (!requiresTabbedInterface && !pickerConfiguration.displayHueSpectrum) {
          $panelWrapper.addClass("compact-panel");
        }

        // --- Tab Navigation Setup ---
        if (requiresTabbedInterface) {
          const $tabNavigation = domUtil("<div>").addClass("palette-panel-tabs");
          let firstTabSet = false;

          if (pickerConfiguration.offerStandardTones) {
            $tabNavigation.append(domUtil("<span>").addClass("standard-tones-tab tab tab-active").
              append(domUtil("<a>").text("Standard Tones")));
            firstTabSet = true;
          }
          if (pickerConfiguration.enableStoredTones) {
            $tabNavigation.append(domUtil("<span>").
            addClass("stored-palettes-tab tab" + (firstTabSet ? "" : " tab-active")).
            append(domUtil("<a>").text("Saved Palettes")));
            if (!firstTabSet) firstTabSet = true;
          }
          if (pickerConfiguration.exposeAdvancedControls) {
            $tabNavigation.append(domUtil("<span>").addClass("fine-tune-tab tab" + (firstTabSet ? "" : " tab-active")).
            append(domUtil("<a>").text("Fine Tune")));
          }
          $panelWrapper.append($tabNavigation);
        }

        // --- Standard Tones Content ---
        if (pickerConfiguration.offerStandardTones) {
          const $standardTonesContent = domUtil("<div>").addClass("standard-tones-content active-content");
          if (pickerConfiguration.displayHueSpectrum) {
            $standardTonesContent.append(domUtil("<h6>").addClass("panel-guidance-text").
              text("Tap spectrum or drag band to adjust tone"));
          }
          const $toneList = domUtil("<ul>").addClass("standard-tone-list");
          domUtil.each(pickerConfiguration.predefinedTones, function (toneName, hexValue) {
            const $toneEntry = domUtil("<li>").addClass("tone-entry");
            const $toneLink = domUtil("<a>").addClass(toneName + " tone-link");
            const $toneSwatch = domUtil("<span>").addClass("tone-swatch " + toneName);
            const $toneLabel = domUtil("<span>").addClass("tone-label").text(toneName);

            $toneLink.append($toneSwatch, $toneLabel);
            // Ensure hex value starts with '#'
            const cssHexValue = (hexValue[0] !== '#') ? '#'+hexValue : hexValue;
            $toneSwatch.css('background-color', cssHexValue);

            if (pickerConfiguration.displayHueSpectrum) {
              const $spectrumOverlay = domUtil("<span>").addClass("spectrum-overlay-" + toneName);
              if (legacyBrowserMode) { // IE-specific spectrum rendering
                for (let i = 0; i < 2; i++) {
                  // Only add IE-specific gradient spans if color is not pure white or black
                  if (hexValue !== "fff" && hexValue !== "000") {
                    $spectrumOverlay.append(domUtil("<span>").addClass(toneName + "-spectrum-part-" + i + " ie-spectrum-segment"));
                  }
                }
              }
              const $indicatorBand = domUtil("<span>").addClass("indicator-band");
              // Add multiple stripes for a textured look to the indicator
              for (let i = 0; i < 3; i++) {
                $indicatorBand.append(domUtil("<span>").addClass("indicator-stripe"));
              }
              $toneLink.append($spectrumOverlay.append($indicatorBand));
            }
            $toneList.append($toneEntry.append($toneLink));
          });
          $standardTonesContent.append($toneList);
          $panelWrapper.append($standardTonesContent);
        }

        // --- Saved Palettes Content ---
        if (pickerConfiguration.enableStoredTones) {
          const storedContentActiveClass = pickerConfiguration.offerStandardTones ? 'inactive-content' : 'active-content';
          const $storedPalettesContent = domUtil("<div>").addClass("stored-palettes-content").addClass(storedContentActiveClass);
          $storedPalettesContent.append(domUtil("<p>").addClass("palette-save-guidance").
            text("Enter a color value or use the spectrums to modify an existing one."));
          $panelWrapper.append($storedPalettesContent);
        }

        // --- Advanced Controls Content ---
        if (pickerConfiguration.exposeAdvancedControls) {
          const advancedContentActiveClass = (pickerConfiguration.offerStandardTones || pickerConfiguration.enableStoredTones) ? 'inactive-content' : 'active-content';
          const $fineTuneContent = domUtil("<div>").addClass("fine-tune-content").addClass(advancedContentActiveClass).
                append(domUtil("<h6>").addClass("fine-tune-guidance").text("Tap spectrum or drag indicator to adjust value"));
          const $fineTuneSettings = domUtil("<ul>").addClass("fine-tune-settings");

          // Hue Control
          const $hueControlEntry = domUtil("<li>").addClass("hue-control-entry");
          const $hueLabelContainer = domUtil("<span>").addClass("hue-label").
            text("Hue: ").append(domUtil("<span>").addClass("hue-display-val").text("0"));
          const $hueSpectrumBar = domUtil("<span>").addClass("spectrum-overlay-hue");
          if (legacyBrowserMode) {
            for (let i = 0; i < 7; i++) {
              $hueSpectrumBar.append(domUtil("<span>").addClass("hue-spectrum-part-" + i + " ie-spectrum-segment hue"));
            }
          }
          const $hueIndicatorBand = domUtil("<span>").addClass("indicator-band");
          for (let i = 0; i < 3; i++) {
            $hueIndicatorBand.append(domUtil("<span>").addClass("indicator-stripe"));
          }
          $fineTuneSettings.append($hueControlEntry.append($hueLabelContainer).append($hueSpectrumBar.append($hueIndicatorBand)));

          // Luminosity Control
          const $luminosityControlEntry = domUtil("<li>").addClass("luminosity-control-entry");
          const $luminositySpectrumBar = domUtil("<span>").addClass("spectrum-overlay-luminosity");
          const $luminosityLabelContainer = domUtil("<span>").addClass("luminosity-label").
            text("Luminosity: ").append(domUtil("<span>").addClass("luminosity-display-val").text("50%"));
          if (legacyBrowserMode) {
            for (let i = 0; i < 2; i++) {
              $luminositySpectrumBar.append(domUtil("<span>").addClass("luminosity-spectrum-part-" + i + " ie-spectrum-segment"));
            }
          }
          const $luminosityIndicatorBand = domUtil("<span>").addClass("indicator-band");
          for (let i = 0; i < 3; i++) {
            $luminosityIndicatorBand.append(domUtil("<span>").addClass("indicator-stripe"));
          }
          $fineTuneSettings.append($luminosityControlEntry.
            append($luminosityLabelContainer).append($luminositySpectrumBar.append($luminosityIndicatorBand)));

          // Saturation Control
          const $saturationControlEntry = domUtil("<li>").addClass("saturation-control-entry");
          const $saturationSpectrumBar = domUtil("<span>").addClass("spectrum-overlay-saturation");
          if (legacyBrowserMode) {
            for (let i = 0; i < 2; i++) {
              $saturationSpectrumBar.append(domUtil("<span>").addClass("saturation-spectrum-part-" + i + " ie-spectrum-segment"));
            }
          }
          const $saturationIndicatorBand = domUtil("<span>").addClass("indicator-band");
          for (let i = 0; i < 3; i++) {
            $saturationIndicatorBand.append(domUtil("<span>").addClass("indicator-stripe"));
          }
          const $saturationLabelContainer = domUtil("<span>").addClass("saturation-label").
            text("Saturation: ").append(domUtil("<span>").addClass("saturation-display-val").text("100%"));
          $fineTuneSettings.append($saturationControlEntry.append($saturationLabelContainer).append($saturationSpectrumBar.
            append($saturationIndicatorBand)));

          // Preview and Select Button
          const $finalPreviewEntry = domUtil("<li>").addClass("final-preview-entry").append(domUtil("<span>").
              addClass("preview-label").text("Preview"));
          const $advancedToneSwatch = domUtil("<span>").addClass("tone-swatch-advanced").
              append("<button class='select-tone-btn btn btn-mini advanced' type='button'>Choose Tone</button>");
          $fineTuneSettings.append($finalPreviewEntry.append($advancedToneSwatch));

          $fineTuneContent.append($fineTuneSettings);
          $panelWrapper.append($fineTuneContent);
        }
        $rootContainer.append($panelWrapper);
        return $rootContainer;
      };

      // --- Internal State Variables ---
      const instanceColorState = {
          currentInputHex: "", // The hex value currently in the input field
          defaultHexValue: ""  // The initial hex value when the component was created
      };

      const componentLayoutData = {
          panelRows     : 8,
          maxPanelCols  : 2
      };

      // --- Saved Colors Persistence ---
      let globalStoredTones = []; // Array to hold all saved colors across instances
      if (pickerConfiguration.enableStoredTones) {
        if (localDataStoreAvailable && localStorage.persistedTones) {
          try {
            globalStoredTones = JSON.parse(localStorage.persistedTones);
          } catch (e) {
            console.error("Error parsing persisted tones from localStorage:", e);
            globalStoredTones = []; // Reset if corrupted
          }
        } else { // Fallback to cookie if localStorage not available or empty
          const browserStoredCookies = document.cookie;
          const cookieMatch = browserStoredCookies.match(/(?:^|;)\s*tonePaletteSavedTones-globalStoredTones=([^;]*)/);
          if (cookieMatch && cookieMatch[1]) {
            globalStoredTones = cookieMatch[1].split(",");
          }
        }
      }

      // --- Core Control Functions ---
      const controlFunctions = {

        /**
         * Initializes a single color picker instance.
         * @param {number} instanceIndex - The index of the current instance in the collection.
         */
        setupComponent: function (instanceIndex) {
          const $currentElement = domUtil(this);
          let elementParentContainer;
          let elementIdentifier;

          // Assign a unique name if not present, then use it as the identifier
          if (!$currentElement.attr("name")) {
            $currentElement.attr("name", "tone-palette-input-" + instanceIndex);
          }
          elementIdentifier = $currentElement.attr("name");

          // Enforce a specific ID and class for styling compatibility
          $currentElement.attr("id", "attachedInputControl");
          $currentElement.addClass("tone-palette-input");

          // Convert the input's current value to a valid hex and store it
          const initialColor = $currentElement.val();
          if (!initialColor) {
              $currentElement.val('000000'); // Default to black if no value
          }
          instanceColorState.defaultHexValue = tinycolor(initialColor).toHex();
          instanceColorState.currentInputHex = instanceColorState.defaultHexValue;
          $currentElement.val(instanceColorState.currentInputHex); // Update input with normalized hex

          // Wrap the input and append the generated UI markup
          $currentElement.wrap('<div class="input-group-prepend input-group-append tone-palette-markup" id="' + elementIdentifier + '">');
          elementParentContainer = $currentElement.parent();

          if (pickerConfiguration.allowHexInput) {
            elementParentContainer.prepend('<span class="hex-symbol">#</span>');
          }
          elementParentContainer.append(buildInterfaceElements());

          // Hide the input field if hex input is not desired
          if (!pickerConfiguration.allowHexInput) {
            $currentElement.attr("type", "hidden");
          }
        },

        /**
         * Updates the visual display of the currently selected color.
         * @param {jQuery} $inputElement - The input field associated with the picker.
         */
        syncVisualDisplay: function ($inputElement) {
          const rawValue = $inputElement.val();
          if (!rawValue) return; // Guard against empty input

          instanceColorState.currentInputHex = tinycolor(rawValue).toHex();
          $inputElement.siblings(".control-cluster").find(".active-hue-display").css("background-color",
            "#" + instanceColorState.currentInputHex);
        },

        /**
         * Handles the click event on the preview button to toggle the panel.
         * Expects an arguments array like [{eventObject}] when called with apply.
         */
        handleActionButtonPress: function () {
          const triggeringEvent = arguments[0].eventObject;
          if (triggeringEvent) {
              triggeringEvent.stopPropagation();
              controlFunctions.togglePanelVisibility(triggeringEvent.target);
          }
        },

        /**
         * Reveals the color selection panel.
         * @param {HTMLElement} buttonElement - The button that triggers the panel.
         * @param {HTMLElement} panelElement - The panel to be revealed.
         */
        revealControlPanel: function (buttonElement, panelElement) {
          domUtil(".palette-panel").each(function () {
            const $otherPanel = domUtil(this);
            if ($otherPanel.css("display") === "block") {
              const $otherButton = $otherPanel.parents(".control-cluster");
              controlFunctions.concealControlPanel($otherButton, $otherPanel); // Close other open panels
            }
          });

          if (pickerConfiguration.animatePanelTransitions && !touchCapable) {
            domUtil(panelElement).fadeIn("fast");
          } else {
            domUtil(panelElement).show();
          }
          domUtil(buttonElement).addClass("is-open");
        },

        /**
         * Conceals the color selection panel.
         * @param {HTMLElement} buttonElement - The button associated with the panel.
         * @param {HTMLElement} panelElement - The panel to be concealed.
         */
        concealControlPanel: function (buttonElement, panelElement) {
          if (pickerConfiguration.animatePanelTransitions && !touchCapable) {
            domUtil(panelElement).fadeOut("fast");
          } else {
            domUtil(panelElement).css("display", "none");
          }
          domUtil(buttonElement).removeClass("is-open");
        },

        /**
         * Closes a panel if it is currently open.
         * Expects an arguments array like [{button: jQElement, panel: jQElement}].
         */
        hidePanelIfActive: function () {
          const { button: $button, panel: $panel } = arguments[0];
          if ($panel && $panel.css("display") === "block") {
            controlFunctions.concealControlPanel($button, $panel);
          }
        },

        /**
         * Toggles the visibility of the color selection panel.
         * @param {HTMLElement} targetElement - The element that initiated the toggle action.
         */
        togglePanelVisibility: function (targetElement) {
          const $container = domUtil(targetElement).parents(".tone-palette-markup");
          const $buttonGroup = $container.find(".control-cluster");
          const $panelMenu = $container.find(".palette-panel");

          if ($panelMenu.css("display") === "none") {
            controlFunctions.revealControlPanel($buttonGroup, $panelMenu);
          } else {
            controlFunctions.concealControlPanel($buttonGroup, $panelMenu);
          }
        },

        /**
         * Makes tab elements interactive, switching content visibility on click.
         */
        makeTabInteractive: function () {
          const $tabElement = domUtil(this);
          const $parentPickerContainer = $tabElement.parents(".tone-palette-markup");

          $tabElement.on(tapOrClickAction, function () {
            const $clickedTab = domUtil(this);
            // Derive content class from tab class (e.g., "standard-tones-tab" -> "standard-tones-content")
            const contentClassPrefix = $clickedTab.attr("class").split(" ")[0].split("-")[0];
            const targetContentClass = contentClassPrefix + "-content";
            const $correspondingContent = $clickedTab.parents(".dropdown-menu").find("." + targetContentClass);

            if (!$clickedTab.hasClass("tab-active")) {
              // Deactivate currently active tab and content
              $parentPickerContainer.find(".tab-active").removeClass("tab-active");
              $parentPickerContainer.find(".active-content").
                removeClass("active-content").addClass("inactive-content");

              // Activate clicked tab and its content
              $clickedTab.addClass("tab-active");
              $correspondingContent.addClass("active-content").removeClass("inactive-content");
            }
          });
        },

        /**
         * Calculates a multiplier based on band position within a spectrum.
         * @param {string} spectrumType - "bidirectional", "darkenRight", or "lightenRight".
         * @param {number} currentPosition - The current X position of the indicator band.
         * @param {string} tabContext - "basic" or "advanced" to determine spectrum width.
         * @returns {number} The calculated color multiplier.
         */
        calculateToneModifier: function (spectrumType, currentPosition, tabContext) {
          let spectrumDisplayWidth = 0;
          // Determine the width of the relevant spectrum element
          if (tabContext === "basic") {
              const $basicSpectrum = domUtil(".spectrum-overlay-white").first(); // Use a common basic spectrum for width reference
              spectrumDisplayWidth = parseInt($basicSpectrum.width(), 10);
          } else { // Advanced tab
              const $advancedSpectrum = domUtil(".fine-tune-settings").find(".spectrum-overlay-hue").first(); // Use hue spectrum
              spectrumDisplayWidth = parseInt($advancedSpectrum.width(), 10);
          }

          // Fallback width if detection fails (e.g., element not yet rendered or hidden)
          if (spectrumDisplayWidth <= 0) {
            spectrumDisplayWidth = touchCapable ? 160 : (tabContext === "basic" ? 200 : 300);
          }

          const halfWidth = spectrumDisplayWidth / 2;
          const percentageOfBox = currentPosition / spectrumDisplayWidth;

          if (spectrumType === "bidirectional") {
            // For bidirectional spectrums (lighten/darken from center)
            return (percentageOfBox <= 0.5) ?
              (1 - (currentPosition / halfWidth)) / 2 : // Darken left half
              -((currentPosition - halfWidth) / halfWidth) / 2; // Lighten right half
          } else {
            // For unidirectional spectrums (darken or lighten across entire range)
            return (spectrumType === "darkenRight") ? -(percentageOfBox / 2) : (percentageOfBox / 2);
          }
        },

        /**
         * Modifies the lightness component of an HSL color object.
         * Mimics LESS's lighten/darken function.
         * @param {object} hslObject - The HSL color object ({h, s, l}).
         * @param {number} modifier - The value to add to the lightness (between -1 and 1).
         * @returns {string} The HSL string representation of the modified color.
         */
        adjustLuminosityHSL: function (hslObject, modifier) {
          if (!hslObject || typeof hslObject.l === 'undefined') {
              console.warn("Invalid HSL object provided to adjustLuminosityHSL.");
              return "hsl(0,0%,50%)"; // Return a default gray
          }
          const modifiedHsl = { ...hslObject }; // Create a copy to avoid mutation
          modifiedHsl.l += modifier;
          modifiedHsl.l = Math.min(Math.max(0, modifiedHsl.l), 1); // Clamp lightness between 0 and 1
          return tinycolor(modifiedHsl).toHslString();
        },

        /**
         * Determines the permissible movement boundaries for a draggable element.
         * @param {jQuery} $draggableElement - The element to be dragged.
         * @returns {object} An object containing minX and maxX coordinates.
         */
        determineMovementBounds: function ($draggableElement) {
          const bounds = {};
          const $parentContainer = $draggableElement.parent();
          const elementWidth = $draggableElement.outerWidth();
          const parentInnerWidth = $parentContainer.width(); // Excludes padding/border

          const parentOffset = $parentContainer.offset();
          bounds.minX = parentOffset.left;
          bounds.maxX = parentInnerWidth - elementWidth; // Prevent element from overflowing parent
          return bounds;
        },

        /**
         * Relocates the indicator band based on mouse/touch input.
         * @param {jQuery} $indicatorBand - The band element to move.
         * @param {object} movementBounds - Object with minX and maxX for movement.
         * @param {Event} interactionEvent - The mouse or touch event object.
         */
        relocateIndicatorBand: function ($indicatorBand, movementBounds, interactionEvent) {
          const bandWidth = $indicatorBand.outerWidth();
          const bandHalfWidth = bandWidth * 0.5; // Use half width for centering logic
          const pointerX = touchCapable ? interactionEvent.originalEvent.pageX : interactionEvent.pageX;

          // Calculate new position relative to the parent container's left edge
          let calculatedPosition = pointerX - movementBounds.minX - bandHalfWidth;

          // Clamp the position within the allowed bounds
          calculatedPosition = Math.max(0, (Math.min(calculatedPosition, movementBounds.maxX)));

          $indicatorBand.css({
            "position": "absolute",
            "left": calculatedPosition + "px"
          });
        },

        /**
         * Enables horizontal dragging for an element.
         * 'this' refers to the jQuery element being made draggable.
         */
        enableHorizontalDrag: function () {
          const $draggableElement = domUtil(this);

          $draggableElement.on(pointerDownAction, function (event) {
            event.preventDefault(); // Prevent default browser drag behavior
            const $currentDraggable = domUtil(event.delegateTarget); // Ensure we're working with the correct element

            // Change cursor feedback
            $currentDraggable.css({
                "cursor": "-webkit-grabbing",
                "cursor": "-moz-grabbing"
            });

            const movementBounds = controlFunctions.determineMovementBounds($currentDraggable);

            // Bind move and up events to the document for robust dragging
            domUtil(document).on(pointerMoveAction, function (moveEvt) {
              $currentDraggable.trigger(dragActiveAction);
              controlFunctions.relocateIndicatorBand($currentDraggable, movementBounds, moveEvt);
            }).on(pointerUpAction, function () {
              // Unbind document events
              domUtil(document).off(pointerMoveAction);
              domUtil(document).off(dragActiveAction);
              $currentDraggable.css({
                  "cursor": "-webkit-grab",
                  "cursor": "-moz-grab"
              });
              $currentDraggable.trigger(dragEndAction);
              domUtil(document).off(pointerUpAction);
            });
          });
          // Also handle pointerUpAction directly on the element for mobile consistency
          $draggableElement.on(pointerUpAction, function (event) {
            event.stopPropagation();
            domUtil(document).off(pointerMoveAction);
            domUtil(document).off(dragActiveAction);
          });
        },

        /**
         * Updates the visual style of the indicator band based on the color multiplier.
         * @param {jQuery} $indicatorBand - The indicator band element.
         * @param {number} colorMultiplier - The calculated multiplier for color adjustment.
         * @param {string} spectrumType - The type of spectrum ("lightenRight" etc.).
         */
        updateIndicatorBandStyle: function ($indicatorBand, colorMultiplier, spectrumType) {
          const darkGrayHSL = { h: 0, s:0, l: 0.05 }; // Very dark gray
          const midGrayHSL = { h: 0, s:0, l: 0.5 }; // Mid gray

          // Band color changes opposite to spectrum color. Multiplier is inverted.
          const bandColorModifier = -colorMultiplier;
          // Apply a larger modifier for black/white bands to ensure clear contrast
          const aggressiveBandModifier = bandColorModifier * 10;

          const newBandColor = (spectrumType === "lightenRight") ?
            controlFunctions.adjustLuminosityHSL(midGrayHSL, aggressiveBandModifier) :
            controlFunctions.adjustLuminosityHSL(darkGrayHSL, aggressiveBandModifier);

          $indicatorBand.css("border-color", newBandColor);
          $indicatorBand.find(".indicator-stripe").css("background-color", newBandColor);
        },

        /**
         * Calculates the color under the indicator band for both basic and advanced spectrums.
         * Expects an arguments array like [{type: "basic"}] or [{type: "advanced", hsl: {h,s,l}}].
         * 'this' refers to the jQuery indicator band element.
         * @returns {string} The hexadecimal representation of the highlighted color.
         */
        deriveSelectedTone: function () {
          const $currentIndicatorBand = domUtil(this);
          const bandWidth = $currentIndicatorBand.outerWidth();
          const bandHalfWidth = bandWidth / 2;
          const contextType = arguments[0].type;

          let colorHSL, spectrumBehavior, parentContainer;

          if (contextType === "basic") {
            parentContainer = $currentIndicatorBand.parent();
            const rawClassName = parentContainer.attr("class");
            const baseColorName = rawClassName ? rawClassName.split("-")[2] : 'alabaster'; // Default if class is missing
            const baseHexValue = pickerConfiguration.predefinedTones[baseColorName];

            colorHSL = tinycolor(baseHexValue).toHsl();

            // Determine spectrum behavior based on the base color
            switch(baseHexValue) {
              case "fff":
                spectrumBehavior = "darkenRight";
                break;
              case "000":
                spectrumBehavior = "lightenRight";
                break;
              default:
                spectrumBehavior = "bidirectional";
            }
          } else { // Advanced tab context
            const { h, s } = arguments[0].hsl;
            // For advanced controls, the lightness is adjusted from a baseline of 0.5 (mid-lightness)
            colorHSL = { h: h, l: 0.5, s: s };
            spectrumBehavior = "bidirectional"; // Advanced controls typically use bidirectional adjustment

            // Retrieve related elements for advanced controls
            parentContainer = $currentIndicatorBand.parents(".fine-tune-settings");
            // const $advancedPreview = parentContainer.find(".tone-swatch-advanced"); // Not directly used in calculation here
            // const $hueSpectrum = parentContainer.find(".spectrum-overlay-hue"); // Not directly used in calculation here
            // const $saturationSpectrum = parentContainer.find(".spectrum-overlay-saturation"); // Not directly used in calculation here
            // const $luminosityDisplay = parentContainer.find(".luminosity-display-val"); // Not directly used in calculation here
          }

          // Calculate the midpoint of the indicator band's current position
          const indicatorBandMidpoint = parseInt($currentIndicatorBand.css("left"), 10) + bandHalfWidth;
          const toneModifier = controlFunctions.calculateToneModifier(spectrumBehavior, indicatorBandMidpoint, contextType);
          const derivedColorHSL = controlFunctions.adjustLuminosityHSL(colorHSL, toneModifier);
          const derivedColorHex = "#" + tinycolor(derivedColorHSL).toHex();

          // Return the calculated hex value
          return derivedColorHex;
        }

        // --- End of controlFunctions ---
      };

      // --- Plugin Initialization Loop ---
      // Iterate over each selected element and apply the color picker.
      return this.each(function (index) {
        const $currentInput = domUtil(this);
        controlFunctions.setupComponent.apply($currentInput, [index]);

        // Initial preview update
        controlFunctions.syncVisualDisplay($currentInput);

        // Bind events
        const $pickerMarkup = $currentInput.parent();
        const $colorPanel = $pickerMarkup.find(".palette-panel");
        const $dropdownButton = $pickerMarkup.find(".tone-selector");

        // Toggle panel when button is clicked
        $dropdownButton.on(tapOrClickAction, function (e) {
          e.preventDefault(); // Prevent default button behavior
          controlFunctions.handleActionButtonPress.apply(this, [{eventObject: e}]);
        });

        // Close panel when clicking outside
        domUtil(document).on(tapOrClickAction, function (e) {
          // Check if the click occurred outside the entire picker component
          if (!domUtil(e.target).closest($pickerMarkup).length) {
            controlFunctions.hidePanelIfActive.apply(null, [{button: $dropdownButton.parent(), panel: $colorPanel}]);
          }
        });

        // Update preview on input change
        $currentInput.on("change.tonePalette keyup.tonePalette", function () {
          controlFunctions.syncVisualDisplay($currentInput);
        });

        // Make tabs interactive
        $pickerMarkup.find(".palette-panel-tabs .tab").each(controlFunctions.makeTabInteractive);

        // Enable dragging for indicator bands
        $pickerMarkup.find(".indicator-band").each(controlFunctions.enableHorizontalDrag);

        // Handle color selection from basic tones
        $pickerMarkup.find(".standard-tone-list .tone-link").on(tapOrClickAction, function (e) {
            e.preventDefault();
            const $link = domUtil(this);
            const hexVal = tinycolor($link.find(".tone-swatch").css("background-color")).toHex();
            $currentInput.val(hexVal).trigger("change");
            controlFunctions.concealControlPanel($dropdownButton.parent(), $colorPanel);
        });

        // Handle color selection from advanced preview
        $pickerMarkup.find(".tone-swatch-advanced .select-tone-btn").on(tapOrClickAction, function (e) {
            e.preventDefault();
            const hexVal = tinycolor(domUtil(this).parent().css("background-color")).toHex();
            $currentInput.val(hexVal).trigger("change");
            controlFunctions.concealControlPanel($dropdownButton.parent(), $colorPanel);
        });

        // Handle dragging on spectrums
        $pickerMarkup.find(".spectrum-overlay-white, .spectrum-overlay-black, .spectrum-overlay-hue, .spectrum-overlay-luminosity, .spectrum-overlay-saturation").on(dragActiveAction, function () {
            const $spectrumContainer = domUtil(this);
            const $relatedIndicator = $spectrumContainer.find(".indicator-band");
            const isAdvancedSection = $spectrumContainer.parents(".fine-tune-content").length > 0;

            let selectedColorHex;
            if (isAdvancedSection) {
                // For advanced sections, we need to get the current HSL values from the display
                const $advancedContent = $spectrumContainer.parents(".fine-tune-content");
                const currentHue = parseInt($advancedContent.find(".hue-display-val").text(), 10);
                const currentSaturation = parseFloat($advancedContent.find(".saturation-display-val").text()) / 100;
                const currentLuminosity = parseFloat($advancedContent.find(".luminosity-display-val").text()) / 100;

                selectedColorHex = controlFunctions.deriveSelectedTone.apply($relatedIndicator, [{
                    type: "advanced",
                    hsl: { h: currentHue, s: currentSaturation, l: currentLuminosity }
                }]);
            } else {
                selectedColorHex = controlFunctions.deriveSelectedTone.apply($relatedIndicator, [{ type: "basic" }]);
            }
            $currentInput.val(selectedColorHex).trigger("change");
        });

        // Final update for indicator band styles after drag
        $pickerMarkup.find(".indicator-band").on(dragEndAction, function () {
            const $band = domUtil(this);
            const $spectrumParent = $band.parent();
            const isAdvanced = $spectrumParent.parents(".fine-tune-content").length > 0;
            let spectrumType = "bidirectional"; // Default for most cases

            if (!isAdvanced) {
                const baseColorName = $spectrumParent.attr("class").split("-")[2];
                switch(baseColorName) {
                    case "alabaster": spectrumType = "darkenRight"; break;
                    case "obsidian": spectrumType = "lightenRight"; break;
                    default: spectrumType = "bidirectional";
                }
            }

            const bandPosition = parseInt($band.css("left"), 10) + ($band.outerWidth() / 2);
            const modifier = controlFunctions.calculateToneModifier(spectrumType, bandPosition, isAdvanced ? "advanced" : "basic");
            controlFunctions.updateIndicatorBandStyle($band, modifier, spectrumType);
        });

      }); // End of each instance loop

    }; // End of plugin definition

})(jQuery); // Pass jQuery as domUtil alias