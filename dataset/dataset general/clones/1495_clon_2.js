/*
* Shade Selector JS v1.1.5
* Copyright 2013 Lauren Sperber and Broadstreet Ads
* https://github.com/lauren/pick-a-color/blob/master/LICENSE
*/
;(function (jq) {
"use strict";

jq.fn.selectShade = function (configSettings) {

    // Device capabilities identification
    var canInteractTouch = 'ontouchstart' in window,
        compactDisplay = (parseInt(jq(window).width(), 10) < 767) ? true : false,
        hasLocalDataStore = 'localStorage' in window && window.localStorage !== null &&
                                typeof JSON === 'object', // Avoid LS without JSON (looking at you, IE)
        isOlderInternetExplorer = document.all && !window.atob, // Oh dear!
        currentWebCookies = document.cookie,
        decadeInMilliseconds = 315360000000, // Duration for cookie
        beginInteraction = canInteractTouch ? "touchstart.shadeSelector" : "mousedown.shadeSelector",
        dragOperation = canInteractTouch ? "touchmove.shadeSelector" : "mousemove.shadeSelector",
        finishInteraction = canInteractTouch ? "touchend.shadeSelector" : "mouseup.shadeSelector",
        tapAction = canInteractTouch ? "touchend.shadeSelector" : "click.shadeSelector",
        pullEvent = "dragging.shadeSelector",
        stopPullEvent = "endDrag.shadeSelector";

    // Component configuration
    var configuration = jq.extend( {}, {
        displaySpectrumArea: true,
        displayStoredShades: true,
        storeShadesPerComponent: false,
        animateMenuTransition: true,
        displayComplexOptions: true,
        displayPrimaryShades: true,
        displayHexEntry: true,
        primaryShadeMap: {
            white: 'fff',
            red: 'f00',
            orange: 'f60',
            yellow: 'ff0',
            green: '008000',
            blue: '00f',
            purple: '800080',
            black: '000'
        }
    }, configSettings);

    // Override displayPrimaryShades if both it and displayComplexOptions are false
    if (!configuration.displayComplexOptions && !configuration.displayPrimaryShades) {
        configuration.displayPrimaryShades = true;
    }

    var enableTabbedInterface = (configuration.displayStoredShades && configuration.displayComplexOptions) ||
                                (configuration.displayPrimaryShades && configuration.displayStoredShades) ||
                                (configuration.displayPrimaryShades && configuration.displayComplexOptions);

    // Markup generation
    var generatePostInputElements = function () {
        var $elementContainer = jq("<div>").addClass("btn-group"),
            $pickerButton = jq("<button type='button'>").addClass("btn shade-menu-trigger dropdown-toggle"),
            $shadePreview = jq("<span>").addClass("shade-display active-shade"),
            $buttonCaret = jq("<span>").addClass("caret"),
            $menuPanel = jq("<div>").addClass("shade-menu dropdown-menu");
        if (!configuration.displayHexEntry) {
            $pickerButton.addClass("no-hex");
            $menuPanel.addClass("no-hex");
        }
        $elementContainer.append($pickerButton.append($shadePreview).append($buttonCaret));
        if (!enableTabbedInterface && !configuration.displaySpectrumArea) {
            $menuPanel.addClass("compact");
        }
        if (enableTabbedInterface) {
            var $tabStrip = jq("<div>").addClass("shade-menu-tabs");
            if (configuration.displayPrimaryShades) {
                $tabStrip.append(jq("<span>").addClass("fundamentalShadesTab tab tab-active").
                    append(jq("<a>").text("Basic Hues")));
            }
            if (configuration.displayStoredShades) {
                configuration.displayPrimaryShades ? $tabStrip.append(jq("<span>").
                addClass("storedShadesTab tab").append(jq("<a>").text("Saved Hues"))) :
                $tabStrip.append(jq("<span>").addClass("storedShadesTab tab tab-active").
                append(jq("<a>").text("Saved Hues")));
            }
            if (configuration.displayComplexOptions) {
                $tabStrip.append(jq("<span>").addClass("complexOptionsTab tab").
                append(jq("<a>").text("Advanced")));
            }
            $menuPanel.append($tabStrip);
        }

        if (configuration.displayPrimaryShades) {
            var $primaryShadesSection = jq("<div>").addClass("fundamentalShadesTab-content active-content");
            if (configuration.displaySpectrumArea) {
                $primaryShadesSection.append(jq("<h6>").addClass("shade-selection-guidance").
                    text("Tap spectrum or drag band to change shade"));
            }
            var $shadeItemList = jq("<ul>").addClass("primary-hues-list");
            jq.each(configuration.primaryShadeMap, function (colorKey, colorValue) {
                var $currentItem = jq("<li>").addClass("shade-item"),
                    $itemAnchor = jq("<a>").addClass(colorKey + " shade-link"),
                    $itemShadeDisplay = jq("<span>").addClass("shade-display " + colorKey),
                    $itemLabel = jq("<span>").addClass("shade-label").text(colorKey);

                $itemAnchor.append($itemShadeDisplay, $itemLabel);
                $itemShadeDisplay.append();
                if (colorValue[0] !== '#') {
                    colorValue = '#'+colorValue;
                }
                $itemShadeDisplay.css('background-color', colorValue);

                if (configuration.displaySpectrumArea) {
                    var $itemSpectrumBar = jq("<span>").addClass("shade-box spectrum-bar-" + colorKey);
                    if (isOlderInternetExplorer) {
                        jq.each([0,1], function (i) {
                            if (colorValue !== "fff" && colorKey !== "000")
                            $itemSpectrumBar.append(jq("<span>").addClass(colorKey + "-spectrum-bar-" + i +
                            " ie-spectrum"));
                        });
                    }
                    var $highlightBar = jq("<span>").addClass("highlight-bar");
                    jq.each([0,1,2], function () {
                        $highlightBar.append(jq("<span>").addClass("highlight-bar-stripe"));
                    });
                    $itemAnchor.append($itemSpectrumBar.append($highlightBar));
                }
                $shadeItemList.append($currentItem.append($itemAnchor));
            });
            $menuPanel.append($primaryShadesSection.append($shadeItemList));
        }

        if (configuration.displayStoredShades) {
            var activeStyleClass = configuration.displayPrimaryShades ? 'inactive-content' : 'active-content',
                $storedShadesSection = jq("<div>").addClass("storedShadesTab-content").addClass(activeStyleClass);
            $storedShadesSection.append(jq("<p>").addClass("stored-shades-guidance").
                text("Type in a shade or use the spectrums to lighten or darken an existing shade."));
            $menuPanel.append($storedShadesSection);
        }

        if (configuration.displayComplexOptions) {
            var activeStyleClass = configuration.displayPrimaryShades || configuration.displayStoredShades ? 'inactive-content' : 'active-content';
            var $complexOptionsSection = jq("<div>").addClass("complexOptionsTab-content").addClass(activeStyleClass).
                    append(jq("<h6>").addClass("complex-options-guidance").text("Tap spectrum or drag band to change shade")),
                $complexOptionList = jq("<ul>").addClass("complex-options-list"),
                $hueComponent = jq("<li>").addClass("hue-component"),
                $hueLabel = jq("<span>").addClass("hue-text").
                    text("Hue: ").append(jq("<span>").addClass("hue-value").text("0"));
            var $hueSpectrumBar = jq("<span>").addClass("shade-box spectrum-hue-bar");
            if (isOlderInternetExplorer) {
                jq.each([0,1,2,3,4,5,6], function (i) {
                    $hueSpectrumBar.append(jq("<span>").addClass("hue-spectrum-bar-" + i +
                    " ie-spectrum hue"));
                });
            }
            var $hueHighlightBar = jq("<span>").addClass("highlight-bar");
            jq.each([0,1,2], function () {
                $hueHighlightBar.append(jq("<span>").addClass("highlight-bar-stripe"));
            });
            $complexOptionList.append($hueComponent.append($hueLabel).append($hueSpectrumBar.append($hueHighlightBar)));
            var $lightnessComponent = jq("<li>").addClass("luminance-component"),
                $lightnessSpectrumBar = jq("<span>").addClass("shade-box spectrum-luminance-bar"),
                $lightnessLabel = jq("<span>").addClass("luminance-text").
                text("Lightness: ").append(jq("<span>").addClass("luminance-value").text("50%"));
            if (isOlderInternetExplorer) {
                jq.each([0,1], function (i) {
                    $lightnessSpectrumBar.append(jq("<span>").addClass("luminance-spectrum-bar-" + i +
                    " ie-spectrum"));
                });
            }
            var $lightnessHighlightBar = jq("<span>").addClass("highlight-bar");
            jq.each([0,1,2], function () {
                $lightnessHighlightBar.append(jq("<span>").addClass("highlight-bar-stripe"));
            });
            $complexOptionList.append($lightnessComponent.
                append($lightnessLabel).append($lightnessSpectrumBar.append($lightnessHighlightBar)));
            var $saturationComponent = jq("<li>").addClass("saturation-component"),
                $saturationSpectrumBar = jq("<span>").addClass("shade-box spectrum-saturation-bar");
            if (isOlderInternetExplorer) {
                jq.each([0,1], function (i) {
                    $saturationSpectrumBar.append(jq("<span>").addClass("saturation-spectrum-bar-" + i +
                    " ie-spectrum"));
                });
            }
            var $saturationHighlightBar = jq("<span>").addClass("highlight-bar");
            jq.each([0,1,2], function () {
                $saturationHighlightBar.append(jq("<span>").addClass("highlight-bar-stripe"));
            });
            var $saturationLabel = jq("<span>").addClass("saturation-text").
                text("Saturation: ").append(jq("<span>").addClass("saturation-value").text("100%"));
            $complexOptionList.append($saturationComponent.append($saturationLabel).append($saturationSpectrumBar.
                append($saturationHighlightBar)));
            var $previewComponent = jq("<li>").addClass("preview-component").append(jq("<span>").
                addClass("preview-text").text("Preview")),
                $previewDisplay = jq("<span>").addClass("shade-display complex").
                append("<button class='shade-select-btn btn btn-mini complex' type='button'>Select</button>");
            $complexOptionList.append($previewComponent.append($previewDisplay));
            $menuPanel.append($complexOptionsSection.append($complexOptionList));
        }
        $elementContainer.append($menuPanel);
        return $elementContainer;
    };

    var internalShadeData = {};

    var layoutDimensions = {
        menuRows: 8,
        menuMaxColumns: 2
    };

    if (configuration.displayStoredShades) { // If saving shades...
        var allPersistedShades = []; // Array for all saved shades
        if (hasLocalDataStore && localStorage.allPersistedShades) { // Check LS
            allPersistedShades = JSON.parse(localStorage.allPersistedShades);
        } else if (currentWebCookies.match("shadeSelectorPersistedShades-allPersistedShades=")) { // If cookie exists
            var parsedCookies = currentWebCookies.split(";"); // Split cookies

            jq.each(parsedCookies, function (currIdx) { // Find the savedShades cookie
                if (parsedCookies[currIdx].match("shadeSelectorPersistedShades-allPersistedShades=")) {
                    allPersistedShades = parsedCookies[currIdx].split("=")[1].split(",");
                }
            });
        }
    }


    // Functional routines
    var utilityFunctions = {

        setupComponent: function (componentIndex) {
            var $currentElement = jq(this),
                $elementParent,
                elementIdentifier,
                initialShade;

            // If input has no name, create one and use as ID
            if (!$currentElement.attr("name")) {
                $currentElement.attr("name", "shade-selector-" + componentIndex);
            }
            elementIdentifier = $currentElement.attr("name");

            // Enforce bootstrap ID and class on input
            $currentElement.attr("id", "appendedPrependedPickerButton");
            $currentElement.addClass("shade-selector");

            // Convert initial shade to valid hex
            internalShadeData.initialShade = tinycolor($currentElement.val()).toHex();
            internalShadeData.enteredShade = internalShadeData.initialShade;
            $currentElement.val(internalShadeData.initialShade);

            // Wrap input with unique div, add hex prefix and post-input markup
            jq($currentElement).wrap('<div class="input-prepend input-append shade-selector-elements" id="' + elementIdentifier + '">');
            $elementParent = jq($currentElement.parent());
            configuration.displayHexEntry ? $elementParent.prepend('<span class="hex-prefix">#</span>').append(generatePostInputElements())
                : $elementParent.append(generatePostInputElements());

            // Hide input for noinput option
            if (!configuration.displayHexEntry) {
                $currentElement.attr("inputType", "hidden");
            }
        },

        refreshDisplay: function ($currentElement) {
            internalShadeData.enteredShade = tinycolor($currentElement.val()).toHex();
            $currentElement.siblings(".btn-group").find(".active-shade").css("background-color",
                "#" + internalShadeData.enteredShade);
        },

        // Call with apply and [{eventObject}]
        activatePickerButton: function () {
            var eventObject = arguments[0].eventObject;
            eventObject.stopPropagation();
            utilityFunctions.toggleMenu(eventObject.target);
        },

        showMenu: function (triggerButton, panelMenu) {
            jq(".shade-menu").each(function () { // Check other shade menus
                var $thisElement = jq(this);

                if ($thisElement.css("display") === "block") { // If one is open
                    // Find its shade display button
                    var menuToggleButton = $thisElement.parents(".btn-group");
                    utilityFunctions.hideMenu(menuToggleButton, $thisElement); // Close it
                }
            });

            if (configuration.animateMenuTransition && !canInteractTouch) { // Fades are bad on mobile
                jq(panelMenu).fadeIn("fast");
            } else {
                jq(panelMenu).show();
            }

            jq(triggerButton).addClass("open");
        },

        hideMenu: function (triggerButton, panelMenu) {
            if (configuration.animateMenuTransition && !canInteractTouch) { // Fades are bad on mobile
                jq(panelMenu).fadeOut("fast");
            } else {
                jq(panelMenu).css("display", "none");
            }

            jq(triggerButton).removeClass("open");
        },

        // Call with apply. Requires [{triggerButton, panelMenu}]
        concealMenuIfVisible: function () {
            var triggerButton = arguments[0].triggerButton,
                panelMenu = arguments[0].panelMenu;
            if (panelMenu.css("display") === "block") {
                utilityFunctions.hideMenu(triggerButton, panelMenu);
            }
        },

        toggleMenu: function (targetElement) {
            var $componentWrapper = jq(targetElement).parents(".shade-selector-elements"),
                $toggleButton = $componentWrapper.find(".btn-group"),
                $dropdownPanel = $componentWrapper.find(".shade-menu");
            if ($dropdownPanel.css("display") === "none") {
                utilityFunctions.showMenu($toggleButton, $dropdownPanel);
            } else {
                utilityFunctions.hideMenu($toggleButton, $dropdownPanel);
            }
        },

        makeNavigableByTabs: function () {
            var $currentTab = jq(this),
                $tabContainer = $currentTab.parents(".shade-selector-elements");

            $currentTab.click(function () {
                var $clickedTab = jq(this),
                // Interpret content class from tab class and get content div
                    associatedContentClass = $clickedTab.attr("class").split(" ")[0].split("-")[0] + "-content",
                    targetContent = $clickedTab.parents(".dropdown-menu").find("." + associatedContentClass);

                if (!$clickedTab.hasClass("tab-active")) { // Make all active tabs inactive
                    $tabContainer.find(".tab-active").removeClass("tab-active");
                    // Toggle visibility of active content
                    $tabContainer.find(".active-content").
                        removeClass("active-content").addClass("inactive-content");
                    $clickedTab.addClass("tab-active"); // Make current tab and content active
                    jq(targetContent).addClass("active-content").removeClass("inactive-content");
                }
            });
        },

        // Takes a shade and current position of the shade bar,
        // returns the factor by which the shade should be multiplied
        // to get the shade currently highlighted by the bar
        determineShadeFactor: function (spectrumLayout, currentPosition, activeTabType) {
            // Position of the shade bar as a percentage of the width of the shade box
            var spectrumDimension = (activeTabType === "basic") ? parseInt(jq(".shade-box").first().width(), 10) :
                parseInt(jq(".complex-options-list").find(".shade-box").first().width(), 10);
            if (spectrumDimension === 0) { // If width isn't set correctly
                if (activeTabType === "basic") {
                    spectrumDimension = canInteractTouch ? 160 : 200;
                } else {
                    spectrumDimension = canInteractTouch ? 160 : 300;
                }
            }
            var midSpectrumDimension = spectrumDimension / 2,
                relativePosition = currentPosition / spectrumDimension;

            // For spectrums that lighten and darken, recalculate percent of box relative
            // to the half of spectrum the highlight bar is currently in
            if (spectrumLayout === "twoWay") {
                return (relativePosition <= 0.5) ?
                    (1 - (currentPosition / midSpectrumDimension)) / 2 :
                    -((currentPosition - midSpectrumDimension) / midSpectrumDimension) / 2;
                // Now treating each half as an individual spectrum, both are darkenDirection
            } else {
                return (spectrumLayout === "darkenDirection") ? -(relativePosition / 2) : (relativePosition / 2);
            }
        },

        // adjustHSLLuminance based on lighten/darken in LESS
        // https://github.com/cloudhead/less.js/blob/master/dist/less-1.3.3.js#L1763
        adjustHSLLuminance: function (hslObject, adjustmentFactor) {
            var tempHsl = hslObject;
            tempHsl.l += adjustmentFactor;
            tempHsl.l = Math.min(Math.max(0, tempHsl.l), 1);
            return tinycolor(tempHsl).toHslString();
        },

        // Defines the area within which an element can be moved
        calculateMovementBounds: function ($movableElement) {
            var areaLimits = {},
                $elementParent = $movableElement.parent(),
                elementWidth = $movableElement.outerWidth(),
                containerWidth = $elementParent.width(), // Don't include borders for parent width
                containerOffset = $elementParent.offset();
            areaLimits.minX = containerOffset.left;
            areaLimits.maxX = containerWidth - elementWidth; // Subtract elementWidth to avoid pushing out
            return areaLimits;
        },

        relocateHighlightBar: function ($barToMove, movementBounds, eventInfo) {
            var barWidth = jq(".highlight-bar").first().outerWidth(),
                threeQuartersBarWidth = barWidth * 0.75,
                pointerX = canInteractTouch ? eventInfo.originalEvent.pageX : eventInfo.pageX, // Find the pointer!
                // Pointer position relative to width of highlight-bar
                targetPosition = pointerX - movementBounds.minX - threeQuartersBarWidth;

            // Don't move beyond movementBounds
            targetPosition = Math.max(0, (Math.min(targetPosition, movementBounds.maxX)));
            $barToMove.css("position", "absolute");
            $barToMove.css("left", targetPosition);
        },

        makeHorizontalDraggable: function () {
            jq(this).on(beginInteraction, function (triggerEvent) {
                triggerEvent.preventDefault();
                var $draggableItem = jq(triggerEvent.delegateTarget);
                $draggableItem.css("cursor", "-webkit-grabbing");
                $draggableItem.css("cursor", "-moz-grabbing");
                var movementBounds = utilityFunctions.calculateMovementBounds($draggableItem);

                jq(document).on(dragOperation, function (e) {
                    $draggableItem.trigger(pullEvent);
                    utilityFunctions.relocateHighlightBar($draggableItem, movementBounds, e);
                }).on(finishInteraction, function (event) {
                    jq(document).off(dragOperation); // For desktop
                    jq(document).off(pullEvent);
                    $draggableItem.css("cursor", "-webkit-grab");
                    $draggableItem.css("cursor", "-moz-grab");
                    $draggableItem.trigger(stopPullEvent);
                    jq(document).off(finishInteraction);
                });
            }).on(finishInteraction, function (triggerEvent) {
                triggerEvent.stopPropagation();
                jq(document).off(dragOperation); // For mobile
                jq(document).off(pullEvent);
            });
        },

        adjustHighlightBar: function ($barToModify, shadeFactor, spectrumLayout) {
            var darkGreyHslValue = { h: 0, s: 0, l: 0.05 },
                bwMidHslValue = { h: 0, s: 0, l: 0.5 },
                // Change to shade of bar is opposite of change to shade of spectrum
                barShadeFactor = -shadeFactor,
                barStripeShadeFactor = barShadeFactor * 10, // Needs to be black or white
                $barStripes = $barToModify.find(".highlight-bar-stripe"),
                updatedBarShade = (spectrumLayout === "lightenDirection") ?
                    utilityFunctions.adjustHSLLuminance(bwMidHslValue, barShadeFactor) :
                    utilityFunctions.adjustHSLLuminance(darkGreyHslValue, barShadeFactor);
            $barToModify.css("border-color", updatedBarShade);
            $barStripes.css("background-color", updatedBarShade);
        },

        // Must be called with apply and expects an arguments array like
        // [{type: "basic"}] or [{type: "complex", hsl: {h,s,l}}]
        determineActiveShade: function () {
            var $currentElement = jq(this),
                barWidth = jq(".highlight-bar").first().outerWidth(),
                halfBarWidth = barWidth / 2,
                activeTabType = arguments[0].type;

            if (activeTabType === "basic") {
                // Get the class of the parent shade box and slice off "spectrum"
                var $elementParent = $currentElement.parent(),
                    shadeIdentifier = $elementParent.attr("class").split("-")[2],
                    shadeHexCode = configuration.primaryShadeMap[shadeIdentifier],
                    shadeHslValue = tinycolor(shadeHexCode).toHsl();
                switch (shadeHexCode) {
                    case "fff":
                        var spectrumLayout = "darkenDirection";
                        break;
                    case "000":
                        var spectrumLayout = "lightenDirection";
                        break;
                    default:
                        var spectrumLayout = "twoWay";
                }
            } else {
                // Reset current L value to 0.5 because the shade factor lightens
                // and darkens against the baseline value
                var shadeHslValue = { "h": arguments[0].hsl.h, "l": 0.5, "s": arguments[0].hsl.s },
                    activeHue = arguments[0].hsl.h,
                    activeSaturation = arguments[0].hsl.s,
                    spectrumLayout = "twoWay",
                    $complexContainer = $currentElement.parents(".complex-options-list"),
                    $complexPreview = $complexContainer.find(".shade-display"),
                    $hueSpectrumBar = $complexContainer.find(".spectrum-hue-bar"),
                    $saturationSpectrumBar = $complexContainer.find(".spectrum-saturation-bar"),
                    $luminanceValue = $complexContainer.find(".luminance-value");
            }

            // Midpoint of the current left position of the shade bar
            var barPosition = parseInt($currentElement.css("left"), 10) + halfBarWidth,
                shadeFactor = utilityFunctions.determineShadeFactor(spectrumLayout, barPosition, activeTabType),
                activeShadeResult = utilityFunctions.adjustHSLLuminance(shadeHslValue, shadeFactor),
                activeHexResult = "#" + tinycolor(activeShadeResult).toHex();