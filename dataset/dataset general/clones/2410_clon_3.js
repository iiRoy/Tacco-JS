/*
    Core Application Notification Module
    Version: 3.0 (Derived from an older flash messaging library)
    This module provides a robust and configurable system for displaying
    temporary alerts and messages to the user within a web application.
    It leverages jQuery for efficient DOM manipulation and adheres to modern
    JavaScript practices.
*/

(function(globalWindow, externalJQuery) {
    "use strict"; // Enforce strict mode for cleaner and safer code execution.

    // --- Module Initialization & Dependency Check ---
    // A crucial first step: verify that jQuery, a core dependency, is available.
    if (typeof externalJQuery === 'undefined') {
        console.error("Dependency Error: jQuery (externalJQuery) is not loaded! The application's notification system cannot be initialized.");
        return; // Exit if jQuery is missing to prevent runtime errors.
    }

    // --- Configuration Constants & Internal State Variables ---
    // These constants define the CSS selectors and classes used by the notification system,
    // making the code more maintainable and easier to update.
    const MESSAGE_PANEL_ROOT_SELECTOR = '.app-system-alert-panel';
    const MESSAGE_CONTENT_AREA_SELECTOR = '.alert-message-text';
    const DISMISS_ACTION_BUTTON_SELECTOR = '.alert-dismiss-button';
    const ERROR_VISUAL_CLASS = 'alert-state-error';
    const SUCCESS_VISUAL_CLASS = 'alert-state-success';
    const INVISIBLE_STATE_CLASS = 'visually-hidden-element'; // Renamed from 'hide' for semantic clarity.

    // Default duration for auto-dismissal and animation speeds.
    const DEFAULT_AUTO_DISMISS_TIMEOUT_MS = 7500; // Auto-hide after 7.5 seconds (changed from 10s).
    const ANIMATION_DURATION_MS = 500; // Standard animation speed for fade effects.

    // This variable will hold the ID of the current auto-dismiss timer,
    // allowing us to clear it if a new message arrives or the user closes it manually.
    let activeDismissalTimerId = null;

    // --- Private Helper Function: Constructs the Notification Element ---
    /**
     * Dynamically generates the HTML structure for the notification panel using jQuery.
     * This ensures consistency and flexibility in the panel's construction.
     * @returns {jQuery} A jQuery object representing the complete notification panel.
     */
    function createNotificationPanelElement() {
        // Base container for the entire notification.
        const panelContainer = externalJQuery('<div>')
            .addClass(MESSAGE_PANEL_ROOT_SELECTOR + ' ' + SUCCESS_VISUAL_CLASS + ' ' + INVISIBLE_STATE_CLASS)
            .css({
                position: 'fixed', // 'fixed' ensures it stays in view during scroll.
                top: '20px', // Slightly adjusted top position.
                left: '50%',
                transform: 'translateX(-50%)', // CSS transform for perfect horizontal centering.
                width: 'min(90%, 650px)', // Responsive width: 90% of parent, max 650px.
                zIndex: '2100', // Higher z-index to ensure visibility above most elements.
                padding: '1.25rem 1.5rem', // Generous padding.
                borderRadius: '0.4rem', // Slightly rounded corners.
                boxShadow: '0 0.6rem 1.2rem rgba(0,0,0,0.2)', // More prominent shadow.
                textAlign: 'center', // Center text within the alert.
                display: 'flex', // Use flexbox for internal layout (message + button).
                alignItems: 'center',
                justifyContent: 'space-between'
            });

        // The paragraph element that will hold the actual message text.
        const messageDisplayParagraph = externalJQuery('<p>')
            .addClass(MESSAGE_CONTENT_AREA_SELECTOR)
            .css({
                margin: '0', // Remove default paragraph margin.
                flexGrow: '1', // Allow message to take available space.
                marginRight: '1rem' // Space between message and close button.
            });

        // The close button for manual dismissal.
        const closeTriggerButton = externalJQuery('<a>')
            .addClass(DISMISS_ACTION_BUTTON_SELECTOR)
            .attr({ 'href': '#', 'aria-label': 'Close notification' }) // Add ARIA label for accessibility.
            .html('&times;') // HTML entity for a multiplication sign 'x'.
            .css({
                fontWeight: 'bold',
                fontSize: '1.6rem',
                lineHeight: '1',
                color: 'inherit', // Inherit color for consistency.
                textDecoration: 'none',
                opacity: '0.6',
                cursor: 'pointer'
            });

        // Assemble the elements: add the message paragraph and button to the container.
        panelContainer.append(messageDisplayParagraph, closeTriggerButton);
        return panelContainer;
    }

    // --- DOM Ready Event Handler ---
    // This function executes once the entire DOM structure is fully loaded and parsed.
    externalJQuery(document).ready(function () {
        // Check if the notification panel already exists in the DOM.
        // This prevents duplicate elements if the script is run multiple times or due to SPA routing.
        let existingPanel = externalJQuery(MESSAGE_PANEL_ROOT_SELECTOR);
        if (existingPanel.length === 0) {
            // If not found, create and append it to the document body.
            externalJQuery('body').append(createNotificationPanelElement());
        }

        // --- Event Delegation for Dismiss Button ---
        // Attaching a delegated event listener to the 'body' ensures that
        // the close button functionality works even if the notification panel
        // is dynamically added or removed from the DOM.
        externalJQuery('body').on('click', MESSAGE_PANEL_ROOT_SELECTOR + ' ' + DISMISS_ACTION_BUTTON_SELECTOR, function(event) {
            event.preventDefault(); // Prevent default link behavior (e.g., jumping to top of page).
            const currentAlertPanel = externalJQuery(this).closest(MESSAGE_PANEL_ROOT_SELECTOR);
            // Initiate fade-out animation.
            currentAlertPanel.fadeOut(ANIMATION_DURATION_MS, function() {
                // After fading, add the hidden class and remove any inline 'display' style
                // that might prevent it from being hidden by CSS.
                externalJQuery(this).addClass(INVISIBLE_STATE_CLASS).removeAttr('style');
            });
            // Crucially, clear any pending auto-dismiss timer if the user closes manually.
            if (activeDismissalTimerId) {
                clearTimeout(activeDismissalTimerId);
                activeDismissalTimerId = null;
            }
        });
    });

    // --- Public API Function: Displaying a Notification ---
    /**
     * Presents a transient notification message to the user.
     * This function is exposed globally to be called from other parts of the application.
     *
     * @param {string} notificationContent - The HTML string content for the message.
     * @param {boolean} [isCriticalError=false] - If true, the message will be styled as an error.
     * @param {number} [dismissDurationMs=DEFAULT_AUTO_DISMISS_TIMEOUT_MS] - The duration (in milliseconds)
     *        before the notification automatically fades away. Defaults to a predefined constant.
     */
    globalWindow.displayApplicationAlert = function(notificationContent, isCriticalError = false, dismissDurationMs = DEFAULT_AUTO_DISMISS_TIMEOUT_MS) {
        // --- Input Validation ---
        // Basic check to ensure a valid message string is provided.
        if (!notificationContent || typeof notificationContent !== 'string' || notificationContent.trim() === '') {
            console.warn("Notification Warning: Attempted to display an empty or invalid alert message. Aborting.");
            return;
        }

        let targetAlertPanel = externalJQuery(MESSAGE_PANEL_ROOT_SELECTOR);

        // --- Robustness Check: Ensure Panel Exists ---
        // If for some reason the panel wasn't created on DOM ready (e.g., script loaded late),
        // attempt to create it now.
        if (targetAlertPanel.length === 0) {
            console.warn("Notification System: Alert panel not found in DOM. Attempting emergency creation.");
            externalJQuery('body').append(createNotificationPanelElement());
            targetAlertPanel = externalJQuery(MESSAGE_PANEL_ROOT_SELECTOR); // Re-select after appending.
            if (targetAlertPanel.length === 0) {
                console.error("Notification Error: Failed to create or locate the alert panel. Message will not be displayed.");
                return; // Critical failure, cannot proceed.
            }
        }

        // --- State Management: Clear Previous Timers & Animations ---
        // Before displaying a new message, clear any existing auto-dismiss timers
        // and stop any ongoing jQuery animations on the panel to prevent conflicts.
        if (activeDismissalTimerId) {
            clearTimeout(activeDismissalTimerId);
            activeDismissalTimerId = null;
        }
        targetAlertPanel.stop(true, true); // `stop(clearQueue, jumpToEnd)`

        // --- Apply Styling Based on Message Type ---
        // Toggle error or success classes to visually differentiate messages.
        if (isCriticalError) {
            targetAlertPanel.addClass(ERROR_VISUAL_CLASS).removeClass(SUCCESS_VISUAL_CLASS);
        } else {
            targetAlertPanel.removeClass(ERROR_VISUAL_CLASS).addClass(SUCCESS_VISUAL_CLASS);
        }

        // --- Update Message Content ---
        // Insert the provided HTML content into the designated message area.
        targetAlertPanel.find(MESSAGE_CONTENT_AREA_SELECTOR).html(notificationContent);

        // --- Display Animation ---
        // Ensure the panel is visible: first remove the hidden class, set opacity to 0,
        // then animate it to full opacity (fade in).
        targetAlertPanel.removeClass(INVISIBLE_STATE_CLASS).css('opacity', 0).fadeIn(ANIMATION_DURATION_MS);

        // --- Set Auto-Dismiss Timer ---
        // Schedule the notification to fade out automatically after the specified duration.
        activeDismissalTimerId = setTimeout(function() {
            targetAlertPanel.fadeOut(ANIMATION_DURATION_MS, function() {
                // After fading out, hide the element completely and remove inline styles.
                externalJQuery(this).addClass(INVISIBLE_STATE_CLASS).removeAttr('style');
            });
            activeDismissalTimerId = null; // Clear the timer ID once executed.
        }, dismissDurationMs);
    };

})(window, jQuery); // Pass `window` and `jQuery` as arguments for better scope isolation and minification.