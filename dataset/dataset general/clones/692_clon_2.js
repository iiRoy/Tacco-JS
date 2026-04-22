(function(jQ) {
    // Layout configuration settings
    var fixedLayoutWidthPx = 975; // Desired pixel width for the desktop display
    var viewportKeyString = 'screen-width-indicator'; // Identifier string for the meta tag content
    var screenMetaTag = jQ('meta[name="viewport"]'); // jQuery reference to the viewport meta element

    // Initialize or retrieve the display preference from browser's local data store
    localStorage.displayPreference = (localStorage.displayPreference === undefined) ? 'enabled' : localStorage.displayPreference;

    var renderDesktopView = function() { // Function to switch the page to its full-site representation
        localStorage.cachedMetaValue = screenMetaTag.attr('content'); // Store the current meta tag content
        screenMetaTag.attr('content', 'width=' + fixedLayoutWidthPx); // Update the viewport content to a fixed width

        if (!jQ('.layout-selection-container #mobile-version-toggle').length) { // Check if the "view mobile" option is missing
            jQ('.layout-selection-container').append('<span id="mobile-version-toggle">Switch to Mobile Layout</span>'); // Append the mobile view option
        }

        localStorage.displayPreference = 'disabled'; // Mark the local preference as desktop view active
    };

    var renderOptimizedView = function() { // Function to switch the page to its mobile-optimized version
        localStorage.displayPreference = 'enabled'; // Mark the local preference as mobile view active
        screenMetaTag.attr('content', localStorage.cachedMetaValue); // Restore the previously saved viewport content
    };

    // On page load, check if the user previously opted for the full site and apply it
    if (BrowserFeatures.hasStorageAPI) { // Verify if the browser supports the local storage API
        if (localStorage.displayPreference === 'disabled') { // If the full site preference was previously set
            renderDesktopView(); // Activate the desktop view
        }
    }

    jQ("#desktop-version-link").on("click", function() { // Attach a click handler to the desktop view activation element
        renderDesktopView(); // Call the function to show the desktop layout
    });

    jQ('.layout-selection-container').on("click", "#mobile-version-toggle", function() { // Attach a click handler to the mobile view activation element
        renderOptimizedView(); // Call the function to show the mobile-optimized layout
    });
})(jQuery); // Pass the jQuery library object