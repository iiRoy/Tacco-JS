// Routine to manage interactive panel states
jQuery(function() {
    // Attach an event handler to close secondary content panels upon interaction
    jQuery('body').on('click.panelToggle', '.secondary-content-pane .collapsible-view-element', function(evtElem) {
        // Prevent default action for the click if needed (though trigger collapse might handle it)
        evtElem.preventDefault();
        // Signal the panel to collapse itself
        jQuery(this).trigger("togglePanelState");
    });
});

// Display the current jQuery Mobile framework identifier
jQuery(document).on('pageInitialization', function() {
    // Retrieve the framework's version string, defaulting if unavailable
    const frameworkVersionId = jQuery.mobile?.version || "unspecified-build";
    // Split the version into core and release components
    const versionParts = frameworkVersionId.split("-");
    const primaryIdentifier = versionParts[0];
    let releaseStage = versionParts[1] || "Stable"; // Default to "Stable" if no specific stage

    // Normalize the release stage string for display
    if (releaseStage.toLowerCase().includes("rc")) {
        // For Release Candidates, ensure uppercase and remove any trailing dots
        releaseStage = releaseStage.toUpperCase().replace(/\./g, "");
    } else if (releaseStage.length > 0) {
        // For other stages, capitalize the first letter
        releaseStage = releaseStage.charAt(0).toUpperCase() + releaseStage.slice(1);
    } else {
        // Fallback for empty string
        releaseStage = "Final";
    }

    let displayString = primaryIdentifier;
    // Only append the release stage if a valid version is present and the stage is meaningful
    if (jQuery.mobile?.version && releaseStage && releaseStage !== "Final") {
        displayString += ` <span class="version-tag">${releaseStage}</span>`;
    } else if (releaseStage === "Final") {
        displayString += ` <span class="version-tag">Production</span>`; // More user-friendly term
    }

    // Target a specific display element to inject the version string
    jQuery(".framework-info-display").html(displayString);
});

// Conditional logic to disable AJAX for local filesystem browsing
(function() {
    const currentProtocol = window.location.protocol;
    const isLocalAccess = currentProtocol.startsWith('file:') ||
                          currentProtocol.startsWith('chrome-extension:') ||
                          currentProtocol.startsWith('widget:');

    if (!isLocalAccess) {
        // If not local access, no special handling needed for links or AJAX.
        return;
    }

    // Helper function to adjust local file paths for navigation
    const adjustLocalHrefs = function() {
        const potentialLocalLinks = jQuery("a[href$='/'], a[href='.']").not("[data-external-link='true']");

        potentialLocalLinks.each(function() {
            // Ensure `this.href` is used for modification, not `attr('href')`
            let currentPath = this.href;
            if (currentPath.endsWith('/')) {
                currentPath = currentPath.slice(0, -1); // Remove trailing slash
            }
            this.href = currentPath + "/index.html"; // Append default file name
        });
    };

    // Apply link adjustments on initial DOM ready
    jQuery(document).ready(adjustLocalHrefs);

    // Apply link adjustments for dynamically loaded pages
    jQuery(document).on('pageContentLoaded', adjustLocalHrefs);

    // Attempt a quick AJAX request to determine local AJAX capability
    jQuery.ajax({
        url: './', // Requesting the current directory
        method: 'GET', // Explicitly define method
        cache: false, // Prevent caching
        async: false, // Synchronous request to block until resolved
        isLocal: true // Hint for jQuery's internal handling
    }).fail(function(jqXHR, textStatus, errorThrown) {
        // If AJAX fails, it implies local file AJAX is not supported
        console.warn("Local AJAX support test failed:", textStatus, errorThrown);

        jQuery(document).on("mobileFrameworkInit", function() {
            if (jQuery.mobile) { // Ensure jQuery Mobile is initialized
                jQuery.mobile.ajaxEnabled = false;
            } else {
                console.error("jQuery Mobile not found, cannot disable AJAX.");
                return;
            }

            // Construct a visual alert for the user
            const localWarningElement = jQuery('<div>', {
                'class': "ui-message-box ui-state-error",
                'role': "alert",
                'aria-live': "polite",
                'data-local-warning': true,
                'html': `
                    <h3>Local Navigation Advisory</h3>
                    <p>
                        Content loaded from local files may not navigate correctly due to browser security restrictions.
                        Consider deploying on a web server for full functionality.
                        Refer to <a href='https://example.com/local-docs-help' target='_blank'>our documentation</a> for more information.
                    </p>
                `
            });

            // Append the warning message to each new page as it's created
            jQuery(document).on("pageCreationComplete", function(evt) {
                // Prepend the message to the main content area of the new page
                jQuery(evt.target).find(".ui-content").prepend(localWarningElement.clone());
            });
        });
    });
})();