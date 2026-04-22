/*
 * Module: Dynamic Interface Navigator
 * Version: 2.1.0
 * Author: CodeGenius AI
 * License: Apache 2.0 - See project repository for details.
 * Date: 2023-10-27
 * Purpose: Manages interactive tabbed content areas within a web page.
 * Enhancements: Improved selector robustness, explicit panel targeting via data attributes,
 *               additional validation checks, and refined state management.
 */

jQuery(document).ready(function($) {

    // Define a constant for the active class name to avoid magic strings.
    const CURRENT_STATE_CLASS = 'is-active';
    // Selector for the primary tab group container elements.
    const TAB_GROUP_SELECTOR = 'ul.navigation-tabs';
    // Selector for individual tab trigger links within a group.
    const TAB_TRIGGER_SELECTOR = '> li > a.tab-trigger';
    // Attribute name used to store the ID of the target content panel.
    const TARGET_PANEL_DATA_ATTRIBUTE = 'data-target-panel-id';
    // Selector for the common parent of all content panels related to a tab set.
    // This assumes content panels are direct children of a common wrapper.
    const CONTENT_WRAPPER_SELECTOR = '.content-display-area';
    // Selector for individual content panels.
    const CONTENT_PANEL_SELECTOR = '.content-panel';

    /**
     * Initializes the dynamic tab navigation system.
     * Iterates through all identified tab groups and attaches click handlers.
     */
    function initializeTabNavigation() {
        // Locate all containers designated as tab navigation groups.
        var navGroups = $(TAB_GROUP_SELECTOR);

        if (navGroups.length === 0) {
            // No tab groups found, so no initialization is needed.
            return;
        }

        // Process each navigation group discovered on the page.
        navGroups.each(function(groupIndex, groupElement) {
            var currentNavGroup = $(groupElement);
            // Find all actionable tab links within this specific navigation group.
            var triggerElements = currentNavGroup.find(TAB_TRIGGER_SELECTOR);

            if (triggerElements.length === 0) {
                // Skip if a group has no actual tab triggers.
                return true; // Continue to the next group in .each()
            }

            // Attach a unified click event handler to each tab trigger.
            triggerElements.on('click', function(interactionEvent) {
                var clickedTrigger = $(this); // Reference to the element that was clicked.

                // Retrieve the identifier for the content panel associated with this tab.
                var panelIdToActivate = clickedTrigger.attr(TARGET_PANEL_DATA_ATTRIBUTE);

                // --- Input Validation and Guard Clauses ---
                if (!panelIdToActivate || panelIdToActivate.trim() === '' || panelIdToActivate.charAt(0) !== '#') {
                    console.warn('Tab trigger missing or invalid target panel ID:', clickedTrigger[0]);
                    return; // Abort if target is not correctly defined.
                }

                // Prevent the default browser action for the anchor tag (e.g., page jump).
                interactionEvent.preventDefault();

                var targetPanelElement = $(panelIdToActivate);

                if (!targetPanelElement.length) {
                    console.error('Target content panel not found for ID:', panelIdToActivate, 'Trigger:', clickedTrigger[0]);
                    return; // Abort if the target panel does not exist.
                }

                // --- Tab State Management ---
                // Deactivate the currently active tab within this group.
                currentNavGroup.find('.' + CURRENT_STATE_CLASS).removeClass(CURRENT_STATE_CLASS);
                // Activate the clicked tab trigger.
                clickedTrigger.addClass(CURRENT_STATE_CLASS);

                // --- Content Panel State Management ---
                // Find the common parent of content panels. This assumes a consistent DOM structure.
                var commonContentParent = targetPanelElement.closest(CONTENT_WRAPPER_SELECTOR);

                if (!commonContentParent.length) {
                    // Fallback: If no common wrapper, assume all content panels are siblings of the target.
                    commonContentParent = targetPanelElement.parent();
                }

                // Hide all content panels within the identified common parent and remove active state.
                commonContentParent.find(CONTENT_PANEL_SELECTOR).each(function() {
                    $(this).hide().removeClass(CURRENT_STATE_CLASS);
                });

                // Display the selected content panel and mark it as active.
                targetPanelElement.show().addClass(CURRENT_STATE_CLASS);

                // Optional: Log successful activation for debugging.
                console.log(`Activated panel: ${panelIdToActivate} via trigger: ${clickedTrigger.text()}`);
            }); // End of click handler

            // Optionally, activate the first tab by default if no tab is initially active.
            // This is a common UI pattern.
            if (currentNavGroup.find(TAB_TRIGGER_SELECTOR + '.' + CURRENT_STATE_CLASS).length === 0) {
                currentNavGroup.find(TAB_TRIGGER_SELECTOR).first().trigger('click');
            }
        }); // End of navGroups.each()
    }

    // Execute the initialization function once the DOM is fully loaded.
    initializeTabNavigation();

}); // End of jQuery document ready block