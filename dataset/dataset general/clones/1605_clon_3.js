/*
Annotation Popup System
Author: Fictional Dev Team - "CodeCrafters Inc."
Date: October 26, 2023
License: MIT License (Simplified)

This script manages dynamic popups for annotations or footnotes.
It leverages jQuery for DOM manipulation and event handling.
*/

// Initialize the AnnotationPopups system once the DOM is fully loaded.
jQuery(document).ready(function() {
    AnnotationPopups.initialize();
});

// The core object managing all popup-related functionalities.
var AnnotationPopups = {
    // Timer ID for delaying the removal of the popup, preventing flicker.
    pendingRemovalTimer: null,

    // Configuration settings for the popup behavior and appearance.
    config: {
        popupMaxWidthPx: 450, // Maximum width for the popup in pixels.
        popupMaxHeightPx: 350, // Maximum height for the popup in pixels.
        viewportPaddingPx: 25, // Minimum padding from viewport edges.
        hideDelayMs: 300,      // Delay in milliseconds before hiding the popup.
        // Additional settings could be added here, e.g., showDelayMs, animationDuration.
    },

    /**
     * Sets up event listeners for all annotation trigger elements.
     * This method should be called once on document ready.
     */
    initialize: function() {
        // Critical check: Ensure jQuery is available before proceeding.
        if (typeof jQuery === 'undefined') {
            console.error("AnnotationPopups: jQuery library not found. Initialization aborted.");
            return;
        }

        // Select all anchor elements designated as annotation triggers.
        // We use a custom data attribute 'data-annotation-ref' for clarity.
        const annotationTriggers = jQuery("a[data-annotation-ref]");

        // Proactively remove any existing event handlers to prevent double-binding
        // or issues from re-initialization. Using a namespace '.popup' for specificity.
        annotationTriggers.off('mouseenter.popup', AnnotationPopups.displayReference);
        annotationTriggers.off('mouseleave.popup', AnnotationPopups.concealReference);

        // Attach new event handlers for mouse interactions.
        annotationTriggers.on('mouseenter.popup', AnnotationPopups.displayReference);
        annotationTriggers.on('mouseleave.popup', AnnotationPopups.concealReference);

        // console.info("AnnotationPopups system successfully initialized. Monitoring elements with 'data-annotation-ref'.");
    },

    /**
     * Handles the mouseenter event on an annotation trigger.
     * Displays the corresponding annotation popup.
     */
    displayReference: function() {
        // If a hide operation is pending, cancel it immediately.
        clearTimeout(AnnotationPopups.pendingRemovalTimer);

        // Stop any current animations on the popup and remove it if it exists.
        // This ensures only one popup is active at a time and prevents visual glitches.
        jQuery('#referenceOverlay').stop(true, true).remove();

        const currentTriggerElement = jQuery(this);
        // Retrieve the ID of the target content from the 'data-annotation-ref' attribute.
        const targetContentId = currentTriggerElement.data('annotation-ref');

        // Guard clause: If no target ID is specified, log a warning and exit.
        if (!targetContentId) {
            console.warn("AnnotationPopups: Trigger element missing 'data-annotation-ref' attribute.", currentTriggerElement[0]);
            return;
        }

        const triggerElementPosition = currentTriggerElement.offset();

        // Dynamically create the popup container element using modern jQuery syntax.
        const overlayContainer = jQuery('<div/>', {
            id: 'referenceOverlay',
            'aria-live': 'polite', // Announces dynamic content changes to assistive technologies.
            role: 'tooltip',       // Semantically identifies the element as a tooltip.
            tabindex: '-1'         // Make it focusable for accessibility if needed.
        });

        // Bind event handlers to the popup itself to keep it visible when the mouse moves over it.
        overlayContainer.on('mouseenter.popup', AnnotationPopups.preventHide);
        overlayContainer.on('mouseleave.popup', AnnotationPopups.concealReference);

        // Locate the source element containing the annotation content.
        const sourceContentElement = document.getElementById(targetContentId);

        // Guard clause: If the source content element is not found, log an error and exit.
        if (!sourceContentElement) {
            console.error("AnnotationPopups: Target content element not found for ID:", targetContentId);
            return;
        }

        let popupHtmlContent = jQuery(sourceContentElement).html();

        // Regular expression to remove internal back-reference links within the annotation content.
        // This prevents recursion or unwanted navigation within the popup.
        const backReferenceRemovalPattern = /<a[^>]*data-annotation-backref[^>]*>.*?<\/a>/g;
        popupHtmlContent = popupHtmlContent.replace(backReferenceRemovalPattern, '').trim(); // Remove links and trim whitespace.

        let dismissActionBtn = null;
        // Advanced check for touch-enabled devices to provide an explicit close button.
        // This improves UX on devices without traditional hover states.
        const isTouchCapableDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0);

        if (isTouchCapableDevice) {
            dismissActionBtn = jQuery('<button/>', {
                class: 'popup-dismiss-btn', // Use a class for styling the dismiss button.
                text: 'Dismiss',
                title: 'Close annotation popup'
            });
            dismissActionBtn.on('click', function(event) {
                event.preventDefault(); // Prevent default button behavior (e.g., form submission).
                jQuery('#referenceOverlay').remove(); // Immediately remove the popup.
            });
            // Prepend the dismiss button to the content for prominence.
            overlayContainer.prepend(dismissActionBtn);
        }

        // Append the cleaned annotation content to the popup container.
        overlayContainer.append(popupHtmlContent);

        const currentConfig = AnnotationPopups.config;
        const halfViewportPadding = currentConfig.viewportPaddingPx / 2;
        const currentViewportWidth = jQuery(window).width();
        const currentViewportHeight = jQuery(window).height();

        // Calculate maximum width for the popup, respecting viewport and config limits.
        let calculatedViewportMaxWidth = currentViewportWidth - currentConfig.viewportPaddingPx;
        calculatedViewportMaxWidth = Math.min(calculatedViewportMaxWidth, currentConfig.popupMaxWidthPx);

        // Calculate maximum height for the popup, respecting viewport and config limits.
        let calculatedViewportMaxHeight = currentViewportHeight - currentConfig.viewportPaddingPx;
        calculatedViewportMaxHeight = Math.min(calculatedViewportMaxHeight, currentConfig.popupMaxHeightPx);

        // Apply initial CSS styles to the popup for proper rendering and measurement.
        overlayContainer.css({
            position: 'absolute',     // Position absolutely within the document flow.
            width: 'auto',            // Allow content to determine width initially.
            'max-width': calculatedViewportMaxWidth + 'px',
            'max-height': calculatedViewportMaxHeight + 'px',
            opacity: 0,               // Start invisible for a smooth fade-in animation.
            overflowY: 'auto',        // Enable vertical scrolling if content exceeds max-height.
            boxSizing: 'border-box',  // Include padding and border in the element's total dimensions.
            zIndex: 9999,             // Ensure the popup is always on top.
            backgroundColor: '#ffffff',
            border: '1px solid #cccccc',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)', // Enhanced shadow for depth.
            padding: '15px',          // Slightly increased internal padding.
            borderRadius: '6px'       // Rounded corners for a modern look.
        });

        // Append the popup to the document body to ensure it's outside of any potentially confining elements.
        jQuery('body').append(overlayContainer);

        // Measure the popup's actual dimensions after it has been added to the DOM.
        const popupRenderedWidth = overlayContainer.outerWidth();
        const popupRenderedHeight = overlayContainer.outerHeight();

        let finalLeftPosition = triggerElementPosition.left;
        // Position the popup slightly below the trigger element.
        let finalTopPosition = triggerElementPosition.top + currentTriggerElement.outerHeight() + halfViewportPadding;

        // --- Horizontal Position Adjustment ---
        // Check if the popup overflows the right edge of the viewport.
        if ((finalLeftPosition + popupRenderedWidth + currentConfig.viewportPaddingPx) > (currentViewportWidth + jQuery(window).scrollLeft())) {
            // If it overflows, attempt to center it horizontally within the visible viewport.
            finalLeftPosition = (currentViewportWidth - popupRenderedWidth) / 2 + jQuery(window).scrollLeft();
            // Ensure it doesn't go off the left edge, clamping it to the viewport padding.
            finalLeftPosition = Math.max(jQuery(window).scrollLeft() + currentConfig.viewportPaddingPx, finalLeftPosition);
        } else if (finalLeftPosition < jQuery(window).scrollLeft()) {
            // If the popup starts off the left edge, align it with the left viewport padding.
            finalLeftPosition = jQuery(window).scrollLeft() + currentConfig.viewportPaddingPx;
        }

        // --- Vertical Position Adjustment ---
        // Check if the popup overflows the bottom edge of the viewport.
        if ((finalTopPosition + popupRenderedHeight + currentConfig.viewportPaddingPx) > (currentViewportHeight + jQuery(window).scrollTop())) {
            // If it overflows, try to position it above the trigger element instead.
            finalTopPosition = triggerElementPosition.top - popupRenderedHeight - halfViewportPadding;
            // If it still overflows above, clamp it to the top of the viewport with padding.
            if (finalTopPosition < jQuery(window).scrollTop() + currentConfig.viewportPaddingPx) {
                 finalTopPosition = jQuery(window).scrollTop() + currentConfig.viewportPaddingPx;
            }
        }

        // Adjust positions relative to the document body's scroll position,
        // as the popup is absolutely positioned within the body.
        const bodyOverallOffset = jQuery(document.body).offset();
        finalTopPosition -= bodyOverallOffset.top;
        finalLeftPosition -= bodyOverallOffset.left;

        // Apply the final calculated position and animate the popup into view.
        overlayContainer.css({
            left: finalLeftPosition,
            top: finalTopPosition
        }).animate({
            opacity: 0.98 // Slightly less than 1.0 for a subtle effect, or 1.0 for fully opaque.
        }, 180); // Faster animation duration for a snappier feel.
    },

    /**
     * Handles the mouseleave event from an annotation trigger or the popup itself.
     * Initiates a delayed hiding of the popup.
     */
    concealReference: function() {
        // Guard clause: If no popup exists, there's nothing to hide.
        if (jQuery('#referenceOverlay').length === 0) {
            return;
        }

        // Set a timeout to remove the popup after a short delay.
        // This delay allows for quick mouse movements between the trigger and the popup.
        AnnotationPopups.pendingRemovalTimer = setTimeout(function() {
            jQuery('#referenceOverlay').animate({
                opacity: 0 // Fade out the popup.
            }, 250, function() {
                jQuery(this).remove(); // Once faded, remove the element from the DOM.
            });
        }, AnnotationPopups.config.hideDelayMs); // Use the configurable hide delay.
    },

    /**
     * Handles the mouseenter event on the popup itself.
     * Prevents the popup from being hidden while the mouse is over it.
     */
    preventHide: function() {
        // Clear the pending hide timer, effectively keeping the popup visible.
        clearTimeout(AnnotationPopups.pendingRemovalTimer);
        // Ensure the popup's animation is stopped and it's fully visible.
        jQuery('#referenceOverlay').stop(true, true).animate({
            opacity: 0.98 // Re-apply full opacity in case it was partially fading.
        }, 80); // A very quick animation to ensure state.
        // console.log("AnnotationPopups: Popup hovered, hide timer reset.");
    }
};