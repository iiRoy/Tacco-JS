/*
 * File: svgeezy.js
 * Version: 1.0.0
 *
 * This script provides a fallback mechanism for SVG images in browsers that do not support SVG.
 *
 * Copyright (c) 2012, Ben Howdle (http://twostepmedia.co.uk).
 * This software is released under the WTFPL (Do What The Fuck You Want To Public License).
 * For more details, see: http://sam.zoy.org/wtfpl/
 *
 * Last Modified: August 26, 2012, 20:38 GMT.
 */


/*
 * Usage Example:
 * To initialize svgeezy, call it like this,
 * optionally providing a class name to ignore and a fallback file extension.
 *
 * svgeezy.init('no-svg-check', 'gif');
 */

/*
 * The main svgeezy object is created as a self-executing anonymous function
 * to encapsulate its scope and return a public API.
 */
window . svgeezy = function(  ) {

  // The public interface of the svgeezy library.
  return {

    /**
     * Initializes the SVGeezy script.
     * This function checks for SVG support and, if not available,
     * triggers the fallback process for <img> elements.
     *
     * @param {string|boolean} avoid    - A class name. Images with this class will be skipped.
     *                                      Pass `false` or `null` to check all images.
     * @param {string}         filetype - The desired fallback file extension (e.g., 'png', 'jpg').
     *                                      Defaults to 'png' if not specified.
     */
    init : function( avoid, filetype ) {
      // Store the 'avoid' class name; default to false if not provided.
      this . avoid = avoid || false ;

      // Store the fallback file type; default to 'png' if not provided.
      this . filetype = filetype || 'png' ;

      // Determine if the browser natively supports SVG.
      this . svgSupport = this . supportsSvg(  ) ;

      /*
       * If the browser does NOT support SVG,
       * proceed with the fallback mechanism.
       */
      if ( ! this . svgSupport ) {
        // Retrieve all <img> elements in the document.
        this . images = document . getElementsByTagName( 'img' ) ;

        // Cache the length of the images collection for loop efficiency.
        this . imgL = this . images . length ;

        // Execute the fallback routine.
        this . fallbacks(  ) ;
      } // End of SVG support check.
    } , // End of init function.


    /**
     * Implements the fallback logic for images.
     * Iterates through all <img> tags and replaces '.svg' sources
     * with the specified fallback file type if SVG is not supported.
     */
    fallbacks : function(  ) {
      // Loop through all images in reverse for potentially better performance
      // when removing or modifying elements in a live HTMLCollection.
      while ( this . imgL -- ) {

        /*
         * Check if the current image should be processed.
         * It should be processed if:
         *   1. It does NOT have the 'avoid' class, OR
         *   2. No 'avoid' class was specified (i.e., this.avoid is false).
         */
        if ( ! this . hasClass( this . images[ this . imgL ] , this . avoid ) || ! this . avoid ) {

          // Get the 'src' attribute of the current image.
          var src = this . images[ this . imgL ] . getAttribute( 'src' ) ;

          // If 'src' is null or empty, skip this image.
          if ( src === null ) {
            continue ;
          }

          // Check if the file extension of the source is 'svg'.
          if ( this . getFileExt( src ) == 'svg' ) {
            // Construct the new source URL using the fallback file type.
            var newSrc = src . replace( '.svg' , '.' + this . filetype ) ;

            // Update the 'src' attribute of the image to the new fallback source.
            this . images[ this . imgL ] . setAttribute( 'src' , newSrc ) ;
          } // End of SVG file check.
        } // End of 'avoid' class check.
      } // End of while loop.
    } , // End of fallbacks function.


    /**
     * Extracts the file extension from a given URL string.
     * Handles URLs with query parameters.
     *
     * @param {string} src - The URL string from which to extract the extension.
     * @returns {string} The file extension (e.g., 'png', 'svg', 'jpg').
     */
    getFileExt : function( src ) {
      // Split the URL by dots and take the last part to get the extension.
      var ext = src . split( '.' ) . pop(  ) ;

      // If the extension contains a query string (e.g., "?v=1"), remove it.
      if ( ext . indexOf( "?" ) !== -1 ) {
        ext = ext . split( '?' )[ 0 ] ;
      }

      // Return the cleaned file extension.
      return ext ;
    } , // End of getFileExt function.


    /**
     * Checks if an HTML element has a specific CSS class.
     *
     * @param {Element} element - The DOM element to check.
     * @param {string}  cls     - The class name to look for.
     * @returns {boolean} True if the element has the class, false otherwise.
     */
    hasClass : function( element, cls ) {
      // Pad the className with spaces to ensure accurate matching of whole words.
      return ( ' ' + element . className + ' ' ) . indexOf( ' ' + cls + ' ' ) > -1 ;
    } , // End of hasClass function.


    /**
     * Determines if the current browser supports SVG (Scalable Vector Graphics).
     *
     * @returns {boolean} True if SVG is supported, false otherwise.
     */
    supportsSvg : function(  ) {
      // Use document.implementation.hasFeature to check for SVG support.
      return document . implementation . hasFeature( "http://www.w3.org/TR/SVG11/feature#Image" , "1.1" ) ;
    } // End of supportsSvg function.

  } ; // End of return object definition.

} (  ) ; // Execute the anonymous function immediately.