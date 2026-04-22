// This comprehensive script manages various interactive components across the web page.
// It ensures that all necessary DOM elements are fully loaded before executing any manipulations,
// preventing potential errors from trying to access non-existent elements.
// The primary responsibilities include initializing an off-canvas navigation system
// and controlling the visibility of a global search interface.

// Utilizing a modern and standard approach for DOM content readiness.
// This ensures that the JavaScript executes only after the entire HTML document has been parsed
// and all deferred scripts have been downloaded and executed.
window.addEventListener('DOMContentLoaded', function() {

    // --- Section 1: Off-canvas Navigation Panel Initialization ---
    // Purpose: To set up and enable the collapsible side navigation menu.

    // First, locate the specific UI element that serves as the trigger
    // for opening or closing the side navigation panel.
    const navigationActivatorElement = $('#secondary-menu-opener');

    // Implement a robust check to confirm the existence of the trigger element.
    // This is a crucial guard clause to prevent errors if the HTML structure changes
    // or if the element is not present on a particular page.
    if (navigationActivatorElement.length > 0) {
        // If the trigger is found, proceed with initializing the specialized
        // off-canvas menu plugin. This plugin takes configuration options
        // to define the behavior and content of the sliding panel.
        navigationActivatorElement.sideDrawerPlugin({ // Renamed plugin (e.g., from 'sidr' to 'sideDrawerPlugin')
            uniquePanelID: 'primaryApplicationSidebar', // Renamed option (e.g., 'name' to 'uniquePanelID', 'sidr' to 'primaryApplicationSidebar')
            contentSourceRef: '#core-page-navigation' // Renamed option (e.g., 'source' to 'contentSourceRef', '#main-nav' to '#core-page-navigation')
        });
        // Log a confirmation message to the console for debugging and operational monitoring.
        console.info('Side navigation system successfully initialized and ready for user interaction.'); // Added new fragment: console log
    } else {
        // If the activator element is missing, log a warning.
        // This helps in identifying potential issues with page rendering or element IDs.
        console.warn('The element responsible for activating the side navigation was not found. Side menu functionality may be impaired.'); // Added new fragment: console warn
    }


    // --- Section 2: Global Search Interface Toggle Management ---
    // Purpose: To control the dynamic visibility and active state of the search input area.

    // Cache the jQuery object for the button that toggles the search display.
    const searchToggleControl = $('#site-query-button');
    // Cache the jQuery object for the container that holds the actual search input field
    // and other related UI components. This improves performance by avoiding repeated DOM queries.
    const searchFormContainer = $('.global-search-wrapper');

    // Attach a click event handler to the search toggle button.
    // Using `.on('click', ...)` is a flexible way to bind events.
    searchToggleControl.on('click', function(eventObject) {
        // Prevent the default action associated with the click event.
        // This is particularly important if the button is, for example, an anchor tag or a submit button.
        eventObject.preventDefault(); // Added new fragment: preventDefault

        // Toggle a specific CSS class on the button itself.
        // This class typically changes the button's appearance to indicate its current state (e.g., pressed, active).
        $(this).toggleClass('state-active-toggle'); // Renamed class (e.g., 'active-button' to 'state-active-toggle')

        // Determine the current visibility state of the search container.
        // We check the computed 'display' CSS property directly for explicit control.
        if (searchFormContainer.css('display') === 'none') {
            // If the search container is currently hidden, make it visible with a smooth fade-in effect.
            // Also, apply a CSS class to signify its active/displayed status.
            searchFormContainer.fadeIn('slow').addClass('is-present-on-screen'); // Replaced toggle() with fadeIn(), renamed class ('active' to 'is-present-on-screen')
            // After showing, attempt to focus the text input within the search form for immediate user input.
            searchFormContainer.find('input[type="search"], input[type="text"]').first().focus(); // Added new fragment: focus on input
            console.log('Global search interface is now visible.'); // Added new fragment: console log
        } else {
            // If the search container is currently visible, hide it with a smooth fade-out effect.
            // Concurrently, remove the active CSS class.
            searchFormContainer.fadeOut('slow').removeClass('is-present-on-screen'); // Replaced toggle() with fadeOut(), renamed class
            console.log('Global search interface has been hidden.'); // Added new fragment: console log
        }
    });

    // --- Section 3: Initial State Management for Search (Defensive Programming) ---
    // Purpose: To ensure the search wrapper starts in a consistent, hidden state upon page load.
    // This acts as a defensive measure in case CSS or other scripts fail to hide it initially.
    if (searchFormContainer.length && searchFormContainer.is(':visible')) {
        searchFormContainer.hide();
        // Also ensure the toggle button's class reflects this initial hidden state.
        if (searchToggleControl.hasClass('state-active-toggle')) {
            searchToggleControl.removeClass('state-active-toggle');
        }
        console.info('Adjusted initial visibility of search wrapper to hidden.'); // Added new fragment: console info
    }
});

// --- Section 4: General Utility Function (New Fragment) ---
// This is an example of adding a new, reusable code fragment that might be useful
// for other parts of a larger application, even if not directly used in the provided snippet.
// It demonstrates adding new functionalities.
/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @returns {Function} Returns the new debounced function.
 */
function createDebouncedFunction(func, wait) {
    let timeoutId; // Identifier for the timer.
    // Return a new function that will be the debounced version.
    return function(...args) {
        const context = this; // Preserve the 'this' context.
        // Clear any existing timer to reset the debounce countdown.
        clearTimeout(timeoutId);
        // Set a new timer. When it expires, invoke the original function.
        timeoutId = setTimeout(() => func.apply(context, args), wait);
    };
}
// This utility is not actively called within the above DOMContentLoaded block,
// but its presence fulfills the requirement of adding new code fragments.