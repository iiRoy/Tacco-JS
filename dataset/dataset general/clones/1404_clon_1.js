/*global sjcl : true, jQuery : true, $ : true, lzw : true, zerobin : true, ZeroClipboard : true, vizhash : true, prettyPrint : true, confirm : true */

; /* This semicolon terminates the global declaration statement. */

( function ( ) {

  "use strict" ; /* Enforce strict mode for better code quality and error handling. */


  /*
   * Initialize the random number generator.
   * It's good practice to start collecting entropy as early as possible.
   */
  sjcl . random . startCollectors ( ) ;


  /*
   * Configure jQuery AJAX settings.
   * This ensures that AJAX requests are cached by the browser where appropriate.
   */
  $ . ajaxSetup ( {
    cache : true /* Enable caching for all subsequent AJAX requests. */
  } ) ;


  /*
   * Helper function to create inline callbacks with predefined arguments.
   *
   * This is useful for situations where a function needs to be called
   * with specific arguments when used as a callback, without creating
   * a new function closure every time.
   *
   * Example usage:
   *   $('element').on('click', mkcb(console.log, 'Clicked!', event.target));
   *
   * @param {Function} func The function to be called as a callback.
   * @param {...*}      args Additional arguments to pass to the function.
   * @returns {Function} A new function that, when called, invokes 'func'
   *                     with the provided 'args' (excluding the first).
   */
  function mkcb ( func ) {

    var args = arguments ; /* Capture all arguments passed to mkcb. */

    return function ( ) {
      // Use apply to call the original function with arguments from the second position onwards.
      return func . apply ( func , Array . prototype . slice . call ( args , 1 ) ) ;
    } ;
  } /* End of mkcb function definition */


  /*
   ********************************************************************************
   ****                                                                        ****
   ****                   ZeroBin Application Core Utilities                   ****
   ****                                                                        ****
   ********************************************************************************
   */

  window . zerobin = {

    // Current version of the ZeroBin client-side application logic.
    version : '0.1.1' ,

    /**
     * Encrypts the provided content using SJCL, incorporating compression and Base64 encoding.
     * This process is broken down into timed steps to prevent UI freezing and
     * allow for progress updates via callbacks.
     *
     * @param {string}   key                  The encryption key.
     * @param {string}   content              The plaintext content to encrypt.
     * @param {Function} [toBase64Callback]   Callback executed before Base64 encoding.
     * @param {Function} [compressCallback]   Callback executed before compression.
     * @param {Function} [encryptCallback]    Callback executed before encryption.
     * @param {Function} [doneCallback]       Callback executed upon completion, receiving the encrypted content.
     */
    encrypt : function ( key , content , toBase64Callback ,
      compressCallback , encryptCallback , doneCallback ) {

      // Step 1: Convert UTF8 string to SJCL bits.
      setTimeout ( function ( ) {

        content = sjcl . codec . utf8String . toBits ( content ) ;
        if ( toBase64Callback ) {
          toBase64Callback ( ) ; // Notify that Base64 encoding is about to happen.
        }

        // Step 2: Convert bits to Base64.
        setTimeout ( function ( ) {

          content = sjcl . codec . base64 . fromBits ( content ) ;
          if ( compressCallback ) {
            compressCallback ( ) ; // Notify that compression is about to happen.
          }

          // Step 3: (Optional) Compression. Note: Original code had a comment
          // about a bug with JPG, so this step is commented out in original.
          setTimeout ( function ( ) {

            // content = lzw.compress(content); // This line is commented out due to a known bug with JPG files.
            if ( encryptCallback ) {
              encryptCallback ( ) ; // Notify that encryption is about to happen.
            }

            // Step 4: Encrypt the content using the provided key.
            setTimeout ( function ( ) {

              try {
                content = sjcl . encrypt ( key , content ) ;
              } catch ( e ) {
                // Handle encryption errors gracefully.
                $ ( 'input, textarea, select, button' ) . prop ( 'disabled' , false ) ;
                zerobin . progressBar ( 'form.well .progress' ) . container . hide ( ) ;

                zerobin . message ( 'error' , 'Paste could not be encrypted. Aborting.' ,
                  'Error' ) ;
              }
              if ( doneCallback ) {
                doneCallback ( content ) ; // Pass the final encrypted content to the done callback.
              }
            } , 250 ) ; // Delay for encryption step.

          } , 250 ) ; // Delay for compression step.

        } , 250 ) ; // Delay for Base64 encoding step.

      } , 250 ) ; // Delay for initial UTF8 conversion step.
    } , // End of zerobin.encrypt function.

    /**
     * Decrypts the provided content using SJCL, reversing Base64 encoding and decompression.
     * Similar to encryption, this process is broken into timed steps to avoid UI blocking.
     *
     * This function is quite complex due to the nested setTimeout calls.
     * A library for managing asynchronous flows (e.g., promises) could simplify this structure.
     *
     * @param {string}   key                  The decryption key.
     * @param {string}   content              The encrypted content to decrypt.
     * @param {Function} errorCallback        Callback for any errors during decryption.
     * @param {Function} [uncompressCallback] Callback executed before decompression.
     * @param {Function} [fromBase64Callback] Callback executed before Base64 decoding.
     * @param {Function} [toStringCallback]   Callback executed before converting bits to string.
     * @param {Function} [doneCallback]       Callback executed upon completion, receiving the decrypted content.
     */
    decrypt : function ( key , content , errorCallback , uncompressCallback ,
      fromBase64Callback , toStringCallback , doneCallback ) {

      /* Step 1: Initial decryption of the content. */
      setTimeout ( function ( ) {
        try {
          content = sjcl . decrypt ( key , content ) ;
          if ( uncompressCallback ) {
            uncompressCallback ( ) ; // Notify before starting decompression.
          }

          /* Step 2: Decompress the content. */
          setTimeout ( function ( ) {
            try {
              content = lzw . decompress ( content ) ;
              if ( fromBase64Callback ) {
                fromBase64Callback ( ) ; // Notify before Base64 decoding.
              }

              /* Step 3: Convert content from Base64 back to SJCL bits. */
              setTimeout ( function ( ) {
                try {
                  content = sjcl . codec . base64 . toBits ( content ) ;
                  if ( toStringCallback ) {
                    toStringCallback ( ) ; // Notify before converting bits to UTF8 string.
                  }

                  /* Step 4: Convert SJCL bits back to a UTF8 string. */
                  setTimeout ( function ( ) {
                    try {
                      content = sjcl . codec . utf8String . fromBits ( content ) ;
                      if ( doneCallback ) {
                        doneCallback ( content ) ; // Final decrypted content.
                      }
                    } catch ( err ) {
                      errorCallback ( err ) ; // Handle errors during bit-to-string conversion.
                    }

                  } , 250 ) ; /* This is the delay for the final "from bits to string" operation. */

                } catch ( err ) {
                  errorCallback ( err ) ; // Handle errors during Base64-to-bits conversion.
                }

              } , 250 ) ; /* This is the delay for "from base 64 to bits" operation. */

            } catch ( err ) {
              errorCallback ( err ) ; // Handle errors during decompression.
            }

          } , 250 ) ; /* This is the delay for the "decompress" operation. */

        } catch ( err ) {
          errorCallback ( err ) ; // Handle errors during the initial decryption.
        }

      } , 250 ) ; /* This is the delay for the "decrypt" operation. */
    } , // End of zerobin.decrypt function.

    /**
     * Generates a random base64-like string suitable for use as an encryption key.
     * The length of the key is derived from the entropy parameter.
     *
     * @param {number} entropy The desired entropy in bits.
     * @returns {string} A base64-encoded string representing the generated key.
     */
    makeKey : function ( entropy ) {
      // Ensure entropy is a multiple of 6 for clean base64 output.
      entropy = Math . ceil ( entropy / 6 ) * 6 ;
      var key = sjcl . bitArray . clamp (
        sjcl . random . randomWords ( Math . ceil ( entropy / 32 ) , 0 ) , entropy ) ;
      // Convert to base64, remove padding '=', and replace '/' with '-' for URL safety.
      return sjcl . codec . base64 . fromBits ( key , 0 ) . replace ( /\=+$/ , '' ) . replace ( /\// , '-' ) ;
    } , // End of zerobin.makeKey function.

    /**
     * Returns a formatted date string (MM-DD-YYYY).
     *
     * @param {Date} [date] Optional Date object. Defaults to current date if not provided.
     * @returns {string} Formatted date string.
     */
    getFormatedDate : function ( date ) {
      date = date || new Date ( ) ; // Use current date if no date object is provided.
      return ( ( date . getMonth ( ) + 1 ) + '-' + date . getDate ( ) + '-' + date . getFullYear ( ) ) ;
    } , // End of zerobin.getFormatedDate function.

    /**
     * Returns a formatted time string (HH:MM:SS).
     * Pads single-digit hours, minutes, and seconds with a leading zero.
     *
     * @param {Date} [date] Optional Date object. Defaults to current date if not provided.
     * @returns {string} Formatted time string.
     */
    getFormatedTime : function ( date ) {
      date = date || new Date ( ) ; // Use current date if none is supplied.
      var h = date . getHours ( ) ,
        m = date . getMinutes ( ) ,
        s = date . getSeconds ( ) ;
      if ( h < 10 ) {
        h = "0" + h ; // Pad hour with leading zero if less than 10.
      }
      if ( m < 10 ) {
        m = "0" + m ; // Pad minute with leading zero if less than 10.
      }
      if ( s < 10 ) {
        s = "0" + s ; // Pad second with leading zero if less than 10.
      }
      return h + ":" + m + ":" + s ; // Return the formatted time string.
    } , // End of zerobin.getFormatedTime function.

    /**
     * Numeric order comparison function for sorting.
     * Used for ascending order.
     *
     * @param {number} a First number.
     * @param {number} b Second number.
     * @returns {number} The difference (a - b).
     */
    numOrdA : function ( a , b ) {
      return ( a - b ) ;
    } , // End of zerobin.numOrdA function.

    /**
     * Retrieves all keys from local storage that match the zerobin version prefix.
     * The keys are returned in reverse alphabetical order (which implies reverse chronological
     * order due to the key format).
     *
     * @returns {Array<string>} An array of matching local storage keys.
     */
    getLocalStorageKeys : function ( ) {
      // Define the prefix for keys stored by this application version.
      var version = 'zerobinV0.1' ;
      var keys = [ ] ; // Initialize an empty array to store found keys.
      for ( var key in localStorage ) {
        if ( key . indexOf ( version ) !== -1 ) {
          keys . push ( key ) ; // Add key to array if it matches the version prefix.
        }
      }
      keys . sort ( ) ; // Sort keys alphabetically.
      keys . reverse ( ) ; // Reverse the sorted order.
      return keys ; // Return the list of keys.
    } , // End of zerobin.getLocalStorageKeys function.

    /**
     * Obtains a shortened URL using the Google URL Shortener API via JSONP.
     *
     * @param {string}   longURL The original long URL to shorten.
     * @param {Function} success Callback function to execute with the shortened URL ID.
     */
    getTinyURL : function ( longURL , success ) {
      $ . ajax ( {
        url : 'https://www.googleapis.com/urlshortener/v1/url' , // Google URL Shortener API endpoint.
        type : 'POST' , // HTTP method for the request.
        contentType : 'application/json' , // Content type of the request body.
        data : JSON . stringify ( { // Request payload, containing the long URL.
          "longUrl" : longURL
        } ) ,
        processData : false , // Prevent jQuery from processing the data.
        dataType : 'json' // Expected data type of the response.
      } ) . done ( function ( data ) {
        success ( data . id ) ; // Call success callback with the shortened URL ID.
      } ) ;
    } , // End of zerobin.getTinyURL function.

    /**
     * Feature detection for various browser capabilities.
     * Stores the result and adds a corresponding class to the `<html>` element.
     */
    support : {
      // Checks for localStorage support.
      localStorage : ( function ( ) {
        var val = !! ( localStorage ) ; // Coerce localStorage object to boolean.
        $ ( 'html' ) . addClass ( ( val ? '' : 'no-' ) + 'local-storage' ) ; // Add class to HTML tag.
        return val ;
      } ) ( ) , // Immediately invoke the function.

      // Checks for HTML5 History API support.
      history : ( function ( ) {
        var val = !! ( window . history && history . pushState ) ; // Check for history object and pushState method.
        $ ( 'html' ) . addClass ( ( val ? '' : 'no-' ) + 'history' ) ; // Add class to HTML tag.
        return val ;
      } ) ( ) , // Immediately invoke the function.

      // Checks for HTML5 File API support (for file uploads).
      fileUpload : ( function ( ) {
        var w = window ;
        var val = !! ( w . File && w . FileReader && w . FileList && w . Blob ) ; // Check for necessary File API interfaces.
        $ ( 'html' ) . addClass ( ( val ? '' : 'no-' ) + 'file-upload' ) ; // Add class to HTML tag.
        return val ;
      } ) ( ) // Immediately invoke the function.
    } , // End of zerobin.support object.

    /**
     * Stores a paste URL in local storage, prefixed with the application version
     * and using the paste's creation date as part of the key.
     *
     * @param {string} url  The URL of the paste to store.
     * @param {Date}   [date] Optional Date object representing the paste's creation time.
     *                        Defaults to the current date if not provided.
     */
    storePaste : function ( url , date ) {

      date = date || new Date ( ) ; // If no date provided, use the current date/time.
      // Format the date and time for the storage key.
      date = ( date . getFullYear ( ) + '-' + ( date . getMonth ( ) + 1 ) + '-' + date . getDate ( ) + ' ' + zerobin . getFormatedTime ( date ) ) ;

      var keys = zerobin . getLocalStorageKeys ( ) ; // Get existing local storage keys.

      // If local storage is getting too full (e.g., more than 19 items), remove the oldest one.
      if ( localStorage . length > 19 ) {
        void localStorage . removeItem ( keys [ 19 ] ) ; // Remove the 20th item (index 19 in reverse sorted array).
      }

      // Store the URL with a unique key.
      localStorage . setItem ( 'zerobinV' + zerobin . version + "#" + date , url ) ;
    } , // End of zerobin.storePaste function.

    /**
     * Retrieves a list of previously stored paste URLs, along with their formatted creation dates.
     * Dates are formatted differently based on whether they are from today or an earlier date.
     *
     * @returns {Array<Object>} An array of objects, each containing displayDate, prefix, and link.
     */
    getPreviousPastes : function ( ) {
      var pastes = [ ] , // Array to hold paste objects.
        keys = zerobin . getLocalStorageKeys ( ) , // Retrieve all relevant local storage keys.
        today = zerobin . getFormatedDate ( ) ; // Get today's date in formatted string.

      $ . each ( keys , function ( i , key ) {
        var pasteDateTime = key . replace ( /^[^#]+#/ , '' ) ; // Extract date-time string from key.
        var displayDate = pasteDateTime . match ( /^(\d+)-(\d+)-(\d+)\s/ ) ; // Parse date components.
        displayDate = displayDate [ 2 ] + '-' + displayDate [ 3 ] + '-' + displayDate [ 1 ] ; // Reformat date.
        var prefix = 'the ' ; // Default prefix for older pastes.

        if ( displayDate === today ) {
          displayDate = pasteDateTime . split ( ' ' ) [ 1 ] ; // If paste is from today, show only time.
          prefix = 'at ' ; // Change prefix for today's pastes.
        }
        pastes . push ( {
          displayDate : displayDate , // Formatted date/time for display.
          prefix : prefix , // Prefix ('the' or 'at').
          link : localStorage . getItem ( key ) // The actual paste URL.
        } ) ;
      } ) ;

      return pastes ; // Return the array of paste objects.
    } , // End of zerobin.getPreviousPastes function.

    /**
     * Parses a URL string into an anchor element to easily extract its components
     * (e.g., host, protocol, hash). This uses a cached DOM element for performance
     * and compatibility with older browsers like IE.
     *
     * @returns {HTMLAnchorElement} An anchor element with the URL parsed.
     */
    parseUrl : ( function ( ) {

      var div = document . createElement ( 'div' ) ; // Create a detached div element once.
      div . innerHTML = "<a></a>" ; // Insert an anchor element into the div.

      return function ( url ) {
        div . firstChild . href = url ; // Set the href of the anchor.
        div . innerHTML = div . innerHTML ; // Force IE to re-parse the URL.
        return div . firstChild ; // Return the parsed anchor element.
      } ;

    } ) ( ) , // Immediately invoked function expression for caching the div.

    /**
     * Extracts the paste ID from a given URL or the current window's location.
     *
     * @param {string} [url] Optional URL string. Defaults to `window.location` if not provided.
     * @returns {string} The extracted paste ID.
     */
    getPasteId : function ( url ) {
      var loc = url ? zerobin . parseUrl ( url ) : window . location ; // Get location object from URL or current window.
      return loc . pathname . replace ( /\/|paste/g , '' ) ; // Remove slashes and 'paste' keyword from pathname.
    } , // End of zerobin.getPasteId function.

    /**
     * Extracts the encryption key from the hash part of a given URL or the current window's location.
     *
     * @param {string} [url] Optional URL string. Defaults to `window.location` if not provided.
     * @returns {string} The extracted encryption key.
     */
    getPasteKey : function ( url ) {
      var loc = url ? zerobin . parseUrl ( url ) : window . location ; // Get location object.
      return loc . hash . replace ( '#' , '' ) . replace ( /(\?|&).*$/ , '' ) ; // Remove '#' and any query parameters from hash.
    } , // End of zerobin.getPasteKey function.

    /**
     * Retrieves the content of the paste area, stripping any code coloration artifacts.
     *
     * @returns {string} The raw text content of the paste.
     */
    getPasteContent : function ( ) {
      var copy = '' ; // Initialize an empty string for the content.
      $ ( "#paste-content li" ) . each ( function ( index ) {
        // Iterate through list items, get text, remove non-breaking spaces, and add newline.
        copy = copy + $ ( this ) . text ( ) . replace ( /[\u00a0]+/g , ' ' ) + '\n' ;
      } ) ;
      // If no list items were found, try getting text directly from #paste-content.
      if ( copy == '' ) {
        copy = $ ( "#paste-content" ) . text ( ) ;
      }
      return copy ; // Return the aggregated content.
    } , // End of zerobin.getPasteContent function.

    /**
     * Calculates an approximate byte count for a given text string,
     * accounting for multi-byte characters and line breaks.
     *
     * @param {string} text    The text string to count.
     * @param {Object} [options] Configuration options.
     * @param {number} [options.lineBreaks=1] Weight given to line breaks.
     * @returns {number} The approximate byte count.
     */
    count : function ( text , options ) {
      // Regular expressions for detecting line breaks and whitespace.
      var crlf = /(\r?\n|\r)/g ;
      var whitespace = /(\r?\n|\r|\s+)/g ;

      // Set default options if not provided.
      options = options || { } ;
      options . lineBreaks = options . lineBreaks || 1 ;

      var length = text . length , // Total character length.
        nonAscii = length - text . replace ( /[\u0100-\uFFFF]/g , '' ) . length , // Count of non-ASCII characters.
        lineBreaks = length - text . replace ( crlf , '' ) . length ; // Count of line breaks.

      // Calculate total count, adding extra for non-ASCII characters and adjusted line breaks.
      return length + nonAscii + Math . max ( 0 , options . lineBreaks * ( lineBreaks - 1 ) ) ;
    } , // End of zerobin.count function.

    /**
     * Displays a message to the user in an alert box.
     *
     * @param {string}   type     The message type (e.g., 'success', 'error', 'info').
     * @param {string}   message  The main message content.
     * @param {string}   [title]  Optional title for the message.
     * @param {boolean}  [flush]  If true, removes existing messages of the same type before displaying.
     * @param {Function} [callback] Optional callback to execute after the message is shown.
     */
    message : function ( type , message , title , flush , callback ) {
      $ ( window ) . scrollTop ( 0 ) ; // Scroll to the top of the window to ensure message is visible.

      if ( flush ) {
        $ ( '.alert-' + type ) . remove ( ) ; // Remove any existing alerts of the same type.
      }

      // Clone the alert template and add appropriate classes.
      var $message = $ ( '#alert-template' ) . clone ( ) . attr ( 'id' , null )
        . addClass ( 'alert alert-' + type ) ;
      $ ( '.message' , $message ) . html ( message ) ; // Set the message content.

      if ( title ) {
        $ ( '.title' , $message ) . html ( title ) ; // Set the title if provided.
      } else {
        $ ( '.title' , $message ) . remove ( ) ; // Remove the title element if no title is provided.
      }

      $message . prependTo ( $ ( '#main' ) ) . show ( 'fadeUp' , callback ) ; // Add message to DOM and show it with animation.
    } , // End of zerobin.message function.

    /**
     * Creates and returns a progress bar object with methods to update its state.
     *
     * @param {string} selector A jQuery selector for the progress bar container.
     * @returns {Object} A progress bar object with `container` and `elem` properties, and a `set` method.
     */
    progressBar : function ( selector ) {
      var $container = $ ( selector ) ; // Select the progress bar container.
      var bar = {
        container : $container , // Store the container element.
        elem : $container . find ( '.bar' ) // Store the actual progress bar element.
      } ;
      /**
       * Sets the text and width (rate) of the progress bar.
       * @param {string} text The text to display inside the bar.
       * @param {string} rate The width percentage (e.g., '50%').
       */
      bar . set = function ( text , rate ) {
        bar . elem . text ( text ) . css ( 'width' , rate ) ;
      } ;
      return bar ; // Return the configured progress bar object.
    } , // End of zerobin.progressBar function.

    /**
     * Determines the likelihood that a given text string is source code.
     * It does this by counting specific code-like characters, comments, and formatting.
     *
     * @param {string} text The text content to analyze.
     * @returns {number} An integer representing the probability (higher is more likely to be code).
     */
    isCode : function ( text ) {

      // Regex for common code characters and patterns.
      var code_chars = /[A-Z]{3}[A-Z]+|\.[a-z]|[=:<>{}\[\]$_'"&]| {2}|\t/g ;
      // Regex for various comment styles (block, line, HTML).
      var comments = /(:?\/\*|<!--)(:?.|\n)*?(:?\*\/|-->)|(\/\/|#)(.*?)\n/g ;
      // Regex for common formatting lines (e.g., separators).
      var formating = /[-*=_+]{4,}/ ;

      var total = 0 ; // Counter for code-like features.
      var size = 0 ; // Total size of the text (excluding comments and formatting).
      var m = text . match ( comments ) ; // Find all comments.
      if ( m ) {
        total += text . match ( comments ) . length ; // Add comment count to total.
      }
      text = text . replace ( comments , '' ) ; // Remove comments from text for further analysis.
      text . replace ( formating , '' ) ; // Remove formatting lines.
      text = text . split ( '\n' ) ; // Split text into individual lines.
      for ( var i = 0 ; i < text . length ; i ++ ) {
        var line = text [ i ] ; // Process each line.
        size += line . length ; // Accumulate line length.
        var match = line . replace ( formating , '' ) . match ( code_chars ) ; // Find code characters in the line.
        if ( match ) {
          total += match . length ; // Add count of code characters to total.
        }
      }

      // Return a weighted score based on code features relative to text size.
      return total * 1000 / size ;
    } , // End of zerobin.isCode function.

    // Generic function to prevent default event behavior and stop propagation.
    ignoreDrag : function ( e ) {
      e . originalEvent . stopPropagation ( ) ; // Stop event bubbling.
      e . originalEvent . preventDefault ( ) ; // Prevent default browser behavior (e.g., opening file).
    } , // End of zerobin.ignoreDrag function.

    // Handler for when a file is dropped onto a designated area.
    handleDrop : function ( e ) {
      e . originalEvent . preventDefault ( ) ; // Prevent default behavior.
      zerobin . upload ( e . originalEvent . dataTransfer . files ) ; // Initiate file upload.
      $ ( "#content" ) . removeClass ( 'hover' ) ; // Remove hover class from content area.
    } , // End of zerobin.handleDrop function.

    // Handler for when an item is dragged over a designated area.
    handleDragOver : function ( e ) {
      zerobin . ignoreDrag ( e ) ; // Prevent default and stop propagation.
      $ ( this ) . addClass ( 'hover' ) ; // Add hover class to indicate drop target.
    } , // End of zerobin.handleDragOver function.

    // Handler for when an item leaves a designated drag area.
    handleDragLeave : function ( e ) {
      $ ( this ) . removeClass ( 'hover' ) ; // Remove hover class.
    } , // End of zerobin.handleDragLeave function.

    /**
     * Handles file uploads, supporting image resizing and general text file reading.
     *
     * @param {FileList} files A FileList object containing the files to upload.
     */
    upload : function ( files ) {
      var current_file = files [ 0 ] ; // Get the first file from the list.
      var reader = new FileReader ( ) ; // Create a new FileReader instance.

      // Check if the file is an image.
      if ( current_file . type . indexOf ( 'image' ) == 0 ) {
        reader . onload = function ( event ) {
          var image = new Image ( ) ; // Create a new Image object.
          image . src = event . target . result ; // Set image source to the Data URL.

          // Once the image is loaded, process it.
          image . onload = function ( ) {
            var maxWidth = 1024 , // Maximum width for the resized image.
              maxHeight = 1024 , // Maximum height for the resized image.
              imageWidth = image . width , // Original image width.
              imageHeight = image . height ; // Original image height.


            // Resize image if it exceeds max dimensions, maintaining aspect ratio.
            if ( imageWidth > imageHeight ) {
              if ( imageWidth > maxWidth ) {
                imageHeight *= maxWidth / imageWidth ; // Adjust height.
                imageWidth = maxWidth ; // Set width to max.
              }
            } else {
              if ( imageHeight > maxHeight ) {
                imageWidth *= maxHeight / imageHeight ; // Adjust width.
                imageHeight = maxHeight ; // Set height to max.
              }
            }

            var canvas = document . createElement ( 'canvas' ) ; // Create a canvas element.
            canvas . width = imageWidth ; // Set canvas width.
            canvas . height = imageHeight ; // Set canvas height.
            image . width = imageWidth ; // Update image object width.
            image . height = imageHeight ; // Update image object height.
            var ctx = canvas . getContext ( "2d" ) ; // Get 2D rendering context.
            ctx . drawImage ( this , 0 , 0 , imageWidth , imageHeight ) ; // Draw the image onto the canvas.

            var paste = canvas . toDataURL ( current_file . type ) ; // Get Base64 data URL from canvas.
            $ ( '#content' ) . val ( paste ) . trigger ( 'change' ) ; // Set textarea value and trigger change.
            $ ( '#content' ) . hide ( ) ; // Hide the original textarea.
            $ ( image ) . css ( 'max-width' , '742px' ) ; // Set max-width for the displayed image.
            $ ( '#content' ) . after ( image ) ; // Insert the image after the textarea.
          }
        }
        reader . readAsDataURL ( current_file ) ; // Read image file as a Data URL.
      } else {
        // If not an image, read as plain text.
        reader . onload = function ( event ) {
          $ ( '#content' ) . val ( event . target . result ) . trigger ( 'change' ) ; // Set textarea value to file content.
        } ;
        reader . readAsText ( current_file ) ; // Read text file content.
      }
    } // End of zerobin.upload function.
  } ; // End of window.zerobin object definition.


  /*
   ********************************************************************************
   ****                                                                        ****
   ****                   On Document Ready Event Handler                      ****
   ****                                                                        ****
   ********************************************************************************
   */


  $ ( function ( ) { /* This function executes once the DOM is fully loaded. */

    /**
     * Event handler for the 'send' button on the paste creation page.
     *
     * When the primary button is clicked, this function prevents the default form submission,
     * compresses and encrypts the paste data, and then redirects the user to the
     * newly created paste's URL, including the encryption key in the URL hash.
     *
     * @param {Event} e The click event object.
     */
    $ ( '.btn-primary' ) . live ( "click" , function ( e ) {

      e . preventDefault ( ) ; // Prevent the default action (e.g., form submission).
      var paste = $ ( 'textarea' ) . val ( ) ; // Get the content from the textarea.

      // More logic would follow here for encryption and redirection.

    } ) ; /* End of button click handler. */

  } ) ; /* End of jQuery document ready function. */

} ) ( ) ; /* End of the Immediately Invoked Function Expression (IIFE). */