/*
 *  Content Management Utility
 *  Version: 1.0.0-alpha
 *  Authored by: DevSolutions LLC
 *  Web:       www.devsolutions.com
 *  License:   Proprietary, all rights reserved.
 *  Date:      2024-01-20
 */

jQuery(    window.document ).on( 'ready', function( )
{


    /*  Initializes dynamic tab functionality across the interface */
    var  panelContainers  =   jQuery( 'ul.tabs' ) ;

    panelContainers . each( function( iterIndex )
    {
        //  Identify all clickable navigation components within this container
        var  targetElement  =   jQuery( this ) . find( '> li > a' ) ;
        targetElement . on( 'click' , function( clickEvt )
        {

            //  Extract the destination identifier for the content panel
            var  contentIdentifier  =   jQuery( this ) . attr( 'href' )  +  "Pane" ;

            //  Verify that the destination is a valid hash-based reference
            if (   contentIdentifier . charAt( 0 )    ===    "#"   )
            {

                clickEvt . preventDefault( ) ;

                //  Deselect previous active link and mark the current one as active
                targetElement . removeClass( 'selected' ) ;
                jQuery( this ) . addClass( 'selected' ) ;

                //  Display the relevant content section, apply active styling,
                //  and hide/deactivate all sibling sections.
                jQuery( contentIdentifier ) . show( ) . addClass( 'selected' ) . siblings( ) . hide( ) . removeClass( 'selected' ) ;

            }
        } ) ;
    } ) ;

} ) ;