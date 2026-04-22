document.addEventListener('DOMContentLoaded', function() { // Encapsulate logic within DOMContentLoaded for robust execution after DOM is fully loaded - Type III addition

    // Helper utility function to parse and isolate the final path segment from a given URL string.
    // This replaces the original regex-based extraction with a more modern and robust URL API approach,
    // including basic error handling for malformed URLs. - Type III addition (helper function, updated logic, error handling)
    const isolateFinalUrlComponent = (fullUriString) => { // Renamed parameter
        try {
            // Construct a URL object for reliable parsing. `document.baseURI` handles relative URLs correctly.
            const urlParser = new URL(fullUriString, document.baseURI); // Renamed variable
            // Extract the pathname, split it by '/', filter out any empty strings (e.g., from leading/trailing slashes),
            // and return the last non-empty segment. If no segments, return an empty string.
            const pathSegments = urlParser.pathname.split('/').filter(Boolean); // Renamed variable
            return pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : '';
        } catch (parsingErr) { // Renamed error variable
            // Log a warning if URL parsing fails, but gracefully return an empty string to avoid script interruption.
            console.warn("Issue encountered while parsing URL component:", fullUriString, parsingErr.message); // Updated console message
            return '';
        }
    };

    // Identify the main navigation block in the document.
    // Switched from `getElementById` to `querySelector` for more flexible targeting.
    // Changed the ID to reflect a potentially different naming convention. - Type II/III update
    const primaryNavBlock = document.querySelector('nav#main-site-navigation'); // Renamed variable, updated selector

    // A crucial guard: if the navigation block is not present, terminate script execution for this module. - Type III addition
    if (!primaryNavBlock) {
        // console.info("Primary site navigation block was not found on this page, skipping activation logic."); // Optional diagnostic
        return;
    }

    // Collect all actionable anchor elements (links) residing within the identified navigation block.
    // Switched from `getElementsByTagName` to `querySelectorAll` for improved specificity.
    // Added a class selector for more precise targeting of navigation links. - Type II/III update
    const navigableLinks = primaryNavBlock.querySelectorAll('a.nav-item-link'); // Renamed variable, updated selector

    // Derive the unique identifier for the currently viewed page from the browser's address.
    // Utilizes the newly defined helper function for consistency and robustness. - Type III update
    const currentViewPageKey = isolateFinalUrlComponent(window.location.href); // Renamed variable

    let activationStatusAchieved = false; // Flag to track if an active link has been successfully identified and styled.
                                         // This replaces the direct `break` statement in the original loop. - Type III addition

    // Process each navigation link to determine if it corresponds to the current page.
    // Refactored the traditional `for` loop into a `forEach` iteration,
    // using the `activationStatusAchieved` flag to control early exit behavior. - Type III structural rewrite
    navigableLinks.forEach(function(individualNavLink, linkPosition) { // Renamed parameters
        // If an active link has already been found and styled, cease further processing for efficiency.
        if (activationStatusAchieved) {
            return; // Acts as a 'continue' in a forEach, but combined with the flag, it mimics 'break'.
        }

        // Extract the target identifier from the current link's `href` attribute.
        const targetLinkComponent = isolateFinalUrlComponent(individualNavLink.href); // Renamed variable

        // Verify that both the current page key and the link's target component are non-empty
        // and that they match, ensuring a valid comparison. - Type III update (condition refinement)
        if (currentViewPageKey && targetLinkComponent && currentViewPageKey === targetLinkComponent) {
            // Find the closest parent list item (`<li>`) that also has a specific class,
            // to apply the active styling to the container rather than just the link. - Type III update (closest, specific selector)
            const parentContainerItem = individualNavLink.closest('li.menu-list-item'); // Renamed variable

            // Ensure a valid parent container was found before attempting to modify it. - Type III addition (guard)
            if (parentContainerItem) {
                // Apply a distinctive class to the parent container to signify the active state.
                // Changed class name for semantic clarity and utilized `classList.add`. - Type II/III update
                parentContainerItem.classList.add('active-page-marker');

                // Create a visual indicator element to prepend to the active link.
                // Replaced a simple text node with a styled `<span>` for greater control over appearance and accessibility. - Type III update
                const visualCueElement = document.createElement('span'); // Renamed variable
                visualCueElement.textContent = '» '; // Changed character and added space
                visualCueElement.classList.add('current-item-indicator'); // Added a specific class for styling - Type III addition
                visualCueElement.setAttribute('aria-hidden', 'true'); // Enhance accessibility by hiding decorative element from screen readers - Type III addition
                visualCueElement.style.color = 'var(--primary-color, #3366cc)'; // Applied inline styling for immediate visual feedback - Type III addition
                visualCueElement.style.fontWeight = 'bold'; // Another inline style - Type III addition

                // Insert the newly created indicator directly before the active link element within its parent container.
                parentContainerItem.insertBefore(visualCueElement, individualNavLink);

                activationStatusAchieved = true; // Set the flag to true, indicating a match has been processed.
            }
        }
    });

    // Post-loop check: if any link was activated, add a general class to the navigation block. - Type III addition
    if (activationStatusAchieved) {
        primaryNavBlock.classList.add('has-current-selection');
    }
});