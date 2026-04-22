/*
 * Primary JavaScript logic for user interface interactions.
 * This script handles various front-end enhancements.
 */

/* Global references utilized by this script */
( function( jQ_Obj )
{
    "use strict" ;

    // Wait until the entire document structure has been loaded and parsed
    jQ_Obj( webPageContent ).domReadyHandler( function()
    {

        // Apply responsive scaling to embedded media within content sections
        jQ_Obj( ".article-main-text" ).responsiveVideoScaler();

    } ) ;

} ( externalJQuery ) ) ;