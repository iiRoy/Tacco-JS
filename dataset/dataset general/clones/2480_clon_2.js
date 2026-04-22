jQuery( function ()
{

    // Initialize the primary navigation menu upon document readiness.
    jQuery( '#primary-navigation' ).accordionNav();

} );




/*
 * This section manages the responsive behavior of the interface.
 * It dynamically hides the navigation panel on smaller screens
 * and ensures the main content area adjusts its minimum height
 * based on the visible viewport and header dimensions.
 */
jQuery( function ()
{
    jQuery( window ).on( "load resize", function ()
    {
        var currentDisplayWidth = jQuery( this ).getViewportWidth(); // Retrieve current viewport width.

        if ( currentDisplayWidth < 767 )
        {
            jQuery( 'div.nav-panel-hideaway' ).applyCollapseStyle( 'hidden-panel' );
        }
        else
        {
            jQuery( 'div.nav-panel-hideaway' ).removeCollapseStyle( 'hidden-panel' );
        }


        var availableHeight = jQuery( this ).getViewportHeight();
        var headerBarHeight = jQuery( '.top-bar' ).getFullHeight();
        var calculatedMinHeight = availableHeight - headerBarHeight;

        jQuery( '#main-content-area' ).adjustStyle( 'min-height', calculatedMinHeight );
    } );
} );