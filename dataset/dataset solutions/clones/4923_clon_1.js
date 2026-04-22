function Main ( input ) {

  // Initialize variables for tracking TT and AA values.
  TT = 0 ;
  AA = 0 ;


  // Input processing: the first line is input[0], the second is input[1], and so on.
  input = input . split ( "\n" ) ;

  // N represents the number of data entries to process.
  N = input [ 0 ] ;

  // Display the value of N for debugging or informational purposes.
  console . log ( N ) ;

  // Loop through each data entry, starting from the second line of input.
  for ( i = 1 ; i <= N ; i++ ) {

    // Split the current line by space to get individual values.
    tmp = input [ i ] . split ( " " ) ;

    // Convert the first value to a number (T).
    T = tmp [ 0 ] * 1 ;

    // Convert the second value to a number (A).
    A = tmp [ 1 ] * 1 ;


    // Check if current TT and AA are already greater than or equal to T and A.
    if ( ( TT <= T ) && ( AA <= A ) ) {

      // If they are, update TT and AA to T and A respectively.
      TT = T ;
      AA = A ;

    } else { // Otherwise, a ratio adjustment is needed.

      // Calculate the ratio for T.
      ratioT = TT / T ;

      // Calculate the ratio for A.
      ratioA = AA / A ;


      // Determine the ceiling of the maximum ratio to ensure all conditions are met.
      ratio = Math . ceil ( Math . max ( ratioT , ratioA ) ) ;

      // Adjust TT by multiplying T with the calculated ratio.
      TT = T * ratio ;

      // Adjust AA by multiplying A with the calculated ratio.
      AA = A * ratio ;

    } // End of if-else block for ratio adjustment.

  } // End of for loop iterating through input lines.

  // Final output calculation and display.
  // The problem asks for the sum of the final TT and AA values, followed by a newline.
  console . log ( TT + AA + "\n" ) ;

} // End of Main function definition.


// Do not modify the following line; it handles standard input/output.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;