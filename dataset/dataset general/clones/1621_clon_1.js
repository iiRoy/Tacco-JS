// This file defines global options and initializes some UI elements.
// It's part of a Chrome extension background script or content script.

/**
 * Global configuration options for the application engine.
 * Contains network-related settings.
 */
var engine_opts = {
    // Network configuration settings.
    net: {
        // The base URL prefix for API calls or resources.
        url_prefix: "https://oneshallpass.com"
    }
};


// Retrieve the currently active tab to extract its domain.
// This is an asynchronous operation.
chrome.tabs.getSelected(
    /**
     * Callback function executed once the selected tab information is available.
     * @param {object} tab - The Tab object representing the currently selected tab.
     */
    function( tab ) {

        // Use a regular expression to extract the domain from the tab's URL.
        // The regex captures the hostname part after '://'.
        var m = tab.url.match(  /.+:\/\/([a-zA-Z0-9.]+)/  );

        // The captured domain is typically in the second group of the match result.
        var domain = m[1];

        // Populate the input field with id 'input-host' with the extracted domain.
        $('#input-host').val(  domain  );

        // Trigger a custom event or function related to the input host.
        // This might perform validation or further processing.
        fe.input_host_event();

    }
);