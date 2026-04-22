/*
 * This JavaScript code processes input from standard input.
 * It's designed to read lines of data and perform specific
 * calculations based on the content.
 */


// Resumes the standard input stream.
process . stdin . resume ( ) ;


// Sets the encoding for standard input to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;


/*
 * This is the primary event handler for incoming data.
 * It's triggered whenever new data chunks are available
 * from the standard input stream.
 */
process . stdin . on (
  'data' ,
  function ( input )
  {
    // Splits the incoming input string by newline characters
    // to get an array of individual data lines.
    var data = input.split ( "\n" ) ;

    // The main processing loop. It continues as long as the
    // first element of the 'data' array is not '0'.
    while ( data [ 0 ] != 0 )
    {

      // Extracts the first 5 elements from the 'data' array,
      // which represent a 'unit' of processing.
      var unit = data . splice ( 0 , 5 ) ;


      // Declares 'result' variable (to store computed outcome)
      // and 'te' array (to store unique elements within the 'unit').
      var result , te = [ ] ;


      /*
       * Iterates over each value 'v' in the current 'unit'.
       * This loop populates the 'te' array with unique values
       * from the 'unit'.
       */
      unit . forEach (
        function ( v )
        {
          // If the current value 'v' is not already present
          // in the 'te' array, add it.
          if ( te . indexOf ( v ) < 0 )
          {
            te . push ( v ) ;
          }
        }
      ) ;

      /*
       * Determines the 'result' based on the number of unique
       * elements found in the 'te' array.
       * This is a conditional block.
       */
      if ( te . length == 3 || te . length == 1 )
      {
        // If there are 3 or 1 unique elements, set result to [3,3,3].
        result = [ 3 , 3 , 3 ] ; // This is the 'aiko' case, as per original comment.
      }
      else
      {
        // If the number of unique elements is not 3 or 1,
        // further checks are performed based on missing elements.

        // If '1' is not found in the unique elements.
        if ( te . indexOf ( 1 ) < 0 )
        {
          result = [ 1 , 2 , 0 ] ;
        }
        // Else if '2' is not found in the unique elements.
        else if ( te . indexOf ( 2 ) < 0 )
        {
          result = [ 2 , 0 , 1 ] ;
        }
        // Else if '3' is not found in the unique elements.
        else if ( te . indexOf ( 3 ) < 0 )
        {
          result = [ 0 , 1 , 2 ] ;
        }
      }


      /*
       * After determining the 'result' array, this loop
       * iterates through each value 'v' in the 'unit' again.
       * It then prints an element from the 'result' array
       * to the console, using 'v-1' as the index.
       */
      unit . forEach (
        function ( v )
        {
          console . log ( result [ v - 1 ] ) ;
        }
      ) ;
    }
  }
) ;


/*
 * This event handler is triggered when the standard input
 * stream signals that there is no more data to read.
 * In this specific implementation, it does nothing.
 */
process . stdin . on (
  'end' ,
  function ( )
  {
    // No action required upon end of input.
  }
) ;