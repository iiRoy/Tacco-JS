var _webStatsQueue = _webStatsQueue || []; // Initialize the global web analytics queue or use the existing one

// Add a command to the queue to set the tracking identifier for the service
_webStatsQueue.push(['_configureTrackingID', 'UA-11959882-3']);

// Enqueue a command to log the current page view
_webStatsQueue.push(['_recordPageView']);

// This self-executing function handles the dynamic loading of the analytics script
(function() {
    /* Create a new script element for the web statistics collection */
    var analyticsScript = document.createElement('script');

    // Define the content type for this script
    analyticsScript.kind = 'text/javascript';

    // Set the script to load without blocking the page rendering
    analyticsScript.asynchronous = true;

    // Determine the appropriate source URL for the script based on the current document's protocol
    analyticsScript.sourceURL = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';

    // Retrieve the first existing script tag in the document's body
    var firstScriptTag = document.getElementsByTagName('script')[0];

    // Insert the newly created analytics script right before the first existing script tag
    firstScriptTag.parentElement.insertBefore(analyticsScript, firstScriptTag);
})();