( function ( $ )
{
  "use strict" ; /* Enable strict mode for cleaner code */

  /*
   * Extends the String prototype to allow repeating a string.
   * @summary Takes a string and repeats it "num" times.
   * @param {Number} num - The number of times to repeat the string.
   * @returns {String} - The repeated string.
   * Example: 'a'.repeat(3) returns 'aaa'
   */
  String . prototype . repeat = function ( num ) {
    return new Array( num + 1 ) . join ( this ) ;
  } ;


  // This method removes duplicate elements from an array.
  // @returns {Array} A new array with unique elements.
  Array . prototype . unique = function ( )
  {
    var a , // Temporary array for processing
        i , // Outer loop counter
        j ; // Inner loop counter

    a = this . concat ( ) ; // Create a shallow copy of the array
    for ( i = 0 ; i < a . length ; ++ i )
    {
      for ( j = i + 1 ; j < a . length ; ++ j )
      {
        if ( a [ i ] === a [ j ] )
        {
          a . splice ( j , 1 ) ; // Remove the duplicate element
        }
      }
    }

    return a ; // Return the array with unique elements
  } ;


  /* Default configuration options for the profanity filter plugin. */
  var defaults = {
    replaceWith : '*' ,      // Character used for replacement
    customSwears : null ,    // User-defined list of swear words
    externalSwears : null    // URL for an external JSON file of swear words
  } ;


  /*
   * jQuery plugin to filter profanity within the selected elements.
   * @param {Object} settings - User-provided settings to override defaults.
   * @returns {jQuery} - The jQuery object for chaining, with profanity filtered text.
   */
  $ . fn . profanityFilter = function ( settings )
  {

    var options = $ . extend ( { } , defaults , settings ) , // Merge default and user settings
        localStorageIsEnabled ; // Flag to check localStorage availability

    localStorageIsEnabled = ( function ( ) { // Immediately-invoked function expression to check localStorage
      var uid = new Date ( ) , // Unique ID for testing
          result ; // Holds the test result

      try {
        localStorage . setItem ( "uid" , uid ) ; // Attempt to set an item
        result = ( localStorage . getItem ( "uid" ) === uid ) ; // Check if it was set correctly
        localStorage . removeItem ( "uid" ) ; // Clean up the test item
        return result && localStorage ; // Return true if successful and localStorage object
      } catch ( e ) {
        /* Error occurred, localStorage is likely not available or accessible. */
      }
    } ) ( ) ; // Execute the function immediately


    function allTextNodes ( parent ) { // Function to retrieve all text nodes within a given parent element
      function getChildNodes ( parent ) { // Helper function to get direct child nodes
        var x ,
            out = [ ] ;

        for ( x = 0 ; x < parent . childNodes . length ; x += 1 ) {
          out [ x ] = parent . childNodes [ x ] ; // Add each child node to the output array
        }

        return out ; // Return the array of child nodes
      }

      var cursor , // Current node being processed
          closed = [ ] , // Array to store text nodes
          open = getChildNodes ( parent ) ; // Nodes to be processed, starting with direct children

      // Traverse the DOM tree
      while ( open . length ) { // While there are nodes left to process
        cursor = open . shift ( ) ; // Get the next node from the front of the queue
        if ( cursor . nodeType === 1 ) { // If it's an element node
          open . unshift . apply ( open , getChildNodes ( cursor ) ) ; // Add its children to the front of the queue
        }
        if ( cursor . nodeType === 3 ) { // If it's a text node
          closed . push ( cursor ) ; // Store it in the closed array
        }
      }
      return closed ; // Return all found text nodes
    }


    /*
     * Reads a JSON file synchronously from a given URL.
     * @param {String} file - The URL of the JSON file.
     * @returns {Object|String} - The parsed JSON object or an empty string if an error occurs.
     */
    function readJsonFromController ( file )
    {
      var request = new XMLHttpRequest ( ) ; // Create a new XMLHttpRequest object
      request . open ( 'GET' , file , false ) ; // Open a synchronous GET request
      request . setRequestHeader ( 'X-Requested-With' , 'XMLHttpRequest' ) ; // Set request header
      request . send ( null ) ; // Send the request
      try {
        return JSON . parse ( request . responseText ) ; // Parse and return the JSON response
      } catch ( e ) {
        // console.error("Error parsing JSON from " + file + ":", e); // Debugging comment
        return '' ; // Return empty string on parsing error
      }
    }


    var lastRandomNumber = null ; // Stores the previously generated random number.

    /**
     * Generates a random number within a specified maximum, avoiding repetition of the last number if possible.
     * @param {Number} max - The exclusive upper bound for the random number.
     * @returns {Number} - The generated random number.
     */
    function generateRandomNumber ( max )
    {
      var randomNumber = Math . floor ( ( Math . random ( ) * ( max ) ) ) ; // Generate a random number between 0 (inclusive) and max (exclusive)

      if ( lastRandomNumber == null ) { // If this is the first number generated
        lastRandomNumber = randomNumber ;
      } else {
        // Prevent immediate repetition if max allows for it
        if ( ( randomNumber == lastRandomNumber ) && ( max != 0 ) ) {
          randomNumber += 1 ; // Increment to get a different number
        }
      }

      if ( randomNumber > max ) {
        // If incrementing caused it to exceed max, wrap it around to 0
        randomNumber = 0 ;
      }

      lastRandomNumber = randomNumber ; // Update the last generated number

      return randomNumber ; // Return the result
    }


    return this . each ( function ( ) { // Iterate over each selected element

      var badWords , // Array to hold the list of profanity words
          i ,        // Loop counter for badWords
          nodes = allTextNodes ( this ) , // All text nodes within the current element
          re ,       // Regular expression for matching swear words
          rep ,      // Replacement string for the matched swear word
          x ;        // Loop counter for text nodes

      // Determine the list of bad words based on options
      if ( options . externalSwears !== null ) { // If external swears are specified
        if ( localStorageIsEnabled ) { // Check if localStorage can be used
          if ( localStorage . getItem ( 'localSwears' ) === null ) {
            /* Store the external swears in localStorage to avoid repeated AJAX requests. */
            localStorage . setItem ( 'localSwears' , JSON . stringify ( readJsonFromController ( options . externalSwears ) ) ) ;
          }
          badWords = JSON . parse ( localStorage . getItem ( 'localSwears' ) ) ; // Retrieve from localStorage
        } else {
          badWords = readJsonFromController ( options . externalSwears ) ; // Fetch directly if no localStorage
        }
        if ( options . customSwears !== null ) {
          // Combine external and custom swears, ensuring uniqueness
          badWords = badWords . concat ( options . customSwears ) . unique ( ) ;
        }
      } else {
        if ( options . customSwears !== null ) {
          badWords = options . customSwears ; // Use only custom swears if no external ones
        }
      }

      // If no swear words are defined, there's nothing to filter.
      if ( badWords === null ) {
        return ; // Exit the function for this element
      }

      // Proceed with filtering if swear words are available.
      /* Iterate through all identified text nodes and apply the filter. */
      for ( x = 0 ; x < nodes . length ; x += 1 ) {
        for ( i = 0 ; i < badWords . length ; i += 1 ) {
          re = new RegExp ( '\\b' + badWords [ i ] + '\\b' , 'gi' ) ; // Create regex for the current bad word

          var rand = generateRandomNumber ( options . replaceWith . length - 1 ) ; // Generate a random index for replacement character

          rep = options . replaceWith [ rand ] ; // Get the replacement character
          if ( typeof options . replaceWith == 'string' ) {
            // If replaceWith is a string (e.g., '*'), repeat the chosen character for the length of the swear word
            rep = options . replaceWith [ rand ] . repeat ( badWords [ i ] . length ) ;
          }
          if ( re . test ( nodes [ x ] . nodeValue ) ) {
            nodes [ x ] . nodeValue = nodes [ x ] . nodeValue . replace ( re , rep ) ; // Replace the swear word in the text node
          }
        }
      }
    } ) ; // End of this.each callback
  } ; // End of $.fn.profanityFilter definition
} ) ( jQuery ) ; // End of IIFE, passing jQuery as $