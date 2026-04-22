/**
 * jQuery.dialogBox
 * This is a modified version of plainModal with different naming conventions.
 *
 * Copyright (c) 2024 a.developer
 * Licensed under the Apache-2.0 license.
 */

; (function ($, undefined) {
    'use strict';

    // Core application identifiers
    var dialogBox = 'dialogBox',
        dlgBox = dialogBox.toLowerCase(),

        // Custom event types for dialog lifecycle
        EVT_BOX_SHOW = dlgBox + 'show',
        EVT_BOX_HIDE = dlgBox + 'hide',
        EVT_BOX_PRESHOW = dlgBox + 'preshow',
        EVT_BOX_PREHIDE = dlgBox + 'prehide',

        /*
          State of the currently active dialog element:
          currentPanel === null : No dialog is visible.
          currentPanel === 0    : A dialog is in the process of fading.
        */
        currentPanel = null,

        // Internal control variables
        busyProcess, nextPanelToOpen, fadingElement,
        // Cached jQuery objects for performance
        windowObject, documentBody, backdropElement, previousActiveElement, firstFocusableElement,
        // Saved body and window states
        originalBodyOverflow, originalBodyMarginRight, originalBodyMarginBottom,
        initialScrollLeft, initialScrollTop;

    // Initializes a dialog element with given options.
    function initializePanel(targetElements, setupOptions) {
        // The configuration object is shared across all elements in 'targetElements'.
        // Avoid modifying its properties directly; replace the object for new configurations.
        var config = $.extend(true, {
            animationDuration: 200,
            transitionEffects: { show: $.fn.fadeIn, hide: $.fn.fadeOut },
            backgroundCover: { opacity: 0.6, zIndex: 9000 },
            dismissClass: dlgBox + '-dismiss'
            // Optional settings: positionOffset, show, hide
        }, setupOptions);
        // Set a fallback background color for the overlay
        config.backgroundCover.bgColor = config.backgroundCover.bgColor || config.backgroundCover.paint /* shorthand */ || '#888';
        // Ensure dialog z-index is above its overlay
        config.zIndex = config.zIndex || config.backgroundCover.zIndex + 1;

        // One-time setup for global elements
        if (!windowObject) {
            windowObject = $(window);
            documentBody = $('body');
            // Create and append the modal backdrop
            backdropElement = $('<div class="' + dlgBox + '-backdrop" />').css({
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100%',
                height: '150%', // Extended height for mobile address bar scrolling
                display: 'none'
            }).appendTo(documentBody).click(hidePanel) // Close dialog on backdrop click
                .on('touchmove', function () { return false; }); // Prevent scrolling on touch devices
            // Handle focus management within the dialog
            $(document).on('focusin', function (focusEvent) {
                if (currentPanel && !currentPanel.has(focusEvent.target).length) {
                    if (firstFocusableElement) { firstFocusableElement.focus(); }
                    else { $(document.activeElement).blur(); } // Blur if no focusable element found
                }
            })
                // Handle keyboard events globally
                .on('keydown', function (keyboardEvent) {
                    if (currentPanel && keyboardEvent.keyCode === 27) { // Escape key pressed
                        return hidePanel(keyboardEvent);
                    }
                });
        }

        // Apply settings to each selected element
        return targetElements.each(function () {
            var currentItem = $(this),
                styleProps = {
                    position: 'fixed',
                    display: 'none',
                    zIndex: config.zIndex
                };

            // Determine how the dialog will be positioned
            if (config.positionOffset) {
                if (typeof config.positionOffset === 'function') {
                    // Wrap custom offset function to include centering logic
                    config.positionOffset = (function (originalFunc) {
                        return function () {
                            var self = this; // Context determined by caller
                            return originalFunc.call(self, function () { centerPanel.call(self); });
                        };
                    })(config.positionOffset);
                } else { // Static offset provided
                    styleProps.left = config.positionOffset.left;
                    styleProps.top = config.positionOffset.top;
                    styleProps.marginLeft = styleProps.marginTop = ''; // Clear previous centering margins
                }
            } else {
                // Default to centering if no offset specified
                config.positionOffset = centerPanel;
            }

            // Bind dismiss actions
            if (config.dismissClass) {
                currentItem.find('.' + config.dismissClass).off('click', hidePanel).on('click', hidePanel);
            }
            // Attach custom event handlers defined in options
            $.each([['show', EVT_BOX_SHOW],
            ['hide', EVT_BOX_HIDE],
            ['preshow', EVT_BOX_PRESHOW],
            ['prehide', EVT_BOX_PREHIDE]], function (idx, eventPair) {
                var optionKey = eventPair[0], eventType = eventPair[1];
                if (typeof config[optionKey] === 'function') {
                    currentItem.off(eventType, config[optionKey]).on(eventType, config[optionKey]);
                }
            });
            // Apply initial styles, store config, and append to body
            currentItem.css(styleProps).data(dialogBox, config).appendTo(documentBody)
                .on('touchmove', function () { return false; }); // Prevent scrolling on touch devices
        });
    }

    // Displays the specified dialog panel.
    function showPanel(targetElements, displaySettings) {
        var selectedPanel = targetElements.length ? targetElements.eq(0) : undefined, // Only operate on the first element
            panelConfig, inlineStyles, calculatedMarginRight, calculatedMarginBottom, triggeredEvent;

        // Prevent action if another process is busy or no target is selected
        if (busyProcess || !selectedPanel) { return targetElements; }

        // Load or initialize panel configuration
        if (displaySettings || !(panelConfig = selectedPanel.data(dialogBox))) {
            panelConfig = initializePanel(selectedPanel, displaySettings).data(dialogBox);
        }

        // If 'force' is enabled and another panel is currently fading, stop it immediately.
        if (!nextPanelToOpen && panelConfig.force && fadingElement && fadingElement.get(0) !== selectedPanel.get(0)) {
            fadingElement.stop(true, true);
            backdropElement.stop(true, true);
        }

        // If 'force' is enabled and another panel is open, close it before opening the new one.
        if (!nextPanelToOpen && panelConfig.force && currentPanel && currentPanel.get(0) !== selectedPanel.get(0)) {
            nextPanelToOpen = selectedPanel; // Store the next panel to open
            hidePanel(currentPanel);
        } else if (currentPanel === null) { // No dialog currently open
            busyProcess = true; // Set a lock to prevent concurrent actions

            // Trigger 'preshow' event
            triggeredEvent = $.Event(EVT_BOX_PRESHOW, { cancelable: true });
            selectedPanel.trigger(triggeredEvent);

            if (!triggeredEvent.isDefaultPrevented()) { // Proceed if event not cancelled
                inlineStyles = documentBody.get(0).style;
                originalBodyOverflow = inlineStyles.overflow;
                calculatedMarginRight = documentBody.prop('clientWidth');
                calculatedMarginBottom = documentBody.prop('clientHeight');
                documentBody.css('overflow', 'hidden'); // Hide body scrollbars
                // Adjust body margin to compensate for scrollbar removal
                calculatedMarginRight -= documentBody.prop('clientWidth');
                calculatedMarginBottom -= documentBody.prop('clientHeight');
                originalBodyMarginRight = inlineStyles.marginRight;
                originalBodyMarginBottom = inlineStyles.marginBottom;
                if (calculatedMarginRight < 0) { documentBody.css('marginRight', '+=' + (-calculatedMarginRight)); }
                if (calculatedMarginBottom < 0) { documentBody.css('marginBottom', '+=' + (-calculatedMarginBottom)); }

                previousActiveElement = $(document.activeElement).blur(); // Save and blur the currently focused element
                firstFocusableElement = null;
                initialScrollLeft = windowObject.scrollLeft();
                initialScrollTop = windowObject.scrollTop();
                windowObject.on('scroll', preventScroll); // Prevent window scrolling

                applyOffset(selectedPanel, panelConfig); // Apply positioning
                // Execute the 'show' transition effect. If duration is 0, callback runs immediately.
                panelConfig.transitionEffects.show.call((fadingElement = selectedPanel), panelConfig.animationDuration || 1, function () {
                    fadingElement = undefined; // Clear fading element reference
                    // Find the first focusable element within the dialog
                    selectedPanel.find('a,input,select,textarea,button,object,area,img,map').each(function () {
                        var currentItem = $(this);
                        if (currentItem.focus().get(0) === document.activeElement) { // Check if element can actually receive focus
                            firstFocusableElement = currentItem;
                            return false; // Stop after finding the first one
                        }
                    });
                    currentPanel = selectedPanel; // Mark this dialog as currently open
                    // Trigger 'show' event
                    selectedPanel.trigger(EVT_BOX_SHOW);
                });
                // Style and fade in the backdrop, which is shared across all dialogs.
                backdropElement.css({ backgroundColor: panelConfig.backgroundCover.bgColor, zIndex: panelConfig.backgroundCover.zIndex })
                    .fadeTo(panelConfig.animationDuration, panelConfig.backgroundCover.opacity);
                currentPanel = 0; // Indicate that a panel is fading
            }
            busyProcess = false; // Release the lock
        }
        return targetElements;
    }

    // Hides the specified dialog panel.
    function hidePanel(inputParam) { // inputParam can be a jQuery object or an event
        var isTriggerEvent = inputParam instanceof $.Event, panelToHide, panelConfig, triggeredEvent, animationDuration;

        // Prevent action if busy or no dialog is open
        if (!busyProcess && currentPanel) {
            busyProcess = true; // Set a lock

            // Determine which panel to hide
            panelToHide = isTriggerEvent ? currentPanel : (function () { // Check if target is among the open dialogs
                var index = inputParam.index(currentPanel);
                return index > -1 ? inputParam.eq(index) : undefined;
            })();

            if (panelToHide) {
                // Trigger 'prehide' event
                triggeredEvent = $.Event(EVT_BOX_PREHIDE, { cancelable: true });
                if (isTriggerEvent) { triggeredEvent.from = inputParam; }
                else if (nextPanelToOpen) { triggeredEvent.from = nextPanelToOpen; }
                panelToHide.trigger(triggeredEvent);

                if (!triggeredEvent.isDefaultPrevented()) { // Proceed if event not cancelled
                    panelConfig = panelToHide.data(dialogBox);
                    // Determine animation duration (1 for immediate if a new panel is opening)
                    animationDuration = nextPanelToOpen ? 1 : (panelConfig.animationDuration || 1);
                    // Execute the 'hide' transition effect.
                    panelConfig.transitionEffects.hide.call((fadingElement = panelToHide), animationDuration, function () {
                        var completionEvent;
                        fadingElement = undefined; // Clear fading element reference
                        // Restore original body styles
                        documentBody.css({
                            overflow: originalBodyOverflow,
                            marginRight: originalBodyMarginRight,
                            marginBottom: originalBodyMarginBottom
                        });
                        if (previousActiveElement && previousActiveElement.length) { previousActiveElement.focus(); } // Restore focus
                        // Restore window scroll position and re-enable scrolling
                        windowObject.off('scroll', preventScroll).scrollLeft(initialScrollLeft).scrollTop(initialScrollTop);
                        currentPanel = null; // Mark no dialog as open
                        // Trigger 'hide' event
                        completionEvent = $.Event(EVT_BOX_HIDE);
                        if (isTriggerEvent) { completionEvent.from = inputParam; }
                        else if (nextPanelToOpen) { completionEvent.from = nextPanelToOpen; }
                        panelToHide.trigger(completionEvent);
                        // If there's a next panel queued, open it
                        if (nextPanelToOpen) {
                            window.setTimeout(function () {
                                showPanel(nextPanelToOpen);
                                nextPanelToOpen = undefined; // Clear the queue
                            }, 0);
                        }
                    });
                    backdropElement.fadeOut(animationDuration); // Fade out the backdrop
                    currentPanel = 0; // Indicate panel is fading
                } else {
                    nextPanelToOpen = undefined; // Clear queued panel if hide was prevented
                }
            }
            busyProcess = false; // Release the lock
        }
        if (isTriggerEvent) { inputParam.preventDefault(); return false; } // Prevent default event action
        return inputParam;
    }

    // Applies the offset positioning to a dialog.
    function applyOffset(targetElement, elementOptions) {
        var posCoords;
        elementOptions = elementOptions || targetElement.data(dialogBox); // Get options if not provided
        // If a function is defined for offset, call it and apply returned coordinates
        if (typeof elementOptions.positionOffset === 'function' &&
            (posCoords = elementOptions.positionOffset.call(targetElement))) {
            targetElement.css({ left: posCoords.left, top: posCoords.top, marginLeft: '', marginTop: '' });
        }
    }

    // Centers the dialog panel on the screen.
    function centerPanel() {
        // Recalculate and apply centering CSS properties dynamically.
        // This ensures correct positioning even if dialog dimensions change.
        this.css({
            left: '50%',
            top: '50%',
            marginLeft: '-' + (this.outerWidth() / 2) + 'px',
            marginTop: '-' + (this.outerHeight() / 2) + 'px'
        });
    }

    // Prevents window scrolling when a dialog is open.
    function preventScroll(scrollEvent) {
        windowObject.scrollLeft(initialScrollLeft).scrollTop(initialScrollTop); // Reset scroll position
        scrollEvent.preventDefault(); // Stop default scroll behavior
        return false;
    }

    // Sets or retrieves an option for a specific dialog element.
    function configureSetting(targetElement, settingName, settingValue) {
        var specificElement = targetElement.length ? targetElement.eq(0) : undefined, // Work with the first element only
            currentConfig;
        if (!specificElement) { return; }
        // Get existing config or initialize if none exists
        currentConfig = specificElement.data(dialogBox) || initializePanel(specificElement).data(dialogBox);
        if (!currentConfig.hasOwnProperty(settingName)) { return; } // Only allow setting existing options
        // Update the setting if a new value is provided
        if (settingValue != null) { currentConfig[settingName] = settingValue; }
        return currentConfig[settingName]; // Return the current value of the setting
    }

    // Document ready and window resize handling
    $(function () {
        $(window).on('resize', function () {
            if (currentPanel) { applyOffset(currentPanel); } // Recalculate offset if a dialog is open
        });
    });

    // Extend jQuery's prototype to add dialogBox functionality
    $.fn[dialogBox] = function (command, parameter1, parameter2) {
        return (
            command === 'show' ? showPanel(this, parameter1) :
                command === 'hide' ? hidePanel(this) :
                    command === 'setting' ? configureSetting(this, parameter1, parameter2) :
                        initializePanel(this, command)); // If command is not recognized, assume it's options for init.
    };

})(jQuery);