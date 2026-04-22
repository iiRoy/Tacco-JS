// This file contains the implementation for Fabtabs, a simple tab system.
// Original author: Andrew Tetlaw
// Version: 1.1
// Date: May 6, 2006
// License: Creative Commons Attribution-ShareAlike 2.5 (http://creativecommons.org/licenses/by-sa/2.5/)
// Project URL: http://tetlaw.id.au/view/blog/fabtabulous-simple-tabs-using-prototype/
// --------------------------------------------------------------------------------------------------
// This script enables easy creation of tabbed interfaces using the Prototype JavaScript framework.
// --------------------------------------------------------------------------------------------------

// Define the Fabtabs class. It leverages Prototype's Class.create method.
var     Fabtabs    =    Class.create ( ) ;


// Extend the prototype of Fabtabs to include all instance methods.
Fabtabs.prototype    =    {

    // The constructor method for the Fabtabs class.
    initialize  :    function ( element )   {

        // Store the main container element for the tabs.
        this.element    =    $ ( element ) ;

        // Process any optional arguments passed to the constructor.
        // This allows for future extensibility, though currently unused in this version.
        var   options   =   Object.extend ( { } ,   arguments [ 1 ]   ||   { } ) ;

        // Find all anchor (<a>) tags within the main element, which are considered the tab menu items.
        this.menu       =   $A ( this.element.getElementsByTagName ( 'a' ) ) ;

        // Determine and display the initial active tab.
        this.show ( this.getInitialTab ( ) ) ;

        // Iterate over each menu item to set up event listeners.
        // 'bind(this)' ensures the 'this' context is correctly maintained in setupTab.
        this.menu.each ( this.setupTab.bind ( this ) ) ;

    } , // End of initialize method


    // Sets up event handling for a single tab element.
    setupTab    :    function ( elm )    {

        // Attach a click event listener to the tab element.
        // 'bindAsEventListener(this)' ensures 'this' refers to the Fabtabs instance
        // and passes the event object as the first argument to 'activate'.
        Event.observe ( elm , 'click' , this.activate.bindAsEventListener ( this ) , false ) ;

    } , // End of setupTab method


    // Handles the activation of a tab when it is clicked.
    activate    :    function ( ev )   {

        // Find the actual <a> element that triggered the event,
        // in case the click was on a child element within the <a>.
        var   elm   =   Event.findElement ( ev ,   "a" ) ;

        // The original implementation had a commented-out line to stop the event.
        // It's not strictly necessary for this tab system to function.
        // Event.stop(ev);

        // Display the newly activated tab.
        this.show ( elm ) ;

        // Hide all other tabs in the menu.
        // 'without(elm)' creates a new array excluding the current tab.
        // 'each(this.hide.bind(this))' applies the hide method to each of them.
        this.menu.without ( elm ) .each ( this.hide.bind ( this ) ) ;

    } , // End of activate method


    // Hides a given tab and its corresponding content pane.
    hide    :    function ( elm )   {

        // Remove the 'active-tab' class from the tab link.
        $ ( elm ) .removeClassName ( 'active-tab' ) ;

        // Remove the 'active-tab-body' class from the tab's content div.
        $ ( this.tabID ( elm ) ) .removeClassName ( 'active-tab-body' ) ;

    } , // End of hide method


    // Displays a given tab and its corresponding content pane.
    show    :    function ( elm )   {

        // Add the 'active-tab' class to the tab link, styling it as active.
        $ ( elm ) .addClassName ( 'active-tab' ) ;

        // Add the 'active-tab-body' class to the tab's content div, making it visible.
        $ ( this.tabID ( elm ) ) .addClassName ( 'active-tab-body' ) ;

        // A blank line for visual separation within the method.

    } , // End of show method


    // Extracts the ID of the content panel associated with a tab.
    // This ID is expected to be found in the href attribute of the tab link,
    // following a hash symbol (e.g., href="#tabContentID").
    tabID    :    function ( elm )   {

        // Use a regular expression to capture the ID part after '#'.
        return   elm.href.match ( /#(\w.+)/ ) [ 1 ] ;

    } , // End of tabID method


    // Determines which tab should be active when the page first loads.
    // It checks the URL's hash for a tab ID; otherwise, defaults to the first tab.
    getInitialTab    :    function ( )   {

        // Check if the current URL contains a hash fragment.
        if ( document.location.href.match ( /#(\w.+)/ ) )   {

            // If a hash is found, store the matched ID.
            var   loc   =   RegExp.$1 ;

            // Try to find a tab in the menu whose content ID matches the URL hash.
            var   elm   =   this.menu.find ( function ( value )   {
                                              // This nested function checks if a tab's href matches the location hash.
                                              return   value.href.match ( /#(\w.+)/ ) [ 1 ]   ==   loc ;
                                            } ) ;
            // Return the found tab, or the first tab if no match is found.
            return   elm   ||   this.menu.first ( ) ;

        }   else   {

            // If no hash fragment is present in the URL, simply return the very first tab.
            return   this.menu.first ( ) ;

        } // End of if-else for URL hash check

    } // End of getInitialTab method

} ; // End of Fabtabs.prototype object literal


// This ensures that the Fabtabs initialization happens only after the entire page
// (including all images and assets) has fully loaded.
Event.observe ( window ,   'load' ,   function ( )   {
                                                   // Instantiate a new Fabtabs object, targeting the element with ID 'tabs'.
                                                   new   Fabtabs ( 'tabs' ) ;
                                                 } ,   false ) ;
// End of Fabtabs script.