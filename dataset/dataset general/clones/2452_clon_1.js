//////////////////////////////////////////////////////////////////////////////
// This is a Type I clone of the original Facebox JavaScript code.
//
// According to Type I definition:
// "Code fragments are exactly equal, except for possible variations
// in whitespace and comments."
//
// All identifiers, variable names, function names, operators, and expressions
// are preserved exactly as they were in the original source.
//
// The following modifications have been applied extensively:
// - All original comments have been removed.
// - New, verbose, and sometimes redundant comments have been added throughout.
// - Indentation levels have been altered, sometimes inconsistently.
// - Spacing around operators, keywords, and punctuation has been modified.
// - Blank lines have been added or removed to change visual layout.
//
// The functional behavior and logical structure of this code are
// absolutely identical to the original.
//////////////////////////////////////////////////////////////////////////////


( function ( $ ) {

    // Main Facebox function, exposed as $.facebox
    // This function acts as the primary entry point for displaying faceboxes.
    $.facebox = function ( data , klass ) {

        // Always show the loading state initially.
        $.facebox.loading ( );


        // Determine the type of content to display and call the appropriate handler.
        if ( data.ajax ) { // If 'ajax' property is present, load content via AJAX.
            fillFaceboxFromAjax ( data.ajax ) ;
        }

        else if ( data.image ) { // If 'image' property is present, load an image.
            fillFaceboxFromImage ( data.image ) ;
        }

        else if ( data.div ) { // If 'div' property is present, load content from a local div.
            fillFaceboxFromHref ( data.div ) ;
        }

        else if ( $.isFunction ( data ) ) { // If 'data' is a function, execute it.
            data.call ( $ ) ;
        }

        else { // Otherwise, assume 'data' is raw HTML/text and reveal it directly.
            $.facebox.reveal ( data , klass ) ;
        }

    } ; // End of $.facebox function definition.



    /*
     * Public methods and settings for Facebox.
     * These are extended onto the $.facebox object.
     */

    $.extend ( $.facebox , {

        // Configuration settings for Facebox.
        settings : {
            opacity : 0 , // Overlay opacity (0-1).
            overlay : true , // Whether to show an overlay behind the facebox.
            loadingImage : '/facebox/loading.gif' , // Path to the loading GIF.
            closeImage : '/facebox/closelabel.gif' , // Path to the close button image.
            imageTypes : [ 'png' , 'jpg' , 'jpeg' , 'gif' ] , // Supported image file extensions.

            // The HTML structure for the Facebox itself.
            faceboxHtml : `
    <div id="facebox" style="display:none;">
      <div class="popup">
        <table>
          <tbody>
            <tr>
              <td class="tl"/><td class="b"/><td class="tr"/>
            </tr>
            <tr>
              <td class="b"/>
              <td class="body">
                <div class="content">
                </div>
                <div class="footer">
                  <a href="#" class="close">
                    <img src="/facebox/closelabel.gif" title="close" class="close_image" />
                  </a>
                </div>
              </td>
              <td class="b"/>
            </tr>
            <tr>
              <td class="bl"/><td class="b"/><td class="br"/>
            </tr>
          </tbody>
        </table>
      </div>
    </div>`
        } , // End of settings object.


        // Function to display the loading state of Facebox.
        loading : function ( ) {
            // Initialize Facebox if it hasn't been already.
            init ( ) ;

            // If the loading spinner is already visible, do nothing.
            if ( $ ( '#facebox .loading' ) . length == 1 ) {
                return true ;
            }

            // Show the overlay.
            showOverlay ( ) ;

            // Clear any previous content and add the loading spinner.
            $ ( '#facebox .content' ) . empty ( ) ;
            $ ( '#facebox .body' ) . children ( ) . hide ( ) . end ( ) .
                append ( '<div class="loading"><img src="' + $.facebox.settings.loadingImage + '"/></div>' ) ;

            // Position and show the facebox.
            $ ( '#facebox' ) . css ( {
                top : getPageScroll ( ) [ 1 ] + ( getPageHeight ( ) / 10 ) , // Calculate vertical position.
                left : 385.5 // Fixed horizontal position.
            } ) . show ( ) ;

            // Bind the escape key to close Facebox.
            $ ( document ) . bind ( 'keydown.facebox' , function ( e ) {
                if ( e.keyCode == 27 ) { // If Escape key is pressed (keyCode 27).
                    $.facebox.close ( ) ;
                }
                return true ; // Allow other keydown events to propagate.
            } ) ;

            // Trigger a custom event indicating that Facebox is in loading state.
            $ ( document ) . trigger ( 'loading.facebox' ) ;
        } , // End of loading function.


        // Function to reveal content within the Facebox.
        reveal : function ( data , klass ) {
            // Trigger an event before content is revealed.
            $ ( document ) . trigger ( 'beforeReveal.facebox' ) ;

            // Add an optional class to the content area if provided.
            if ( klass ) {
                $ ( '#facebox .content' ) . addClass ( klass ) ;
            }

            // Append the actual content to the facebox.
            $ ( '#facebox .content' ) . append ( data ) ;

            // Remove the loading spinner.
            $ ( '#facebox .loading' ) . remove ( ) ;

            // Fade in the content.
            $ ( '#facebox .body' ) . children ( ) . fadeIn ( 'normal' ) ;

            // Recalculate and set the horizontal position of the facebox to center it.
            $ ( '#facebox' ) . css ( 'left' , $ ( window ) . width ( ) / 2 - ( $ ( '#facebox table' ) . width ( ) / 2 ) ) ;

            // Trigger events after content has been revealed.
            $ ( document ) . trigger ( 'reveal.facebox' ) . trigger ( 'afterReveal.facebox' ) ;
        } , // End of reveal function.


        // Function to close the Facebox.
        close : function ( ) {
            // Trigger a custom event indicating Facebox is closing.
            $ ( document ) . trigger ( 'close.facebox' ) ;
            return false ; // Prevent default action if this is called from an event handler.
        } // End of close function.

    } ) ; // End of $.extend call.



    /*
     * Public, jQuery plugin methods.
     * These allow Facebox to be initialized on elements using $.fn.facebox().
     */

    $.fn.facebox = function ( settings ) {
        // Initialize Facebox with optional settings.
        init ( settings ) ;

        // Define the click handler for elements bound to Facebox.
        function clickHandler ( ) {
            // Show loading state when an element is clicked.
            $.facebox.loading ( true ) ;

            // Parse the 'rel' attribute for a potential class name.
            // Supports 'facebox.inline_popup' or 'facebox[inline_popup]' syntax.
            var klass = this.rel.match ( /facebox\[?\.(\w+)\]?/ ) ;
            if ( klass ) {
                klass = klass [ 1 ] ; // Extract the class name.
            }

            // Fill the facebox based on the href of the clicked element.
            fillFaceboxFromHref ( this.href , klass ) ;
            return false ; // Prevent the default link behavior.
        } // End of clickHandler function.

        // Bind the clickHandler to the current set of jQuery elements.
        return this.click ( clickHandler ) ;
    } ; // End of $.fn.facebox function.



    /*
     * Private helper methods for Facebox functionality.
     * These functions are not exposed publicly.
     */


    // Initializes Facebox setup on the page.
    // This function is called only once.
    function init ( settings ) {
        // Check if Facebox has already been initialized.
        if ( $.facebox.settings.inited ) {
            return true ;
        } else {
            $.facebox.settings.inited = true ; // Mark as initialized.
        }

        // Trigger an event after Facebox initialization.
        $ ( document ) . trigger ( 'init.facebox' ) ;

        // Apply backward compatibility for settings.
        makeCompatible ( ) ;

        // Create a regular expression for image types.
        var imageTypes = $.facebox.settings.imageTypes.join ( '|' ) ;
        $.facebox.settings.imageTypesRegexp = new RegExp ( '\\.' + imageTypes + '$' , 'i' ) ;

        // Extend default settings with any provided custom settings.
        if ( settings ) {
            $.extend ( $.facebox.settings , settings ) ;
        }

        // Append the Facebox HTML structure to the body.
        $ ( 'body' ) . append ( $.facebox.settings.faceboxHtml ) ;

        // Preload close and loading images.
        var preload = [ new Image ( ) , new Image ( ) ] ;
        preload [ 0 ] . src = $.facebox.settings.closeImage ;
        preload [ 1 ] . src = $.facebox.settings.loadingImage ;

        // Preload background images used in the Facebox structure.
        $ ( '#facebox' ) . find ( '.b:first, .bl, .br, .tl, .tr' ) . each ( function ( ) {
            preload.push ( new Image ( ) ) ;
            preload.slice ( -1 ) [ 0 ] . src = $ ( this ) . css ( 'background-image' ) . replace ( /url\((.+)\)/ , '$1' ) ;
        } ) ;

        // Bind the close button click event.
        $ ( '#facebox .close' ) . click ( $.facebox.close ) ;

        // Set the source of the close image.
        $ ( '#facebox .close_image' ) . attr ( 'src' , $.facebox.settings.closeImage ) ;
    } // End of init function.


    // getPageScroll() by quirksmode.com - Retrieves current scroll position.
    function getPageScroll ( ) {
        var xScroll , yScroll ;

        if ( self.pageYOffset ) {
            yScroll = self.pageYOffset ;
            xScroll = self.pageXOffset ;
        } else if ( document.documentElement && document.documentElement.scrollTop ) { // Explorer 6 Strict Mode.
            yScroll = document.documentElement.scrollTop ;
            xScroll = document.documentElement.scrollLeft ;
        } else if ( document.body ) { // All other Explorers.
            yScroll = document.body.scrollTop ;
            xScroll = document.body.scrollLeft ;
        }
        return new Array ( xScroll , yScroll ) ; // Return an array containing X and Y scroll offsets.
    } // End of getPageScroll function.


    // Adapted from getPageSize() by quirksmode.com - Retrieves current window height.
    function getPageHeight ( ) {
        var windowHeight ;

        if ( self.innerHeight ) { // All except Explorer.
            windowHeight = self.innerHeight ;
        } else if ( document.documentElement && document.documentElement.clientHeight ) { // Explorer 6 Strict Mode.
            windowHeight = document.documentElement.clientHeight ;
        } else if ( document.body ) { // Other Explorers.
            windowHeight = document.body.clientHeight ;
        }
        return windowHeight ; // Return the calculated window height.
    } // End of getPageHeight function.


    // Provides backward compatibility for Facebox settings.
    function makeCompatible ( ) {
        var $s = $.facebox.settings ; // Shorthand for settings object.

        // Use new setting name if available, otherwise fall back to old name.
        $s.loadingImage = $s.loading_image || $s.loadingImage ;
        $s.closeImage = $s.close_image || $s.closeImage ;
        $s.imageTypes = $s.image_types || $s.imageTypes ;
        $s.faceboxHtml = $s.facebox_html || $s.faceboxHtml ;
    } // End of makeCompatible function.


    // Determines content type from href and calls appropriate display function.
    // Supports: div (#id), image (blah.extension), ajax (anything else).
    function fillFaceboxFromHref ( href , klass ) {

        // Check if the href points to a local div (contains '#').
        if ( href.match ( /#/ ) ) {
            var url = window.location.href.split ( '#' ) [ 0 ] ; // Get current page URL without hash.
            var target = href.replace ( url , '' ) ; // Extract the hash target (e.g., '#myDiv').
            $.facebox.reveal ( $ ( target ) . clone ( ) . show ( ) , klass ) ; // Clone and show the div content.

        // Check if the href points to an image (matches imageTypesRegexp).
        } else if ( href.match ( $.facebox.settings.imageTypesRegexp ) ) {
            fillFaceboxFromImage ( href , klass ) ; // Display it as an image.

        // Otherwise, treat it as an AJAX request.
        } else {
            fillFaceboxFromAjax ( href , klass ) ; // Load content via AJAX.
        }
    } // End of fillFaceboxFromHref function.


    // Fills Facebox with an image.
    function fillFaceboxFromImage ( href , klass ) {
        var image = new Image ( ) ; // Create a new Image object.

        image.onload = function ( ) { // Set onload event handler for the image.
            // Once image is loaded, reveal it within the facebox.
            $.facebox.reveal ( '<div class="image"><img src="' + image.src + '" /></div>' , klass ) ;
        } ;
        image.src = href ; // Set the image source, which triggers loading.
    } // End of fillFaceboxFromImage function.


    // Fills Facebox with content from an AJAX request.
    function fillFaceboxFromAjax ( href , klass ) {
        // Perform an AJAX GET request.
        $.get ( href , function ( data ) {
            $.facebox.reveal ( data , klass ) ; // On success, reveal the received data.
        } ) ;
    } // End of fillFaceboxFromAjax function.


    // Determines if the overlay should be skipped based on settings.
    function skipOverlay ( ) {
        return $.facebox.settings.overlay == false || $.facebox.settings.opacity === null ;
    } // End of skipOverlay function.


    // Displays the overlay behind the Facebox.
    function showOverlay ( ) {
        if ( skipOverlay ( ) ) {
            return ; // Do not show overlay if settings dictate.
        }

        // If overlay element doesn't exist, create and append it.
        if ( $ ( 'facebox_overlay' ) . length == 0 ) {
            $ ( "body" ) . append ( '<div id="facebox_overlay" class="facebox_hide"></div>' ) ;
        }

        // Configure and display the overlay.
        $ ( '#facebox_overlay' ) . hide ( ) . addClass ( "facebox_overlayBG" )
            . css ( 'opacity' , $.facebox.settings.opacity ) // Set opacity.
            . click ( function ( ) {
                $ ( document ) . trigger ( 'close.facebox' ) ; // Close facebox on overlay click.
            } )
            . fadeIn ( 200 ) ; // Fade in the overlay.
        return false ; // Prevent default event if called from handler.
    } // End of showOverlay function.


    // Hides and removes the Facebox overlay.
    function hideOverlay ( ) {
        if ( skipOverlay ( ) ) {
            return ; // Do not hide overlay if settings dictate.
        }

        // Fade out the overlay and then remove it.
        $ ( '#facebox_overlay' ) . fadeOut ( 200 , function ( ) {
            $ ( "#facebox_overlay" ) . removeClass ( "facebox_overlayBG" ) ; // Remove background class.
            $ ( "#facebox_overlay" ) . addClass ( "facebox_hide" ) ; // Add hide class.
            $ ( "#facebox_overlay" ) . remove ( ) ; // Remove the overlay element from DOM.
        } ) ;

        return false ; // Prevent default event if called from handler.
    } // End of hideOverlay function.



    /*
     * Event Bindings for Facebox.
     * These handle various Facebox lifecycle events.
     */

    // Bind to the 'close.facebox' event.
    $ ( document ) . bind ( 'close.facebox' , function ( ) {
        // Unbind the escape key listener.
        $ ( document ) . unbind ( 'keydown.facebox' ) ;

        // Fade out the facebox and perform cleanup in the callback.
        $ ( '#facebox' ) . fadeOut ( function ( ) {
            $ ( '#facebox .content' ) . removeClass ( ) . addClass ( 'content' ) ; // Reset content classes.
            hideOverlay ( ) ; // Hide the overlay.
            $ ( '#facebox .loading' ) . remove ( ) ; // Remove any lingering loading indicators.
        } ) ;
    } ) ; // End of 'close.facebox' binding.


} ) ( jQuery ) ; // End of the IIFE, passing jQuery as $ alias.