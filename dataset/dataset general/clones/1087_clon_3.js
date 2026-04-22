jQuery(function($) {

    // --- Module 1: Dynamic Sub-Navigation Relocation ---
    // This section orchestrates the movement of nested menu items
    // from the primary navigation into a designated secondary area.

    // Define key selectors for clarity and potential reuse.
    const primaryNavigationSelector = "#mainNavContainer ul.main-menu li.parent-item ul.sub-menu";
    const auxiliaryPanelTargetSelector = "#secondaryMenuPlacement";

    // Attempt to locate any nested navigation structures within the main menu.
    const discoveredSubMenus = $(primaryNavigationSelector);

    // Proceed only if expandable menu items containing sub-menus are found.
    if (discoveredSubMenus.length > 0) {
        // Retrieve the raw HTML content of the first detected sub-menu.
        // We assume only one primary sub-menu block needs to be relocated.
        const extractedSubmenuMarkup = discoveredSubMenus.first().html();

        // If content was successfully extracted, process it.
        if (extractedSubmenuMarkup && extractedSubmenuMarkup.trim().length > 0) {
            console.log("Sub-menu content detected for relocation.");

            // Remove the original nested sub-menu from its initial position
            // to prevent duplication and ensure a clean move.
            discoveredSubMenus.remove();

            // Construct the new block of HTML for the secondary menu panel.
            // It's re-wrapped in a <ul> tag to maintain semantic structure.
            const formattedSubmenuBlock = `<ul class="relocated-sub-menu">${extractedSubmenuMarkup}</ul>`;

            // Identify the target container where the secondary menu should be placed.
            const targetAuxiliaryPanel = $(auxiliaryPanelTargetSelector);

            // Validate that the target container actually exists in the DOM.
            if (targetAuxiliaryPanel.length > 0) {
                // Insert the newly formatted sub-menu into the auxiliary panel.
                targetAuxiliaryPanel.html(formattedSubmenuBlock);
                console.log("Sub-menu successfully moved to auxiliary panel.");
            } else {
                console.warn(`Warning: Target container '${auxiliaryPanelTargetSelector}' not found. Sub-menu relocation failed.`);
            }
        } else {
            console.info("No substantial sub-menu content found to relocate.");
        }
    } else {
        console.info("No nested sub-menus detected within the primary navigation.");
    }

    // --- Module 2: Responsive Content Layout Adjustment ---
    // This module dynamically adjusts the main content area's width
    // based on the presence of content in the left and right sidebar regions.

    const mainContentWrapper = $("#pageContentWrapper");
    const primarySidebarElement = $("#primarySidebar");
    const secondarySidebarElement = $("#secondarySidebar");

    // Helper function to check if a jQuery element has meaningful text content.
    const hasMeaningfulContent = (element) => {
        // Return false if element does not exist or has no text.
        // Using $.trim to handle whitespace-only content as empty.
        return element.length > 0 && $.trim(element.text()).length > 0;
    };

    // Determine content presence in sidebars.
    const leftSidebarHasText = hasMeaningfulContent(primarySidebarElement);
    const rightSidebarHasText = hasMeaningfulContent(secondarySidebarElement);

    // Ensure the main content wrapper exists before attempting to modify its classes.
    if (mainContentWrapper.length > 0) {
        // First, remove any existing layout classes to ensure a clean state.
        mainContentWrapper.removeClass("full-width-layout dual-sidebar-layout single-sidebar-layout");

        // Apply layout based on sidebar content.
        if (!leftSidebarHasText && !rightSidebarHasText) {
            // Case 1: Both sidebars are empty. Main content takes full width.
            mainContentWrapper.addClass("full-width-layout");
            console.log("Layout: Full width (no sidebars).");
        } else if (leftSidebarHasText && rightSidebarHasText) {
            // Case 2: Both sidebars contain content. Main content is narrowed for two sidebars.
            mainContentWrapper.addClass("dual-sidebar-layout");
            console.log("Layout: Dual sidebar.");
        } else {
            // Case 3: Exactly one sidebar contains content (either left or right).
            // Main content is moderately wide for a single sidebar.
            mainContentWrapper.addClass("single-sidebar-layout");
            console.log("Layout: Single sidebar.");

            // Additionally, hide the empty sidebar if it exists.
            if (!leftSidebarHasText && primarySidebarElement.length > 0) {
                primarySidebarElement.addClass('hidden-sidebar');
                console.log("Left sidebar hidden due to lack of content.");
            }
            if (!rightSidebarHasText && secondarySidebarElement.length > 0) {
                secondarySidebarElement.addClass('hidden-sidebar');
                console.log("Right sidebar hidden due to lack of content.");
            }
        }
    } else {
        console.warn("Main content wrapper '#pageContentWrapper' not found. Layout adjustments skipped.");
    }

    // --- Module 3: Empty Heading Suppression ---
    // This segment identifies and conceals heading elements (h3)
    // that contain no visible text content after trimming whitespace.

    const minorHeadings = $("h3"); // Target all h3 elements on the page.
    let hiddenHeadingCount = 0; // Initialize a counter for hidden headings.

    // A utility function to determine if a string is effectively empty.
    // This handles null, undefined, and strings composed solely of whitespace.
    const isEmptyOrWhitespace = (str) => {
        return !str || $.trim(str).length === 0;
    };

    // Iterate over each identified heading element.
    minorHeadings.each(function(idx, element) {
        const currentHeading = $(element); // Wrap the native element in a jQuery object.
        const headingText = currentHeading.text(); // Get the text content.

        // If the heading's text content is empty or contains only whitespace, hide it.
        if (isEmptyOrWhitespace(headingText)) {
            currentHeading.addClass("visually-hidden"); // Use a more semantic class for hiding.
            hiddenHeadingCount++; // Increment the counter.
            console.debug(`Heading at index ${idx} found empty and hidden.`);
        }
    });

    // Provide a summary log if any headings were hidden.
    if (hiddenHeadingCount > 0) {
        console.info(`Operation complete: ${hiddenHeadingCount} empty headings were concealed.`);
    } else {
        console.info("No empty headings found requiring concealment.");
    }

});