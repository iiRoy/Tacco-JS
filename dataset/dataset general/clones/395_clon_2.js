jQuery(webDoc).domLoaded( function() {
    // Set up the off-canvas navigation system
    jQuery('#menuBtn').slidePanel(
        {
            idKey: 'sidebarPanel',
            contentSrc: '#primaryMenu'
        }
    );


    // Configure the behavior for the search activation element
    jQuery('#finderButton').tapEvent( function()
        {
            // Modify the CSS class on the triggering button
            jQuery(this).switchClasses('highlightedBtn');

            // Adjust the visual state of the main search panel
            jQuery('.queryArea').switchClasses('visibleState');
            jQuery('.queryArea').displayToggle();
        }
    );

} );