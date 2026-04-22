/*
 * JQuery.dialogs
 * https://github.com/yourusername/jquery-dialogs-modal
 *
 * Copyright (c) 2023 [Your Name/Company]
 * Licensed under the MIT license.
 *
 * This module provides flexible modal dialog functionality,
 * including dynamic positioning, overlay management, and focus trapping.
 */

; (function ($, undefined) {
    'use strict';

    // Unique identifier for the plugin and its data storage key
    const MODULE_ID = 'dialogsModal';
    // Prefix for CSS classes and event namespaces
    const MOD_PREFIX = MODULE_ID.toLowerCase();

    // Custom event names for internal and external use
    const EVT_ON_SHOW = MOD_PREFIX + 'show';
    const EVT_ON_HIDE = MOD_PREFIX + 'hide';
    const EVT_BEFORE_SHOW = MOD_PREFIX + 'beforeShow';
    const EVT_BEFORE_HIDE = MOD_PREFIX + 'beforeHide';

    // Internal state variables, shared across all modal instances
    let currentActiveModal = null; // Stores the jQuery object of the currently displayed modal.
                                   // `null` means no modal is open. `0` means a modal is fading in/out.
    let isProcessingAction = false; // Flag to prevent re-entry during modal open/close operations.
    let nextModalToOpen = null;     // Stores the modal scheduled to open after the current one closes (used with 'force' option).
    let activeTransitionElement = null; // The modal element currently undergoing an animation (fade in/out).

    // Global jQuery element references, initialized once on first plugin use
    let windowElement;
    let bodyElement;
    let modalOverlayElement;

    // State preservation for managing body scrolling and focus
    let previousActiveElement;      // Element that had focus before the modal opened.
    let firstFocusableElement;      // The first focusable element within the modal, for focus trapping.
    let originalBodyOverflow;       // Original 'overflow' CSS property of the body.
    let originalBodyMarginRight;    // Original 'margin-right' CSS property of the body.
    let originalBodyMarginBottom;   // Original 'margin-bottom' CSS property of the body.
    let initialScrollLeft;          // Window's scrollLeft position before modal opened.
    let initialScrollTop;           // Window's scrollTop position before modal opened.

    /**
     * Helper function to trigger custom events on a jQuery element.
     * @param {jQuery} targetElement - The jQuery element on which to trigger the event.
     * @param {string} eventName - The name of the custom event (e.g., 'dialogsModal.beforeShow').
     * @param {object} [eventParams={}] - Additional parameters to be merged into the event object.
     * @returns {jQuery.Event} The triggered event object instance.
     */
    function triggerCustomEvent(targetElement, eventName, eventParams = {}) {
        const customEvent = $.Event(eventName, eventParams);
        targetElement.trigger(customEvent);
        return customEvent;
    }

    /**
     * Initializes the modal plugin for a given set of elements.
     * This function sets up default options, global event handlers, and the modal overlay (backdrop)
     * if they haven't been initialized yet.
     * @param {jQuery} targetElements - The jQuery collection of elements to be initialized as modals.
     * @param {object} [userOptions] - User-provided options to override the default settings.
     * @returns {jQuery} The `targetElements` collection for chaining.
     */
    function initializeModalPlugin(targetElements, userOptions) {
        // Create a deep copy of the default settings and merge with user-provided options.
        // This ensures each modal instance has its own independent settings object.
        const effectiveSettings = $.extend(true, {}, initializeModalPlugin.defaults, userOptions);

        // Resolve overlay color: `fillColor` takes precedence, then `color` (as an alias).
        effectiveSettings.overlay.fillColor = effectiveSettings.overlay.fillColor || effectiveSettings.overlay.color || '#888';
        // Ensure modal's z-index is above the overlay's.
        effectiveSettings.zIndex = effectiveSettings.zIndex || (effectiveSettings.overlay.zIndex + 1);

        // Perform global, one-time setup tasks for the modal system.
        if (!windowElement) { // Check if global elements are already initialized
            windowElement = $(window);
            bodyElement = $('body');

            // Create and append the modal overlay (backdrop) to the body.
            modalOverlayElement = $('<div />', {
                'class': MOD_PREFIX + '-backdrop', // Distinct class name for the overlay
                'css': {
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '150%', // Extended height to cover mobile browser address bars
                    display: 'none', // Initially hidden
                    backgroundColor: effectiveSettings.overlay.fillColor, // Apply initial color
                    zIndex: effectiveSettings.overlay.zIndex // Apply initial z-index
                }
            }).appendTo(bodyElement)
              .on('click.' + MOD_PREFIX, hideModalDialog) // Clicking the overlay closes the modal
              .on('touchmove.' + MOD_PREFIX, (evt) => { // Prevent background scrolling on touch devices
                  evt.preventDefault();
                  return false;
              });

            // Set up global event handlers on the document for focus trapping and Escape key.
            $(document).on('focusin.' + MOD_PREFIX, (evt) => {
                // If a modal is currently open and the focus moves outside of it,
                // redirect focus back to the first focusable element within the modal.
                if (currentActiveModal && currentActiveModal.length && !currentActiveModal.has(evt.target).length) {
                    if (firstFocusableElement && firstFocusableElement.length) {
                        firstFocusableElement.focus(); // Trap focus within the modal
                    } else {
                        // If no focusable element, blur the current one to prevent focus leaving the window.
                        $(document.activeElement).blur();
                    }
                    evt.preventDefault(); // Prevent default focus behavior
                }
            }).on('keydown.' + MOD_PREFIX, (evt) => {
                // If the Escape key (keyCode 27) is pressed and a modal is open, close it.
                if (currentActiveModal && currentActiveModal.length && evt.keyCode === 27) {
                    return hideModalDialog(evt); // Pass the event to `hideModalDialog`
                }
            });

            // Attach a resize handler to the window to reposition the modal if it's open.
            windowElement.on('resize.' + MOD_PREFIX, () => {
                if (currentActiveModal && currentActiveModal.length) {
                    repositionModal(currentActiveModal);
                }
            });
        }

        // Iterate over each element in the jQuery collection to apply individual settings.
        return targetElements.each(function () {
            const currentElement = $(this);
            // Clone settings for each element to allow individual overrides later without affecting others.
            const elementSettings = $.extend(true, {}, effectiveSettings);

            // Define initial CSS properties for the modal element.
            const initialCssProps = {
                position: 'fixed',
                display: 'none', // Modals are hidden by default
                zIndex: elementSettings.zIndex
            };

            // Determine the positioning strategy based on the `offset` option.
            if (elementSettings.offset) {
                if (typeof elementSettings.offset === 'function') {
                    // Wrap a custom offset function to ensure it can still call the default centering.
                    const originalOffsetFunc = elementSettings.offset;
                    elementSettings.offset = function () {
                        // `this` inside the offset function refers to the modal element.
                        return originalOffsetFunc.call(this, () => {
                            centerModalOnScreen.call(this); // Callback for explicit centering.
                        });
                    };
                } else {
                    // If a static offset ({left, top}) is provided.
                    initialCssProps.left = elementSettings.offset.left;
                    initialCssProps.top = elementSettings.offset.top;
                    // Clear any potentially conflicting `margin-left` and `margin-top` from previous centering.
                    initialCssProps.marginLeft = initialCssProps.marginTop = '';
                }
            } else {
                // Default positioning strategy: center the modal on the screen.
                elementSettings.offset = centerModalOnScreen;
            }

            // Bind click handlers to elements within the modal that trigger its closure.
            if (elementSettings.closeClass) {
                currentElement.find('.' + elementSettings.closeClass)
                    .off('click.' + MOD_PREFIX) // Unbind any previous handlers with this namespace.
                    .on('click.' + MOD_PREFIX, hideModalDialog); // Bind the close handler.
            }

            // Bind custom event handlers specified in the `elementSettings` object.
            const eventMapping = [
                ['open', EVT_ON_SHOW],
                ['close', EVT_ON_HIDE],
                ['beforeopen', EVT_BEFORE_SHOW],
                ['beforeclose', EVT_BEFORE_HIDE]
            ];
            eventMapping.forEach((eventPair) => {
                const optionKey = eventPair[0];
                const eventType = eventPair[1];
                if (typeof elementSettings[optionKey] === 'function') {
                    currentElement.off(eventType + '.' + MOD_PREFIX) // Unbind previous handlers.
                                  .on(eventType + '.' + MOD_PREFIX, elementSettings[optionKey]); // Bind the new handler.
                }
            });

            // Apply initial CSS, store the settings, append to body, and prevent internal scrolling.
            currentElement.css(initialCssProps)
                .data(MODULE_ID, elementSettings) // Attach the element's specific settings.
                .appendTo(bodyElement) // Ensure the modal is a direct child of the body for proper fixed positioning.
                .on('touchmove.' + MOD_PREFIX, (evt) => { // Prevent scrolling inside the modal on touch devices.
                    evt.preventDefault();
                    return false;
                });
        });
    }

    // Default settings for the `dialogsModal` plugin.
    initializeModalPlugin.defaults = {
        duration: 200, // Default animation duration in milliseconds.
        effect: { // Default animation effects using jQuery's `fadeIn` and `fadeOut`.
            open: $.fn.fadeIn,
            close: $.fn.fadeOut
        },
        overlay: { // Settings for the modal backdrop.
            opacity: 0.6,
            zIndex: 9000,
            fillColor: null, // Custom overlay background color (e.g., '#000').
            color: null // Alias for `fillColor`.
        },
        closeClass: MOD_PREFIX + '-close', // Class name for elements within the modal that trigger its closure.
        force: false // If `true`, a new modal will force-close any currently open modal before displaying itself.
        // Optional callbacks: `offset` (function or {left, top}), `open`, `close`, `beforeopen`, `beforeclose`.
    };


    /**
     * Displays a modal dialog.
     * @param {jQuery} targetElements - The jQuery collection of elements. Only the first element in the collection will be shown.
     * @param {object} [activationOptions] - Options specific to this `show` call, overriding existing settings for this instance.
     * @returns {jQuery} The `targetElements` collection for chaining.
     */
    function showModalDialog(targetElements, activationOptions) {
        // Target only the first element in the collection, or an empty jQuery object if none.
        const modalInstance = targetElements.length ? targetElements.eq(0) : $();

        // Guard clauses to prevent action if already processing or no valid modal instance.
        if (isProcessingAction || !modalInstance.length) {
            return targetElements;
        }

        let settings = modalInstance.data(MODULE_ID);
        // Re-initialize settings if `activationOptions` are provided or if the modal hasn't been initialized yet.
        if (activationOptions || !settings) {
            initializeModalPlugin(modalInstance, activationOptions);
            settings = modalInstance.data(MODULE_ID); // Retrieve the updated settings.
        }

        // Handle the 'force' option: close the current modal before opening a new one.
        if (settings.force) {
            // If another modal is currently fading out (transitioning).
            if (activeTransitionElement && activeTransitionElement.get(0) !== modalInstance.get(0)) {
                // Immediately stop the ongoing transition of the previous modal and its overlay.
                activeTransitionElement.stop(true, true);
                modalOverlayElement.stop(true, true);
                activeTransitionElement = null; // Clear the reference to the transitioning element.
            }

            // If another modal is currently active and it's not the one we're trying to open.
            if (currentActiveModal && currentActiveModal.get(0) !== modalInstance.get(0)) {
                nextModalToOpen = modalInstance; // Schedule this modal to open after the current one closes.
                hideModalDialog(currentActiveModal); // Trigger the close sequence for the current modal.
                return targetElements; // Exit, as `hideModalDialog` will manage the subsequent open.
            }
        }

        // Proceed with opening only if no modal is currently active (`null` state).
        // If `currentActiveModal` is `0`, a modal is fading, so we implicitly wait.
        if (currentActiveModal === null) {
            isProcessingAction = true; // Lock actions during the opening sequence.

            // Trigger the 'beforeShow' event. If `preventDefault()` is called, stop the opening process.
            const beforeShowEvent = triggerCustomEvent(modalInstance, EVT_BEFORE_SHOW, { cancelable: true });
            if (beforeShowEvent.isDefaultPrevented()) {
                isProcessingAction = false;
                return targetElements;
            }

            // Save the body's original overflow style and calculate scrollbar width.
            const bodyStyleRef = bodyElement.get(0).style;
            originalBodyOverflow = bodyStyleRef.overflow;
            let scrollbarWidth = bodyElement.prop('clientWidth');
            let scrollbarHeight = bodyElement.prop('clientHeight');

            bodyElement.css('overflow', 'hidden'); // Hide body scrollbars.
            scrollbarWidth = bodyElement.prop('clientWidth') - scrollbarWidth; // Calculate actual scrollbar width.
            scrollbarHeight = bodyElement.prop('clientHeight') - scrollbarHeight; // Calculate actual scrollbar height.

            originalBodyMarginRight = bodyStyleRef.marginRight;
            originalBodyMarginBottom = bodyStyleRef.marginBottom;

            // Adjust body margins to prevent content shift when scrollbars are hidden.
            if (scrollbarWidth < 0) { // If scrollbar was present and removed (width becomes negative difference)
                bodyElement.css('marginRight', (parseInt(originalBodyMarginRight, 10) || 0) + Math.abs(scrollbarWidth) + 'px');
            }
            if (scrollbarHeight < 0) { // If scrollbar was present and removed (height becomes negative difference)
                bodyElement.css('marginBottom', (parseInt(originalBodyMarginBottom, 10) || 0) + Math.abs(scrollbarHeight) + 'px');
            }


            // Save the currently focused element to restore focus later.
            previousActiveElement = $(document.activeElement).blur();
            firstFocusableElement = $(); // Reset for the new modal.

            // Save current window scroll position and prevent further scrolling.
            initialScrollLeft = windowElement.scrollLeft();
            initialScrollTop = windowElement.scrollTop();
            windowElement.on('scroll.' + MOD_PREFIX, preventWindowScrolling);

            // Reposition the modal just before its animation starts.
            repositionModal(modalInstance, settings);

            // Apply overlay-specific styles (which might have changed) and fade it in.
            modalOverlayElement.css({
                backgroundColor: settings.overlay.fillColor,
                zIndex: settings.overlay.zIndex
            }).fadeTo(settings.duration, settings.overlay.opacity);

            // Indicate that a modal is currently in transition (fading).
            currentActiveModal = 0;

            // Trigger the modal's open effect defined in settings.
            settings.effect.open.call((activeTransitionElement = modalInstance), settings.duration || 1, () => {
                activeTransitionElement = null; // Clear the transition reference after animation.

                // After animation, find and focus the first focusable element within the modal.
                modalInstance.find('a[href], input:not([type="hidden"]), select, textarea, button, object, area[href], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]')
                    .filter(':visible:enabled') // Only consider visible and enabled elements.
                    .first() // Get the first one.
                    .each(function () {
                        const potentialFocusElement = $(this);
                        if (potentialFocusElement.focus().get(0) === document.activeElement) {
                            firstFocusableElement = potentialFocusElement;
                            return false; // Break the loop once the first focusable element is found and focused.
                        }
                    });

                currentActiveModal = modalInstance; // Set the modal as fully opened.
                triggerCustomEvent(modalInstance, EVT_ON_SHOW); // Trigger the 'show' event.
                isProcessingAction = false; // Release the action lock.
            });
        }
        return targetElements;
    }

    /**
     * Hides a modal dialog.
     * @param {jQuery|jQuery.Event} param - This can be a jQuery collection of elements (only the one matching `currentActiveModal` will be hidden)
     *                                      or a jQuery.Event object if triggered by an event (e.g., click on overlay, Escape key).
     * @returns {jQuery} The input jQuery collection or a dummy jQuery object if triggered by an event.
     */
    function hideModalDialog(param) {
        const triggeredByEvent = param instanceof $.Event;
        let modalInstanceToHide;

        // Determine which modal instance needs to be hidden.
        if (triggeredByEvent) {
            modalInstanceToHide = currentActiveModal; // If triggered by event, close the currently active modal.
        } else {
            // If called with a jQuery object, check if it's the currently active modal.
            const index = param.index(currentActiveModal);
            modalInstanceToHide = (index > -1) ? param.eq(index) : $();
        }

        // Guard clauses to prevent action if no modal is active, no modal to hide, or already processing.
        if (!currentActiveModal || !modalInstanceToHide.length || isProcessingAction) {
            if (triggeredByEvent) {
                param.preventDefault();
                return false;
            }
            return param;
        }

        isProcessingAction = true; // Lock actions during the closing sequence.

        // Trigger the 'beforeHide' event. If `preventDefault()` is called, stop the closing process.
        const beforeHideEvent = triggerCustomEvent(modalInstanceToHide, EVT_BEFORE_HIDE, {
            cancelable: true,
            from: triggeredByEvent ? param : nextModalToOpen // Indicate the source of the close.
        });

        if (beforeHideEvent.isDefaultPrevented()) {
            isProcessingAction = false;
            nextModalToOpen = null; // Clear the scheduled modal if close was prevented.
            if (triggeredByEvent) {
                param.preventDefault();
                return false;
            }
            return param;
        }

        const settings = modalInstanceToHide.data(MODULE_ID);
        // Determine animation duration: shorter if another modal is waiting to open (`nextModalToOpen`).
        const animationDuration = nextModalToOpen ? 1 : (settings.duration || 1);

        // Indicate that a modal is currently in transition (fading).
        currentActiveModal = 0;

        // Trigger the modal's close effect defined in settings.
        settings.effect.close.call((activeTransitionElement = modalInstanceToHide), animationDuration, () => {
            activeTransitionElement = null; // Clear the transition reference after animation.

            // Restore body's original styles and scroll position.
            bodyElement.css({
                overflow: originalBodyOverflow,
                marginRight: originalBodyMarginRight,
                marginBottom: originalBodyMarginBottom
            });

            // Restore focus to the element that was active before the modal opened.
            if (previousActiveElement && previousActiveElement.length) {
                previousActiveElement.focus();
            }

            // Re-enable window scrolling and restore the original scroll position.
            windowElement.off('scroll.' + MOD_PREFIX, preventWindowScrolling)
                .scrollLeft(initialScrollLeft)
                .scrollTop(initialScrollTop);

            currentActiveModal = null; // Set the modal as fully closed.

            // Trigger the 'hide' event.
            triggerCustomEvent(modalInstanceToHide, EVT_ON_HIDE, {
                from: triggeredByEvent ? param : nextModalToOpen
            });

            // If another modal was scheduled to open, initiate its display now.
            if (nextModalToOpen) {
                // Use `setTimeout(..., 0)` to ensure the current closing sequence completes fully
                // before starting the new modal's opening sequence, avoiding potential conflicts.
                window.setTimeout(() => {
                    showModalDialog(nextModalToOpen);
                    nextModalToOpen = null; // Clear the scheduled modal.
                }, 0);
            }
            isProcessingAction = false; // Release the action lock.
        });

        // Fade out the modal overlay (backdrop).
        modalOverlayElement.fadeOut(animationDuration);

        if (triggeredByEvent) {
            param.preventDefault();
            return false;
        }
        return param;
    }

    /**
     * Recalculates and applies the position of the modal based on its settings.
     * This function is typically called on modal open or window resize.
     * @param {jQuery} modalInstance - The jQuery object of the modal to reposition.
     * @param {object} [settings] - The settings object for the modal. If not provided, it will be retrieved from data.
     */
    function repositionModal(modalInstance, settings) {
        settings = settings || modalInstance.data(MODULE_ID);
        let positionCoords;
        // If an `offset` function is defined and returns coordinates, apply them.
        if (typeof settings.offset === 'function' &&
            (positionCoords = settings.offset.call(modalInstance))) { // `this` inside offset function refers to `modalInstance`.
            modalInstance.css({
                left: positionCoords.left,
                top: positionCoords.top,
                marginLeft: '', // Clear any centering margins if a specific offset is now being applied.
                marginTop: ''
            });
        }
    }

    /**
     * Centers the modal on the screen using negative margins.
     * This function is designed to be called as an `offset` strategy, where `this` refers to the modal element.
     */
    function centerModalOnScreen() {
        // Calculate and apply negative margins to achieve perfect centering.
        this.css({
            left: '50%',
            top: '50%',
            marginLeft: '-' + (this.outerWidth() / 2) + 'px',
            marginTop: '-' + (this.outerHeight() / 2) + 'px'
        });
    }

    /**
     * Prevents window scrolling when a modal is open by resetting the scroll position.
     * @param {jQuery.Event} evt - The scroll event object.
     */
    function preventWindowScrolling(evt) {
        // Restore the initial scroll position to effectively prevent any actual scrolling.
        windowElement.scrollLeft(initialScrollLeft).scrollTop(initialScrollTop);
        evt.preventDefault();
        return false;
    }

    /**
     * Gets or sets an option for a specific modal instance.
     * @param {jQuery} targetElements - The jQuery collection of elements; only the first will be affected.
     * @param {string} optionName - The name of the option to retrieve or modify.
     * @param {*} [optionValue] - The new value for the option. If `undefined`, the current value is returned (getter).
     * @returns {*} The option's value (if getting) or `undefined` (if setting or option not found).
     */
    function configureOption(targetElements, optionName, optionValue) {
        const modalInstance = targetElements.length ? targetElements.eq(0) : $();
        if (!modalInstance.length) {
            return;
        }

        let settings = modalInstance.data(MODULE_ID);
        // Initialize the modal if its settings haven't been loaded yet.
        if (!settings) {
            initializeModalPlugin(modalInstance);
            settings = modalInstance.data(MODULE_ID);
        }

        // Verify that the requested option actually exists in the settings.
        if (!Object.prototype.hasOwnProperty.call(settings, optionName)) {
            // console.warn(`${MODULE_ID}: Attempted to access non-existent option "${optionName}".`);
            return; // Option not found.
        }

        // If an `optionValue` is provided (and is not strictly `undefined` or `null`), set the option.
        if (optionValue !== undefined && optionValue !== null) {
            settings[optionName] = optionValue;
            // Immediately re-apply certain settings if they affect the visual state of an open modal.
            if (currentActiveModal && currentActiveModal.get(0) === modalInstance.get(0)) {
                if (optionName === 'zIndex') {
                    modalInstance.css('zIndex', optionValue);
                    modalOverlayElement.css('zIndex', settings.overlay.zIndex); // Re-apply overlay z-index as well.
                } else if (optionName === 'overlay') {
                    // If overlay settings are changed, update the overlay's appearance.
                    modalOverlayElement.css({
                        backgroundColor: settings.overlay.fillColor || settings.overlay.color || '#888',
                        zIndex: settings.overlay.zIndex
                    });
                }
                // Add more specific updates for other options if necessary.
            }
        }
        return settings[optionName]; // Return the current value of the option.
    }

    /**
     * Public API for the `dialogsModal` plugin, extending jQuery's prototype.
     * Allows users to initialize, show, hide, and configure modal dialogs.
     * @param {string|object} operationType - The action to perform ('show', 'hide', 'option') or an options object for initialization.
     * @param {*} [param1] - First parameter for the operation (e.g., options for 'show', optionName for 'option').
     * @param {*} [param2] - Second parameter for the operation (e.g., optionValue for 'option').
     * @returns {jQuery} The jQuery collection for chaining.
     */
    $.fn[MODULE_ID] = function (operationType, param1, param2) {
        if (typeof operationType === 'string') {
            switch (operationType) {
                case 'show':
                    return showModalDialog(this, param1);
                case 'hide':
                    return hideModalDialog(this);
                case 'option':
                    // If `param2` is undefined, it's a getter call; otherwise, it's a setter.
                    return configureOption(this, param1, param2);
                /*
                // Example of adding a 'destroy' method:
                case 'destroy':
                    // return destroyModal(this); // A function to unbind all events and remove elements.
                    console.warn(`${MODULE_ID}: 'destroy' operation not yet implemented.`);
                    return this;
                */
                default:
                    // console.warn(`${MODULE_ID}: Unknown operation type "${operationType}".`);
                    return this; // Return original collection for unknown operations.
            }
        } else if (typeof operationType === 'object' || operationType === undefined) {
            // If `operationType` is an object, it represents initialization options.
            // If `undefined`, it's a call without arguments, also treated as initialization.
            return initializeModalPlugin(this, operationType);
        } else {
            // console.warn(`${MODULE_ID}: Invalid argument type for operation.`);
            return this; // Return original collection for invalid argument types.
        }
    };

})(jQuery);