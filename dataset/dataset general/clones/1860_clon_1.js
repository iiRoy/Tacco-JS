/*
 * Imadaem v0.4.0 - Responsive Image Scaling Plugin
 *
 * Project Homepage: http://imadaem.penibelst.de/
 *
 * This file represents a Type I clone of the original source code.
 * It is functionally identical; all identifiers, operators,
 * expressions, and logic remain precisely as in the original.
 *
 * Extensive modifications have been made solely to whitespace and comments
 * to achieve a visually distinct appearance while preserving
 * absolute logical and structural equivalence.
 *
 * Changes include:
 * - Varied indentation levels and spacing.
 * - Addition of numerous explanatory comments.
 * - Alteration of comment styles.
 * - Strategic insertion and removal of blank lines.
 */


( /* The entire plugin is encapsulated within an Immediately Invoked Function Expression (IIFE) */

  function ( $ , window )
  {
        "use strict" ; /* Enforces stricter parsing and error handling rules in JavaScript */


        // Define the 'imadaem' method on jQuery's prototype, making it chainable
        $.fn.imadaem = function ( options )
        {
                var

                    $elements = this , /* Store the jQuery collection of elements on which the plugin was invoked */


                    settings = $.extend( /* Combine default configuration with user-provided options */
                    {
                          // The name of the data attribute used to retrieve image data (e.g., data-imadaem)
                          dataAttribute : "imadaem" ,

                          // The relative or absolute path to the TimThumb PHP script
                          timthumbPath  : "/timthumb/timthumb.php" ,

                          // Optional: Strategy for vertical rhythm adjustment (e.g., "line-height")
                          verticalRhythm: null ,

                          // Space-separated string of window events that should trigger a rescale operation
                          windowEvents  : "resize orientationchange"
                    } ,

                    options ) , /* The options object passed by the user during plugin initialization */


                    /*
                     * Helper function: getNativeLength
                     * Converts a CSS pixel length to a device-specific native pixel length,
                     * accounting for device pixel ratio (DPR).
                     */
                    getNativeLength = function ( cssLength )
                    {
                          var
                                density = window.devicePixelRatio || 1 /* Get DPR, default to 1 if not available */
                          ;

                          return Math.round( cssLength * density ) ; /* Round to the nearest whole pixel */
                    } , /* End of getNativeLength function definition */


                    /*
                     * Helper function: lineHeight
                     * Retrieves the computed 'line-height' CSS property of an element
                     * and parses it as a float. Returns 0 if the value is not a number.
                     */
                    lineHeight = function ( $element )
                    {
                          var
                                lh = parseFloat( $element.css( "line-height" ) )
                          ;

                          return isNaN( lh ) ? 0 : lh ; /* Return 0 for invalid line-heights */
                    } , /* End of lineHeight function definition */


                    /*
                     * Helper function: adjustVerticalRhythm
                     * Modifies the calculated height of an element to align with a
                     * predefined vertical rhythm, typically based on line-height.
                     */
                    adjustVerticalRhythm = function ( $element , height )
                    {
                          // Check if vertical rhythm adjustment is enabled and set to "line-height"
                          if ( settings.verticalRhythm === "line-height" )
                          {
                                var
                                      lh , /* Variable to store the element's line-height */
                                      l    /* Variable to store the calculated number of lines */
                                ;

                                lh = lineHeight( $element ) ; // Get the line-height for the current element

                                if ( lh )
                                { /* If line-height is a valid, non-zero value */
                                      l = Math.max( 1 , Math.round( height / lh ) ) ; /* Calculate lines, ensure at least 1 */
                                      height = lh * l ; /* Adjust height to be a multiple of the line-height */
                                }
                          }

                          return height ; /* Return the potentially adjusted height */
                    } , /* End of adjustVerticalRhythm function definition */


                    /*
                     * Helper function: getData
                     * Extracts and normalizes image-related data from an element's
                     * data attribute (as specified by 'settings.dataAttribute').
                     */
                    getData = function ( $element )
                    {
                          var
                                data = $element.data( settings.dataAttribute )
                          ;

                          // If the data is already a plain object, process its properties
                          if ( $.isPlainObject( data ) )
                          {
                                // Ensure 'ratio' is a floating-point number, defaulting to 0 if invalid
                                data.ratio = parseFloat( data.ratio ) || 0 ;

                                // 'maxRatio' is only considered if 'ratio' is not set; default to 0 if invalid
                                data.maxRatio = data.ratio ? 0 : parseFloat( data.maxRatio ) || 0 ;

                                // Normalize 'gravity' string: remove invalid chars, take first two valid chars
                                data.gravity = data.gravity ? data.gravity.replace( /[^lrtb]/g , "" ).substr( 0 , 2 ) : "" ;
                          }
                          else
                          {
                                // If data is not an object, assume it's just the URL string
                                data = { url : data } ;
                          }

                          // Merge the extracted/normalized data with a set of default properties
                          return $.extend(
                          {
                                url        : "" ,          // Default empty URL
                                gravity    : "" ,          // Default empty gravity
                                ratio      : 0 ,           // Default aspect ratio of 0 (no fixed ratio)
                                maxRatio   : 0 ,           // Default max aspect ratio of 0 (no min height)
                                heightGuide: ""            // Default empty height guide selector
                          } ,

                          data ) ; /* Return the complete, normalized data object */
                    } , /* End of getData function definition */


                    /*
                     * Helper function: setSrc
                     * Sets the 'src' attribute of an image element and includes
                     * basic error handling to revert to the previous source once.
                     */
                    setSrc = function ( $element , newSrc )
                    {
                          var
                                oldSrc = $element.attr( "src" ) , /* Store the current 'src' for fallback */
                                errors = 0                         /* Counter for error occurrences */
                          ;

                          $element
                                .on( "error" , function ( )
                                { /* Attach an event handler for image loading errors */
                                      // Fall back to the original src only if it's the first error
                                      if ( ! errors )
                                      {
                                            errors += 1 ; /* Increment the error counter */
                                            $( this ).attr( "src" , oldSrc ) ; /* Revert to the stored old source */
                                      }
                                } )
                                .attr( "src" , newSrc ) /* Set the new image source */
                          ;
                    } , /* End of setSrc function definition */


                    /*
                     * Main function: scale
                     * Iterates through all selected elements, calculates their dimensions
                     * based on various settings, and updates their image sources via TimThumb.
                     */
                    scale = function ( )
                    {
                          var
                                $this ,            /* Reference to the current element in the loop */
                                data ,             /* Normalized data for the current element */
                                timthumbParams ,   /* Object to hold parameters for the TimThumb URL */
                                height ,           /* Calculated height of the element */
                                minHeight ,        /* Minimum height derived from maxRatio */
                                width              /* Calculated width of the element */
                          ;

                          // Iterate over each element in the initial jQuery collection
                          $elements.each( function ( )
                          {
                                $this = $( this ) ; /* Cache the current element as a jQuery object */

                                data = getData( $this ) ; /* Retrieve and normalize data for this specific element */

                                // If no valid URL is found in the data, skip this element
                                if ( ! data.url )
                                {
                                      return ;
                                }

                                width  = $this.innerWidth( ) ;  // Get the inner width (content + padding)
                                height = $this.innerHeight( ) ; // Get the inner height (content + padding)


                                // Determine height based on aspect ratio or a guide element
                                if ( data.ratio )
                                {
                                      // If a fixed ratio is defined, calculate height from width
                                      height = Math.round( width / data.ratio ) ;
                                }
                                else if ( $( data.heightGuide ).length )
                                {
                                      // If a height guide selector is provided and an element matches, use its height
                                      height = $( data.heightGuide ).innerHeight( ) ;
                                }


                                // Apply a maximum aspect ratio (which implies a minimum height) if specified
                                if ( data.maxRatio )
                                {
                                      minHeight = Math.round( width / data.maxRatio ) ; // Calculate the minimum allowed height
                                      height = Math.max( minHeight , height ) ;           // Ensure height is not less than minHeight
                                }


                                // Adjust the calculated height according to vertical rhythm settings
                                height = adjustVerticalRhythm( $this , height ) ;


                                // Set the element's height directly to prevent visual "blinking" effects
                                $this.height( height ) ;


                                // Assemble the parameters for the TimThumb image manipulation script
                                timthumbParams =
                                {
                                      src : data.url || "" ,              // Original source URL of the image
                                      a   : data.gravity || "" ,          // Gravity setting for cropping
                                      w   : getNativeLength( width ) ,    // Target width in native device pixels
                                      h   : getNativeLength( height )     // Target height in native device pixels
                                } ;


                                // Construct the final TimThumb URL and set it as the element's 'src'
                                setSrc( $this , settings.timthumbPath + "?" + $.param( timthumbParams ) ) ;

                          } ) ; // End of $elements.each() loop
                    } ; /* End of scale function definition */


                // Attach event handlers to the window object for initial load and subsequent changes
                $( window )
                    .one( "load" , scale ) /* Execute 'scale' once after the entire page has loaded */
                    .on( settings.windowEvents , scale ) /* Execute 'scale' on specified window events (e.g., resize) */
                ;

                return this ; /* Return the original jQuery object to maintain chainability */

        } ; /* End of $.fn.imadaem plugin definition */

  } /* End of the outer function for the IIFE */

)( jQuery , window ) ; /* Pass jQuery and window objects as arguments to the IIFE */