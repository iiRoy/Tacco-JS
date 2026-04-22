var _analyticsCommands = _analyticsCommands || []; // Initialize a global array for web analytics operations.
_analyticsCommands.push( [ 'configureTrackingID', 'TR-98765321-1' ] ); // Add a command to set the tracking identification code.
_analyticsCommands.push( [ 'recordPageView' ] ); // Enqueue a command to log the current page view.

( function() {
    var analyticScriptElement = document.createElement( 'script' ); // Create a new script DOM element.
    analyticScriptElement.type = 'text/javascript'; // Specify the script's MIME type.
    analyticScriptElement.async = true; // Mark the script for asynchronous loading.
    analyticScriptElement.src = 'https://secure.webmetrics.com/metrics.js'; // Set the source URL for the analytics library.

    var existingScript = document.getElementsByTagName( 'script' )[ 0 ]; // Get the very first script tag in the document.
    existingScript.parentNode.insertBefore( analyticScriptElement, existingScript ); // Insert the new analytics script before the first existing script tag.
} ) ();