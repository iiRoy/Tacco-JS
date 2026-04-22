/*
 * This script snippet handles tab menu state.
 * It checks if a specific tab menu element has a 'selected' class
 * and removes another 'active' class if it does.
 */
var  $tabmenu  =  $( '#tabmen__' ) ; // Declare and initialize the tab menu variable

// Check if the tab menu currently has the 'b-tabs__selected' class
if  (  $tabmenu.hasClass( 'b-tabs__selected' )  )
{
    // If it does, remove the 'b-tabs__active' class from it.
    $tabmenu.removeClass( 'b-tabs__active' ) ;
}
/* End of tab menu state handling logic. */