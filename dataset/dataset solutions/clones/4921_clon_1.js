function Main( input ) {

    // Initialize the running totals for T and A components.
    TT = 0 ;
    AA = 0 ;

    // The input string is typically multiline,
    // so we split it into an array of lines.
    input = input . split ( "\n" ) ;

    // The first line of input specifies the number of data entries (N).
    N = input [ 0 ] ;

    // The following loop iterates N times, processing each data entry.
    for ( i = 1 ; i <= N ; i++ ) {

        // Each subsequent line contains two values, T and A, separated by a space.
        tmp = input [ i ] . split ( " " ) ;

        // Parse T and A as numbers. The '* 1' is a common JavaScript idiom for type coercion.
        T = tmp [ 0 ] * 1 ;
        A = tmp [ 1 ] * 1 ;

        // This block implements the core logic for updating TT and AA.
        // If the current T and A values are both greater than or equal to
        // the running totals (TT, AA), we simply update TT and AA to T and A.
        if ( ( TT <= T ) && ( AA <= A ) ) {

            TT = T ;
            AA = A ;

        } else {

            // If the condition in the 'if' block is not met, we need to
            // calculate a 'ratio' to scale up T and A to satisfy the condition.
            ratioT = TT / T ;
            ratioA = AA / A ;

            // We find the maximum of the two ratios and then round it up to the nearest integer.
            // This ensures that when T and A are multiplied by 'ratio',
            // they will be at least TT and AA respectively.
            ratio = Math . ceil ( Math . max ( ratioT , ratioA ) ) ;

            // Update TT and AA by multiplying the current T and A by the calculated ratio.
            TT = T * ratio ;
            AA = A * ratio ;

        } // End of if-else block for ratio calculation

    } // End of for loop iterating through N data entries

    // After processing all input lines, output the sum of the final TT and AA values.
    console . log ( TT + AA ) ;

} // End of the Main function definition

// * This line and anything below it should not be modified.
// * It handles reading input from standard in and calling the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;