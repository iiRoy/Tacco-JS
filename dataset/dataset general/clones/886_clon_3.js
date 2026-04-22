/*
 * Enhanced Notification Banner Module
 *
 * This module provides a flexible and customizable notification banner
 * that can be displayed at the top or bottom of a web page.
 * It's designed as a jQuery plugin, offering various options for
 * content, display duration, animations, and user interaction.
 *
 * Based on an original concept by Dmitri Smirnov (2009-2015),
 * re-engineered for improved clarity, modularity, and extensibility.
 *
 * License: MIT - https://opensource.org/licenses/MIT
 * Project Home: [Hypothetical New Project URL]
 */
(function (jq) {
    "use strict";

    // Pre-flight check: Ensure jQuery is properly loaded.
    if (!jq || typeof jq !== 'function' || !jq.fn) {
        console.error('jQuery (jq) dependency not met. The alertBox module cannot initialize.');
        return;
    }

    /**
     * Defines the standard configuration parameters for the alert box.
     * These defaults are applied if not explicitly overridden by the caller.
     */
    const standardAlertConfig = {
        contentHTML          : 'Default notification: please provide content.', // HTML string for the message.
        displayDuration      : 3000,                                         // Milliseconds before auto-dismissal. Set to 0 or Number.MAX_SAFE_INTEGER to disable.
        transitionSpeed      : 200,                                          // Animation speed in milliseconds ('slow', 'normal', 'fast' also accepted).
        customClass          : '',                                           // Additional CSS class to apply to the main alert element.
        preExistingElement   : null,                                         // A jQuery object to use instead of creating a new alert element.
        enableCloseButton    : false,                                        // If true, a dismiss button is added.
        closeBtnText         : '&times;',                                    // Text or HTML for the dismiss button.
        dismissOnClick       : true,                                         // If true, clicking the banner itself dismisses it.
        dismissOnHover       : false,                                        // If true, hovering over the banner dismisses it.
        beforeDisplayCallback: null,                                         // Function invoked before the display animation starts.
        afterDisplayCallback : null,                                         // Function invoked after the display animation completes.
        beforeDismissCallback: null,                                         // Function invoked before the dismissal animation starts.
        afterDismissCallback : null,                                         // Function invoked after the dismissal animation completes and element is removed.
        placement            : 'top',                                        // Position on the screen: 'top' or 'bottom'.
        allowMultiple        : false                                         // If false, existing alerts are dismissed before showing a new one.
    };

    /**
     * Initializes and displays a new notification alert box.
     * @param {object} userOptions - Configuration object to customize the alert box.
     * @returns {jQuery} The jQuery object representing the created alert box element.
     */
    jq.alertBox = function (userOptions) {
        // Validate input and merge with defaults.
        if (!userOptions || typeof userOptions !== 'object') {
            console.warn('Invalid or missing options provided for jq.alertBox. Proceeding with default configuration.');
            userOptions = {}; // Ensure it's an object for merging.
        }
        const effectiveOptions = jq.extend({}, standardAlertConfig, userOptions);

        // Declare core variables.
        const notificationID = Math.floor(Math.random() * 1e8); // Unique ID for this instance.
        let notificationElement;
        let contentWrapper;
        let animationTiming; // Stores the resolved animation duration in milliseconds.
        let autoDismissalTimeout = null; // Holds the ID for the auto-dismissal timer.

        // --- Internal Helper Functions ---

        /**
         * Animates the notification element into view.
         * @param {jQuery} targetPanel - The jQuery object of the notification panel to show.
         */
        const showNotificationPanel = function (targetPanel) {
            if (typeof effectiveOptions.beforeDisplayCallback === 'function') {
                effectiveOptions.beforeDisplayCallback.call(targetPanel[0]); // Context is the DOM element.
            }
            targetPanel.stop(true, true).slideDown(animationTiming, function () {
                if (typeof effectiveOptions.afterDisplayCallback === 'function') {
                    effectiveOptions.afterDisplayCallback.call(this); // Context is the DOM element.
                }
            });
        };

        /**
         * Animates the notification element out of view and removes it from the DOM.
         * @param {jQuery} targetPanel - The jQuery object of the notification panel to hide.
         */
        const hideNotificationPanel = function (targetPanel) {
            // Cancel any pending auto-dismissal if a manual dismissal occurs.
            if (autoDismissalTimeout) {
                clearTimeout(autoDismissalTimeout);
                autoDismissalTimeout = null;
            }

            if (typeof effectiveOptions.beforeDismissCallback === 'function') {
                effectiveOptions.beforeDismissCallback.call(targetPanel[0]);
            }
            targetPanel.stop(true, true).slideUp(animationTiming, function () {
                jq(this).remove(); // Always remove the element after slideUp, consistent with original.
                if (typeof effectiveOptions.afterDismissCallback === 'function') {
                    effectiveOptions.afterDismissCallback.call(null); // No specific element context after removal.
                }
            });
        };

        // --- Element Construction and Configuration ---

        // Determine if a pre-existing element should be used or a new one created.
        if (effectiveOptions.preExistingElement && effectiveOptions.preExistingElement instanceof jq) {
            notificationElement = effectiveOptions.preExistingElement;
            // If user did not provide contentHTML but provided a preExistingElement,
            // use the element's current HTML as content.
            if (!userOptions.contentHTML) {
                effectiveOptions.contentHTML = notificationElement.html();
            }
        } else {
            notificationElement = jq('<div/>', {
                'class'     : 'jq-notification-panel ' + effectiveOptions.customClass,
                'id'        : `__alertBoxInstance${notificationID}`,
                'role'      : 'alert',      // ARIA role for accessibility.
                'aria-live' : 'polite'      // Announce changes politely.
            });
        }

        // Create and populate the inner content wrapper.
        contentWrapper = jq('<span/>', {
            'class': 'notification-panel-message',
            'html' : effectiveOptions.contentHTML
        });

        // Clear existing content and append the new message, then hide the panel.
        notificationElement.empty().append(contentWrapper).hide();

        // Resolve animation speed to a numeric value.
        switch (effectiveOptions.transitionSpeed) {
            case 'slow':
                animationTiming = 600;
                break;
            case 'normal':
            case 'default':
                animationTiming = 400;
                break;
            case 'fast':
                animationTiming = 200;
                break;
            default:
                // Attempt to parse as an integer, fallback to 200ms.
                animationTiming = parseInt(effectiveOptions.transitionSpeed, 10) || 200;
                if (animationTiming < 0) animationTiming = 0; // Ensure non-negative duration.
        }

        // Apply placement class ('top' by default).
        notificationElement.addClass(effectiveOptions.placement === 'bottom' ? 'panel-bottom' : 'panel-top');

        // Append to the body. Prepending for 'top' placement, appending for 'bottom'.
        const targetBody = jq('body');
        if (targetBody.length === 0) {
            console.error('Document body element not found. Cannot attach notification panel.');
            return notificationElement; // Return the element even if not attached.
        }
        if (effectiveOptions.placement === 'bottom') {
            targetBody.append(notificationElement);
        } else {
            targetBody.prepend(notificationElement);
        }

        // --- Close Button Functionality ---
        if (effectiveOptions.enableCloseButton) {
            // If a close button is enabled, effectively disable auto-dismissal
            // by setting a very long duration, unless it's already explicitly disabled.
            if (effectiveOptions.displayDuration > 0 && effectiveOptions.displayDuration < Number.MAX_SAFE_INTEGER) {
                 effectiveOptions.displayDuration = Number.MAX_SAFE_INTEGER;
            }

            const dismissButton = jq('<a/>', {
                'href'       : '#',
                'class'      : 'notification-panel-dismiss',
                'html'       : effectiveOptions.closeBtnText,
                'role'       : 'button',          // ARIA role for interactive elements.
                'aria-label' : 'Dismiss notification' // ARIA label for screen readers.
            });
            notificationElement.append(dismissButton);

            dismissButton.on('click', function (evt) {
                evt.preventDefault(); // Prevent default link behavior.
                hideNotificationPanel(notificationElement);
            });
        }

        // --- Handling Multiple Notifications ---
        if (!effectiveOptions.allowMultiple) {
            // Dismiss any currently visible notification panels from this plugin.
            jq('.jq-notification-panel:visible').not(notificationElement).each(function() {
                // Directly slide up and remove them, bypassing their specific hide logic.
                jq(this).stop(true, true).slideUp(animationTiming, function() {
                    jq(this).remove();
                });
            });
        }

        // --- Display the Notification ---
        showNotificationPanel(notificationElement);

        // --- User Interaction Dismissal ---
        if (effectiveOptions.dismissOnClick) {
            notificationElement.on('click', function (evt) {
                // Ensure clicking the explicit dismiss button doesn't trigger this handler too.
                if (!jq(evt.target).hasClass('notification-panel-dismiss')) {
                    hideNotificationPanel(notificationElement);
                }
            });
        }

        if (effectiveOptions.dismissOnHover) {
            notificationElement.on('mouseenter', function () {
                hideNotificationPanel(notificationElement);
            });
        }

        // --- Automatic Dismissal ---
        // Schedule auto-dismissal if displayDuration is set and not effectively infinite.
        if (effectiveOptions.displayDuration > 0 && effectiveOptions.displayDuration < Number.MAX_SAFE_INTEGER) {
            autoDismissalTimeout = setTimeout(function () {
                hideNotificationPanel(notificationElement);
            }, effectiveOptions.displayDuration + animationTiming); // Add animation time to total duration.
        }

        // Return the jQuery object of the created/used notification element.
        return notificationElement;
    };

})(jQuery);