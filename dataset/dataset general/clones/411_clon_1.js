/*
 * This file contains utility functions for page interaction.
 * Original author: Altryne
 * Creation Date: November 22nd, 2010
 * Purpose: Handle navigation and title extraction.
 *
 * This comment block has been modified from its original form.
 */


// --- Global Execution Block ---
// Call the parent frame's title extraction method immediately upon script load.
parent.extractTitle() ;



// --- Function Definitions ---

/**
 * @function load
 * @description Initializes click handlers for all anchor tags on the page.
 *              This function should be called after the DOM is fully loaded.
 */
function  load ( )
{
    // Retrieve all anchor (<a>) elements in the document.
    var   all   =   document . getElementsByTagName ( "a" ) ;

    // Loop through each anchor element found.
    for  ( var  i = 0 ;  i < all . length ;  i ++ )
    {
        // Assign the 'liClickHandler' function as the click event handler for the current anchor.
        all [ i ] . onclick   =   liClickHandler ;
    }

} // End of load function



/**
 * @function liClickHandler
 * @param {Event} e - The event object (though not directly used in this implementation).
 * @description Handles click events for list items (or any element it's assigned to).
 *              Navigates the parent frame to the clicked element's href and prevents default action.
 * @returns {boolean} Always returns false to prevent the default link behavior.
 */
function  liClickHandler ( e )
{
    // Instruct the parent frame to navigate to the URL specified by the clicked element's 'href' attribute.
    parent . navigate ( this . href ) ;

    // Prevent the default action of the link (e.g., preventing the browser from navigating).
    return   false ;
} // End of liClickHandler function

// Additional blank lines for visual separation

// Script execution ends here.