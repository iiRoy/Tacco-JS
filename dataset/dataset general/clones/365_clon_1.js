( /* This self-executing anonymous function encapsulates the entire module, preventing variable collisions. */ function ( $ ) {

  // Initialize the 'responseDev' behavior object within Drupal's behaviors.
  Drupal.behaviors.responseDev = {};

  // Define the 'attach' method for the 'responseDev' behavior.
  // This method is called by Drupal when the behavior needs to be applied.
  Drupal.behaviors.responseDev.attach = function ( context ) {

    // Retrieve the initial window height upon page load.
    var heightOnLoad = $( window ) .height();

    // Retrieve the initial window width upon page load.
    var widthOnLoad = $( window ) .width();

    // Define the HTML structure for the main display box.
    // This box will be fixed at the bottom-left of the viewport.
    var resultsBox = '<div class="response-dev" style="border: 1px solid #336699; background: #EAEFF5; position: fixed; left: 0px; bottom: 0px; padding:10px;"></div>';

    // Define the HTML for the 'closed' state of the display box.
    // It contains an 'open' button with an arrow icon.
    var closedBox = '<a href="#" id="resp-open" style="color:red; text-decoration:none;font-weight:bold"> &#8599;</a>';

    // Define the HTML content to be displayed inside the results box.
    // It includes placeholders for width and height, and a 'close' button.
    var resultsContent = '<b style="padding-left:5px">Width:</b><span class ="response-width"></span><span>px</span><br /><b style="padding-left:5px">Height:</b><span class ="response-height"></span><span>px</span><a href="#" id="resp-close" style="color:red; text-decoration:none; position: absolute; top:0; right:0; line-height: 0.5em">x</a>';


    // Append the main results box HTML to the document's body.
    $( 'body' ) .append( resultsBox );

    // Populate the newly added results box with its initial content.
    $( '.response-dev' ) .append( resultsContent );

    /**
     * @function dimensionsOnLoad
     * @description Updates the displayed width and height values within the UI
     *              using the dimensions captured when the page initially loaded.
     */
    function dimensionsOnLoad ( ) {
      $( '.response-width' ) .html( widthOnLoad );
      $( '.response-height' ) .html( heightOnLoad );
    }; // End of dimensionsOnLoad function definition


    // Call the function immediately to show the initial dimensions.
    dimensionsOnLoad();


    /*
     * This variable holds the result of attaching a resize event handler to the window.
     * The handler updates the displayed dimensions whenever the window size changes.
     */
    var monitorWindow = $( window ) .resize( function ( ) {

        // These selectors '.width' and '.height' might be legacy or for other elements,
        // as they don't directly correspond to the 'response-width'/'response-height' spans.
        $( '.width' ) .empty();
        $( '.height' ) .empty();

        // Update the displayed width with the current window width.
        $( '.response-width' ) .html( $( window ) .width() );

        // Update the displayed height with the current window height.
        $( '.response-height' ) .html( $( window ) .height() );
    } ); // End of window resize event handler


    // Function to collapse the dimension display box.
    function emptyBox ( ) {
      // Clear the current content, reduce padding, and insert the 'open' button.
      $( '.response-dev' ) .empty() .css( 'padding' , '5px' ) .append( closedBox );

      // Attach a click event listener to the 'open' button to expand the box.
      $( 'a#resp-open' ) .on( 'click' , unemptyBox );
    }


    // Function to expand the dimension display box back to its full state.
    function unemptyBox ( ) {
      // Restore padding and set the full content HTML.
      $( '.response-dev' ) .css( 'padding' , '10px' ) .html( resultsContent );

      // Attach a click event listener to the 'close' button to collapse the box.
      $( 'a#resp-close' ) .on( 'click' , emptyBox );

      // Ensure the dimensions are updated when the box is re-opened.
      dimensionsOnLoad();
    }


    // Initially attach the click event handler to the 'close' button.
    $( 'a#resp-close' ) .on( 'click' , emptyBox );


    /*
     * --- Developer Notes / Potential Workarounds ---
     * The following lines are commented out as they represent either
     * experimental features, debugging snippets, or workarounds that are
     * not currently active in this version of the code.
     *
     * Original comment: workaround to chrome not resizing < 400px. Needs Work.
     * Reference URL for context: http://stackoverflow.com/questions/8681903/browser-doesnt-scale-below-400px
     *
     * Example of a commented-out line for opening a new window:
     * // ('.user-info').append('<a href="javascript:window.open(\'http://d7dashboard:8082/\', \'\',\'width=320,height=480\')">Open!</a>')
     *
     * Another commented-out line, possibly for capturing the current URL:
     * // var currUrl = window.location.href;
     *
     * These comments and commented code are retained for historical context
     * but are not part of the active functionality.
     */

  }; // End of Drupal.behaviors.responseDev.attach function definition

// Pass the jQuery object as an argument to the IIFE, aliasing it as '$'.
})( jQuery );