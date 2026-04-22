// This module provides advanced client-side interactive functionalities for web pages.
// It manages collapsible content sections and ensures external links open in new browser tabs.
// Developed: October 2023
// Version: 2.1
// This script assumes jQuery library is loaded and available.

(function($) {
    "use strict"; // Enforce stricter parsing and error handling

    // Execute script only after the entire DOM is fully loaded and parsed.
    $(function() {

        // Centralized configuration object for all UI-related constants and class names.
        // This enhances maintainability and allows for easy customization.
        const userInterfaceSettings = {
            collapsibleControlClass: "dynamic-content-expander", // Renamed from 'toggle'
            initialLinkStyleClass: "actionable-item-link",     // Renamed from 'make-link'
            contentHiddenStateClass: "section-collapsed",      // Renamed from 'header-hidden'
            contentVisibleStateClass: "section-expanded",       // Renamed from 'header-shown'
            animationSpeed: "fast",                             // Renamed from 'normal'
            externalLinkClass: "external-nav-link",             // Renamed from 'popup'
            newWindowTarget: "_blank"
        };

        // --- SECTION 1: Dynamic Collapsible Content Management ---
        // Identify all elements designated to control collapsible content sections.
        const contentExpanders = $(`.${userInterfaceSettings.collapsibleControlClass}`);

        // Only proceed if there are actual content expander elements on the page.
        if (contentExpanders.length > 0) {
            console.groupCollapsed("Dynamic Content Module Initialization");
            console.info(`Found ${contentExpanders.length} collapsible controls.`);

            // Initialize expander elements with base classes for styling and initial state.
            contentExpanders
                .addClass(userInterfaceSettings.initialLinkStyleClass)
                .addClass(userInterfaceSettings.contentHiddenStateClass); // Set initial state as collapsed

            // Attach a delegated event handler for click events on these controls.
            // Using 'on' for better performance and future-proofing over 'click'.
            contentExpanders.on("click", function(eventObject) {
                eventObject.preventDefault(); // Prevent default link behavior (e.g., navigating to #)

                const clickedExpander = $(this);
                const targetContentElement = clickedExpander.next(); // Assumes content is the immediate sibling

                // --- Guard Clause: Validate existence of target content ---
                if (targetContentElement.length === 0) {
                    console.warn("Operation Aborted: No immediate sibling content found for collapsible control:", clickedExpander[0]);
                    return; // Exit if no content to toggle
                }

                // Log the interaction for debugging and monitoring purposes.
                console.groupCollapsed("Collapsible Control Interaction");
                console.debug("Control Element:", clickedExpander[0]);

                // Determine the current visual state of the content expander.
                const isCurrentlyExpanded = clickedExpander.hasClass(userInterfaceSettings.contentVisibleStateClass);
                console.debug("Current State (before action):", isCurrentlyExpanded ? "Expanded" : "Collapsed");

                // Execute the slide animation on the associated content.
                // The animation speed is configurable via userInterfaceSettings.
                targetContentElement.slideToggle(userInterfaceSettings.animationSpeed, function() {
                    // Optional callback: This function executes once the slide animation completes.
                    // Could be used for post-animation effects or state synchronization.
                    console.debug("Content slide animation completed.");
                });

                // Immediately update the visual state (classes) of the expander.
                // This reflects the intended state change, even if animation is ongoing.
                if (isCurrentlyExpanded) {
                    // Content was visible, now it's collapsing.
                    clickedExpander.removeClass(userInterfaceSettings.contentVisibleStateClass).addClass(userInterfaceSettings.contentHiddenStateClass);
                    console.info("Updated State: Section Collapsed.");
                } else {
                    // Content was hidden, now it's expanding.
                    clickedExpander.removeClass(userInterfaceSettings.contentHiddenStateClass).addClass(userInterfaceSettings.contentVisibleStateClass);
                    console.info("Updated State: Section Expanded.");
                }
                console.groupEnd(); // End of console group for this interaction
            });
            console.groupEnd(); // End of module initialization group
        } else {
            console.info("No elements matching collapsible control class found. Skipping content module initialization.");
        }


        // --- SECTION 2: External Link Behavior Configuration ---
        // Select all elements identified as external navigation links.
        const externalNavLinks = $(`.${userInterfaceSettings.externalLinkClass}`);

        // Configure only if there are external links present.
        if (externalNavLinks.length > 0) {
            console.groupCollapsed("External Links Module Initialization");
            console.info(`Found ${externalNavLinks.length} external navigation links.`);

            // Iterate over each external link to ensure it opens in a new tab/window.
            externalNavLinks.each(function() {
                const currentLink = $(this);

                // Add an intermediate check: only set target if it's not already correct.
                if (currentLink.attr("target") !== userInterfaceSettings.newWindowTarget) {
                    currentLink.attr("target", userInterfaceSettings.newWindowTarget);
                    console.debug("Configured external link to open in new tab:", currentLink[0]);
                } else {
                    console.debug("External link already correctly configured:", currentLink[0]);
                }
            });
            console.groupEnd(); // End of external links initialization group
        } else {
            console.info("No elements matching external link class found. Skipping external links module initialization.");
        }

    }); // End of jQuery DOM ready shorthand
})(jQuery); // End of IIFE, passing jQuery as $ for scope.