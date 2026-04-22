function Main ( input )
{
  // This is the main function that processes the input data.
  // The input parameter is a string containing all the input.

  // Split the input string by newline characters to get an array of lines.
  input = input.split( "\n" ) ;

  // The first line contains the initial card values, space-separated.
  // Split the first line by space to get an array of card values.
  card = input[ 0 ] .split( " " ) ;

  // Parse the initial card values as integers and store them.
  // These values will be used to reset the card array in each iteration.
  let red   =   parseInt( card[ 0 ] ) ; // Original value for card[0]
  let green =   parseInt( card[ 1 ] ) ; // Original value for card[1]
  let blue  =   parseInt( card[ 2 ] ) ; // Original value for card[2]

  // The second line contains the integer 'k', which determines the number of nested loops.
  const k   =   parseInt( input[ 1 ] ) ;

  // Initialize a flag variable 'i' to 0. It will be set to 1 if the condition is met.
  let i = 0 ;

  // Check the value of 'k' to determine which set of nested loops to execute.

  // Case for k = 1: One level of iteration.
  if ( k == 1 )
  {
    // Loop through each card index (0, 1, 2).
    for ( let x = 0 ; x < 3 ; x++ )
    {
      // Double the value of the card at index 'x'.
      card[ x ] = card[ x ] * 2 ;

      // Check if the cards are in strictly increasing order.
      if ( card[ 0 ] < card[ 1 ] && card[ 1 ] < card[ 2 ] )
      {
        // If the condition is met, set the flag 'i' to 1.
        i = 1 ;
        // Output "Yes" to the console.
        console.log( "Yes" ) ;
        // Break out of the current loop since the condition is satisfied.
        break ;
      }

      // Reset the card array to its initial 'red', 'green', 'blue' values for the next iteration.
      card[ 0 ] = red ;
      card[ 1 ] = green ;
      card[ 2 ] = blue ;
    }
    // After the loop, check the flag 'i'.
    if ( i == 1 )
    {
      // If 'i' is 1, it means "Yes" was already printed, but this redundant print is part of the original logic.
      console.log( "Yes" ) ;
    }
    else
    {
      // If 'i' is still 0, the condition was never met.
      console.log( "No" ) ;
    }
  }
  // Case for k = 2: Two levels of nested iteration.
  else if ( k == 2 )
  {
    // Outer loop for card index 'x'.
    for ( let x = 0 ; x < 3 ; x++ )
    {
      // Inner loop for card index 'y'.
      for ( let y = 0 ; y < 3 ; y++ )
      {
        // Double the values of cards at indices 'x' and 'y'.
        card[ x ] = card[ x ] * 2 ;
        card[ y ] = card[ y ] * 2 ;

        // Check if the cards are in strictly increasing order.
        if ( card[ 0 ] < card[ 1 ] && card[ 1 ] < card[ 2 ] )
        {
          // If the condition is met, set the flag 'i' to 1.
          i = 1 ;
          // Break out of the current inner loop.
          break ;
        }

        // Reset the card array to its initial 'red', 'green', 'blue' values.
        card[ 0 ] = red ;
        card[ 1 ] = green ;
        card[ 2 ] = blue ;
      }
    }
    // After all loops, check the flag 'i'.
    if ( i == 1 )
    {
      console.log( "Yes" ) ;
    }
    else
    {
      console.log( "No" ) ;
    }
  }
  // Case for k = 3: Three levels of nested iteration.
  else if ( k == 3 )
  {
    // Outer loop 'x'.
    for ( let x = 0 ; x < 3 ; x++ )
    {
      // Middle loop 'y'.
      for ( let y = 0 ; y < 3 ; y++ )
      {
        // Inner loop 'z'.
        for ( let z = 0 ; z < 3 ; z++ )
        {
          // Double the values of cards at indices 'x', 'y', and 'z'.
          card[ x ] = card[ x ] * 2 ;
          card[ y ] = card[ y ] * 2 ;
          card[ z ] = card[ z ] * 2 ;

          // Check for increasing order.
          if ( card[ 0 ] < card[ 1 ] && card[ 1 ] < card[ 2 ] )
          {
            i = 1 ;
            break ;
          }

          // Reset card values.
          card[ 0 ] = red ;
          card[ 1 ] = green ;
          card[ 2 ] = blue ;
        }
      }
    }
    // Final check for 'i'.
    if ( i == 1 )
    {
      console.log( "Yes" ) ;
    }
    else
    {
      console.log( "No" ) ;
    }
  }
  // Case for k = 4: Four levels of nested iteration.
  else if ( k == 4 )
  {
    // Loop 'x'.
    for ( let x = 0 ; x < 3 ; x++ )
    {
      // Loop 'y'.
      for ( let y = 0 ; y < 3 ; y++ )
      {
        // Loop 'z'.
        for ( let z = 0 ; z < 3 ; z++ )
        {
          // Loop 's'.
          for ( let s = 0 ; s < 3 ; s++ )
          {
            // Double the values of cards at indices 'x', 'y', 'z', and 's'.
            card[ x ] = card[ x ] * 2 ;
            card[ y ] = card[ y ] * 2 ;
            card[ z ] = card[ z ] * 2 ;
            card[ s ] = card[ s ] * 2 ;

            // Check for increasing order.
            if ( card[ 0 ] < card[ 1 ] && card[ 1 ] < card[ 2 ] )
            {
              i = 1 ;
              break ;
            }

            // Reset card values.
            card[ 0 ] = red ;
            card[ 1 ] = green ;
            card[ 2 ] = blue ;
          }
        }
      }
    }
    // Final check for 'i'.
    if ( i == 1 )
    {
      console.log( "Yes" ) ;
    }
    else
    {
      console.log( "No" ) ;
    }
  }
  // Case for k = 5: Five levels of nested iteration.
  else if ( k == 5 )
  {
    // Loop 'x'.
    for ( let x = 0 ; x < 3 ; x++ )
    {
      // Loop 'y'.
      for ( let y = 0 ; y < 3 ; y++ )
      {
        // Loop 'z'.
        for ( let z = 0 ; z < 3 ; z++ )
        {
          // Loop 's'.
          for ( let s = 0 ; s < 3 ; s++ )
          {
            // Loop 't'.
            for ( let t = 0 ; t < 3 ; t++ )
            {
              // Double the values of cards at indices 'x', 'y', 'z', 's', and 't'.
              card[ x ] = card[ x ] * 2 ;
              card[ y ] = card[ y ] * 2 ;
              card[ z ] = card[ z ] * 2 ;
              card[ s ] = card[ s ] * 2 ;
              // Note: This line in the original code seems to copy card[s]*2 to card[t], not card[t]*2 to card[t].
              // As a Type I clone, this must be preserved exactly as is.
              card[ t ] = card[ s ] * 2 ;

              // Check for increasing order.
              if ( card[ 0 ] < card[ 1 ] && card[ 1 ] < card[ 2 ] )
              {
                i = 1 ;
                break ;
              }

              // Reset card values.
              card[ 0 ] = red ;
              card[ 1 ] = green ;
              card[ 2 ] = blue ;
            }
          }
        }
      }
    }
    // Final check for 'i'.
    if ( i == 1 )
    {
      console.log( "Yes" ) ;
    }
    else
    {
      console.log( "No" ) ;
    }
  }
  // Case for k = 6: Six levels of nested iteration.
  else if ( k == 6 )
  {
    // Loop 'x'.
    for ( let x = 0 ; x < 3 ; x++ )
    {
      // Loop 'y'.
      for ( let y = 0 ; y < 3 ; y++ )
      {
        // Loop 'z'.
        for ( let z = 0 ; z < 3 ; z++ )
        {
          // Loop 's'.
          for ( let s = 0 ; s < 3 ; s++ )
          {
            // Loop 't'.
            for ( let t = 0 ; t < 3 ; t++ )
            {
              // Loop 'u'.
              for ( let u = 0 ; u < 3 ; u++ )
              {
                // Double the values of cards at indices 'x', 'y', 'z', 's', 't', and 'u'.
                card[ x ] = card[ x ] * 2 ;
                card[ y ] = card[ y ] * 2 ;
                card[ z ] = card[ z ] * 2 ;
                card[ s ] = card[ s ] * 2 ;
                // Note: This line in the original code seems to copy card[s]*2 to card[t].
                card[ t ] = card[ s ] * 2 ;
                card[ u ] = card[ u ] * 2 ;

                // Check for increasing order.
                if ( card[ 0 ] < card[ 1 ] && card[ 1 ] < card[ 2 ] )
                {
                  i = 1 ;
                  break ;
                }

                // Reset card values.
                card[ 0 ] = red ;
                card[ 1 ] = green ;
                card[ 2 ] = blue ;
              }
            }
          }
        }
      }
    }
    // Final check for 'i'.
    if ( i == 1 )
    {
      console.log( "Yes" ) ;
    }
    else
    {
      console.log( "No" ) ;
    }
  }
  // Case for k = 7: Seven levels of nested iteration.
  else if ( k == 7 )
  {
    // Loop 'x'.
    for ( let x = 0 ; x < 3 ; x++ )
    {
      // Loop 'y'.
      for ( let y = 0 ; y < 3 ; y++ )
      {
        // Loop 'z'.
        for ( let z = 0 ; z < 3 ; z++ )
        {
          // Loop 's'.
          for ( let s = 0 ; s < 3 ; s++ )
          {
            // Loop 't'.
            for ( let t = 0 ; t < 3 ; t++ )
            {
              // Loop 'u'.
              for ( let u = 0 ; u < 3 ; u++ )
              {
                // Loop 'v'.
                for ( let v = 0 ; v < 3 ; v++ )
                {
                  // Double the values of cards at indices 'x', 'y', 'z', 's', 't', 'u', and 'v'.
                  card[ x ] = card[ x ] * 2 ;
                  card[ y ] = card[ y ] * 2 ;
                  card[ z ] = card[ z ] * 2 ;
                  card[ s ] = card[ s ] * 2 ;
                  // Note: This line in the original code seems to copy card[s]*2 to card[t].
                  card[ t ] = card[ s ] * 2 ;
                  card[ u ] = card[ u ] * 2 ;
                  // Note: This line in the original code seems to copy card[u]*2 to card[v].
                  card[ v ] = card[ u ] * 2 ;

                  // Check for increasing order.
                  if ( card[ 0 ] < card[ 1 ] && card[ 1 ] < card[ 2 ] )
                  {
                    i = 1 ;
                    break ;
                  }

                  // Reset card values.
                  card[ 0 ] = red ;
                  card[ 1 ] = green ;
                  card[ 2 ] = blue ;
                }
              }
            }
          }
        }
      }
    }
    // Final check for 'i'.
    if ( i == 1 )
    {
      console.log( "Yes" ) ;
    }
    else
    {
      console.log( "No" ) ;
    }
  }
} // End of Main function.


// *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;