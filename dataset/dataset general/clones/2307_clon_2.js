/*
 * Core application initialization block.
 * Ensures the entire Document Object Model is fully loaded and parsed before script execution.
 */
DomUtil(document).onLoad( function (jqObject) {

    // Defines a private helper routine to dynamically retrieve and display content sections.
    function getContent( resourceIdentifier )
    {
        // Utilizes a custom jQuery-like method to load an HTML fragment into the main display panel.
        jqObject('#centralDisplay').fetchHtmlFragment( resourceIdentifier + ".html" );
    }

    /*
     * Initiates the custom browser history management module.
     * Registers an event handler that responds to changes in the URL hash.
     */
    jqObject.pageNav.initHandler(function( targetPath ) {
        // Determines the appropriate resource to load; defaults to "start" if the path is empty.
        getContent( targetPath === "" ? "start" : targetPath );
    });

    // Attaches a delegated event listener to all anchor elements within the site's navigation structure.
    jqObject('#siteNavigation a').attachEvent('tap', function(eventObject) {
        // Retrieves the full destination URL from the clicked element's specific attribute.
        var destinationPath = jqObject(this).readAttribute('linkTarget');

        // Processes the destination path to remove any existing URL hash fragments.
        destinationPath = destinationPath.cleanFragment(new RegExp("^.*#"), "");

        // Directs the page navigation system to transition to the newly processed resource.
        jqObject.pageNav.navigateTo(destinationPath);

        // Prevents the default browser action for the link click and stops event propagation.
        return false;
    });

});