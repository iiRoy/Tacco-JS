/*
 * This is a Type I clone of the original JavaScript code.
 * All variable names, function names, operators, and expressions
 * are preserved exactly as in the source.
 * Only whitespace (indentation, line breaks, spaces)
 * and comments have been altered to create a visually distinct,
 * yet functionally identical, version.
 */
( function( document ) { /* Start of the Immediately Invoked Function Expression (IIFE) */

  // Flag to track if the Shift key is currently pressed.
  var shiftKeyPress = false;

  /*
   * Define key codes for specific keyboard keys.
   * These are standard JavaScript key codes.
   */
  var KEYS = {
    SPACE :   32  , // Key code for the spacebar
    SHIFT :   16  // Key code for the Shift key
  } ;


  // Array to store "next" words fetched from the extension.
  var nextwords = [ ] ;

  // Send a request to the Chrome extension background script
  // to get a list of "next" words for navigation.
  chrome . extension . sendRequest ( { name: "getNextWords" } ,

    /* Callback function executed when the extension responds. */
    function( response ) {

      // The response contains a string of words, likely newline-separated.
      var str = response . nextwords ;

      // Get the length of the response string.
      var len = str . length ;

      // Temporary variable to build each word.
      var word = "" ;

      // Index for the `nextwords` array.
      var j = 0 ;

      // Loop through the response string character by character.
      for ( var i = 0 ; i < len ; i++ ) {

        // If a newline character is encountered, a word has ended.
        if ( str[i] == "\n" ) {

          // Store the completed word in the `nextwords` array.
          nextwords[j] = word ;

          // Increment the array index.
          j++ ;

          // Reset the word buffer for the next word.
          word = "" ;

          // Continue to the next character in the string.
          continue ;
        }

        // Append the current character to the word buffer.
        word += str[i] ;
      }

      // Add an event listener for keydown events on the document.
      document . addEventListener ( "keydown" , function ( e ) {

        // Check if the currently active element is an input field or textarea.
        // If so, we don't want to interfere with user input, so return early.
        if ( document . activeElement . tagName == "INPUT" || document . activeElement . tagName == "TEXTAREA" ) {
          return ;
        }

        // Calculate scroll position and document height to determine if at the bottom.
        var scroll = Math . max ( document . documentElement . scrollTop , document . body . scrollTop ) ;
        var height = Math . max ( document . documentElement . scrollHeight , document . body . scrollHeight ) ;
        var clientHeight = Math . min ( document . documentElement . clientHeight , document . body . clientHeight ) ;

        // If the user is not at the very bottom of the page, do nothing.
        // This prevents accidental navigation while scrolling.
        if ( height > ( scroll + clientHeight ) ) {
          return ;
        }

        // Handle different key presses using a switch statement.
        switch ( e . keyCode ) {

          // Case for the Space key.
          case KEYS . SPACE :
            // Only trigger `loadNext` if Shift is NOT pressed.
            if ( ! shiftKeyPress ) {
              loadNext ( ) ; // Call the function to navigate to the next page.
            }
            break ;

          // Case for the Shift key.
          case KEYS . SHIFT :
            shiftKeyPress = true ; // Set the flag that Shift is pressed.
            break ;

          // Default case for any other key.
          default :
            break ;
        }
      } ) ;

      // Add an event listener for keyup events on the document.
      document . addEventListener ( "keyup" , function ( e ) {

          // Again, check if the active element is an input or textarea.
          // If so, return to avoid interfering.
          if ( document . activeElement . tagName == "INPUT" || document . activeElement . tagName == "TEXTAREA" ) {
            return ;
          }

          // Handle key releases.
          switch ( e . keyCode ) {

            // Case for the Shift key release.
            case KEYS . SHIFT :
              shiftKeyPress = false ; // Reset the flag when Shift is released.
              break ;

            // Default case for any other key release.
            default :
              break ;
          }
      } ) ;

      /*
       * Function to find and navigate to the "next" page link.
       * It looks for <link rel="next"> tags and <a> tags
       * containing "next" related words.
       */
      function loadNext ( ) {
        // Get all <link> tags in the document.
        var linkTags = document . getElementsByTagName ( "link" ) ;
        var linkTagNum = linkTags . length ;

        // Iterate through all <link> tags.
        for ( var i = 0 ; i < linkTagNum ; i++ ) {
          // Check if the current link tag is a "next" link.
          if ( isNextLink ( linkTags[i] ) ) {
            // If it is, navigate to its href and stop.
            document . location . href = linkTags[i] . getAttribute ( "href" ) ;
          }
        }

        // Get all <a> (anchor) tags in the document.
        var aTags = document . getElementsByTagName ( "a" ) ;
        var aTagNum = aTags . length ;

        // Iterate through all <a> tags.
        for ( i = 0 ; i < aTagNum ; i++ ) {
          // Check if the current anchor tag is a "next" tag based on its text content.
          if ( isNextTag ( aTags[i] ) ) {
            // If it is, navigate to its href and stop.
            document . location . href = aTags[i] . getAttribute ( "href" ) ;
          }
        }
      }

      /*
       * Helper function to determine if a <link> tag represents the "next" page.
       * @param {HTMLElement} tag - The <link> element to check.
       * @returns {boolean} - True if it's a "next" link, false otherwise.
       */
      function isNextLink ( tag ) {
        var rel = tag . getAttribute ( "rel" ) ;
        // Check if the 'rel' attribute exists and its lowercase value is "next".
        return ( rel != null && rel . toLowerCase ( ) == "next" ) ;
      }

      /*
       * Helper function to determine if an <a> tag represents the "next" page.
       * It checks if the tag's text content contains any of the predefined "next" words.
       * @param {HTMLElement} tag - The <a> element to check.
       * @returns {boolean} - True if it's a "next" tag, false otherwise.
       */
      function isNextTag ( tag ) {
        var len = nextwords . length ;

        // First, check against the custom "next" words fetched from the extension.
        for ( var i = 0 ; i < len ; i++ ) {
          if ( tag . textContent . indexOf ( nextwords[i] ) >= 0 ) {
            return true ;
          }
        }

        // If no match found, check against a default list of "next" words.
        // (Assuming DefaultNextWords is defined elsewhere or will be present).
        len = DefaultNextWords . length ;
        for ( var i = 0 ; i < len ; i++ ) {
          if ( tag . textContent . indexOf ( DefaultNextWords[i] ) >= 0 ) {
            return true ;
          }
        }

        // If no "next" word is found in the tag's text content, return false.
        return false ;
      }
    }
  ) ; // End of chrome.extension.sendRequest callback.

} ) ( document ) ; // End of IIFE, passing 'document' as an argument.