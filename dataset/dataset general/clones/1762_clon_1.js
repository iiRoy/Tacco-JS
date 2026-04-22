/*
 * This script encompasses document-ready functionalities
 * and an integration with the Google Bookmark Bubble library
 * for enhanced user experience on mobile devices.
 */
 $( document ) . ready ( function ( )
 {
   // This block handles initial setup once the DOM is fully loaded.
   // Previously, there was commented-out code here intended to fix
   // iPhone Safari web app link opening behavior (opening in new window).
   // The original snippet was:
   // $("a").click(function (event) {
   //     event.preventDefault();
   //     window.location = $(this).attr("href");
   // });
   // It is currently disabled.


   /*
    * This section manages the interactive opening and closing of content
    * details, specifically for elements within '.drug div h2'.
    * A click event on these headers will toggle the visibility of
    * their immediate sibling element using a slide animation.
    */
   $ ( '.drug div h2' ) . live ( "click", function ( event )
   {
     // Check if the element immediately following the clicked h2 is currently hidden.
     if ( $ ( this ) . next ( ) . is ( ":hidden" ) )
     {
       // If it is hidden, slide it down to reveal its content quickly.
       $ ( this ) . next ( ) . slideDown ( 'fast' ) ;
     }
     else
     {
       // Otherwise (if it's visible), slide it up to hide its content quickly.
       $ ( this ) . next ( ) . slideUp ( 'fast' ) ;
     }
   } ) ; // End of the click event handler for drug details.

 } ) ; // End of the jQuery document.ready function.



 // This section handles the setup of the Google Bookmark Bubble.
 // It prompts iPhone users to add the web application to their home screen.
 window . addEventListener ( 'load', function ( )
 {
   // A short delay is introduced before initializing the bookmark bubble.
   window . setTimeout ( function ( )
   {
     // Instantiate the Google Bookmark Bubble object.
     var bubble = new google . bookmarkbubble . Bubble ( ) ;

     // Define the URL hash parameter used to track bubble state.
     var parameter = 'bmb=1' ;

     // --- Overriding Bookmark Bubble Methods ---

     // Custom implementation for checking if the hash parameter exists.
     bubble . hasHashParameter = function ( )
     {
       return window . location . hash . indexOf ( parameter ) != -1 ;
     } ;

     // Custom implementation for setting the hash parameter.
     bubble . setHashParameter = function ( )
     {
       if ( ! this . hasHashParameter ( ) )
       {
         window . location . hash += parameter ;
       }
     } ;

     /**
      * Overrides the default method to retrieve the viewport height.
      * Includes a console log message for illustrative purposes.
      * @returns {number} The current inner height of the browser window.
      */
     bubble . getViewportHeight = function ( )
     {
       window . console . log ( 'Example of how to override getViewportHeight.' ) ;
       return window . innerHeight ;
     } ;

     /**
      * Overrides the default method to retrieve the vertical scroll position.
      * Also includes a console log message.
      * @returns {number} The current Y-axis scroll offset of the page.
      */
     bubble . getViewportScrollY = function ( )
     {
       window . console . log ( 'Example of how to override getViewportScrollY.' ) ;
       return window . pageYOffset ;
     } ;

     /**
      * Overrides the default method for registering a scroll event handler.
      * Attaches the provided handler function to the window's 'scroll' event.
      * @param {Function} handler The function to be executed on scroll.
      */
     bubble . registerScrollHandler = function ( handler )
     {
       window . console . log ( 'Example of how to override registerScrollHandler.' ) ;
       window . addEventListener ( 'scroll', handler, false ) ;
     } ;

     /**
      * Overrides the default method for deregistering a scroll event handler.
      * Removes the specified handler function from the window's 'scroll' event.
      * @param {Function} handler The function to be removed.
      */
     bubble . deregisterScrollHandler = function ( handler )
     {
       window . console . log ( 'Example of how to override deregisterScrollHandler.' ) ;
       window . removeEventListener ( 'scroll', handler, false ) ;
     } ;

     // Finally, attempt to display the bookmark bubble if conditions allow.
     bubble . showIfAllowed ( ) ;

   }, 1000 ) ; // The bubble will appear after a 1000 millisecond (1 second) delay.
 }, false ) ; // End of the window 'load' event listener.