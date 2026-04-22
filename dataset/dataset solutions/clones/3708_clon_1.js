function       Main( input )    {
    // Split the input string into lines to get individual data
    var   NA   =   input.split( '\n' ) ;

    // Parse the first line as the integer N
    var   N    =   parseInt( NA[0] ) ;

    // Parse the second line, splitting by space and converting each part to an integer
    var   A    =   NA[1].split( ' ' ).map( n => parseInt( n ) ) ;


    // Initialize a variable for cumulative sum
    var   wa   =   0 ;

    // Calculate the cumulative sum (prefix sum) array Aruisekiwa
    var   Aruisekiwa   =   A.map(  ( n )  =>   {
        wa   +=   n ; // Add current element to the running sum
        return   wa ; // Return the updated sum for the current position
    } ) ;



    // Initialize arrays to store the four segments P, Q, R, S
    var   P   =   [ ] ; // First segment
    var   Q   =   [ ] ; // Second segment
    var   R   =   [ ] ; // Third segment
    var   S   =   [ ] ; // Fourth segment


    // --- Processing for the left partition points ---
    // This loop iterates through possible partition points for the first two segments.
    // 'i' represents the split point between Q and R (or between the second and third segments).
    for ( var   i   =   1,   l   =   0   ;   i   <   N   -   2   ;   ++i )   {
        // lwa is the cumulative sum up to index 'i', representing the end of the second segment.
        var   lwa   =   Aruisekiwa[i] ;

        // This inner while loop tries to find the optimal split point 'l' for the first two segments (P and Q).
        // It uses a greedy approach to minimize the difference between P and Q.
        while ( i   >=   2 )   {
            // Calculate the sum of P (ll) and Q (lr) with current 'l'
            var   ll   =   Aruisekiwa[l] ;
            var   lr   =   lwa   -   ll ;

            // Calculate the sum of P (llp) and Q (lrp) if 'l' is incremented by one
            var   llp   =   Aruisekiwa[l + 1] ;
            var   lrp   =   lwa   -   llp ;

            // If incrementing 'l' reduces or keeps the difference between P and Q,
            // then move 'l' forward. Otherwise, the current 'l' is optimal.
            if ( Math.abs( lrp - llp )   <=   Math.abs( lr - ll ) )   {
                ++l ; // Move the split point for P and Q
            }
            else   {
                break ; // Optimal 'l' found for this 'i'
            }
        }

        // Store the sums of the optimal P and Q segments for the current 'i'
        P.push( Aruisekiwa[l] ) ;
        Q.push( Aruisekiwa[i]   -   Aruisekiwa[l] ) ;
    }


    // --- Processing for the right partition points ---
    // This loop iterates through possible partition points for the last two segments.
    // 'i' represents the split point between Q and R (or between the second and third segments).
    // 'r' is an index offset used to calculate the split point for R and S from the end.
    for ( var   i   =   N - 2,   r   =   1   ;   i   >   1   ;   --i,   ++r )   {
        // leftEnd marks the end of the second segment (Q) which is Aruisekiwa[i-1]
        var   leftEnd   =   Aruisekiwa[i - 1] ;

        // rwa is the total cumulative sum, representing the sum of all elements.
        var   rwa   =   Aruisekiwa[N - 1] ;

        // This inner while loop tries to find the optimal split point for R and S.
        // It uses a greedy approach to minimize the difference between R and S.
        while ( i   <   N - 2 )   {
            // Calculate the sum of S (rr) and R (rl) with current 'r'
            var   rr   =   rwa   -   Aruisekiwa[i + r - 1] ;
            var   rl   =   Aruisekiwa[i + r - 1]   -   leftEnd ;

            // Calculate the sum of S (rrp) and R (rlp) if 'r' is decremented by one
            var   rrp   =   rwa   -   Aruisekiwa[i + r - 2] ;
            var   rlp   =   Aruisekiwa[i + r - 2]   -   leftEnd ;

            // If decrementing 'r' reduces or keeps the difference between R and S,
            // then move 'r' backward. Otherwise, the current 'r' is optimal.
            if ( Math.abs( rrp - rlp )   <=   Math.abs( rr - rl ) )   {
                --r ; // Move the split point for R and S
            }
            else   {
                break ; // Optimal 'r' found for this 'i'
            }
        }

        // Store the sums of the optimal R and S segments for the current 'i'.
        // unshift is used because the loop iterates 'i' downwards, so results are added to the front.
        R.unshift( Aruisekiwa[i + r - 1] - leftEnd ) ;
        S.unshift( rwa   -   Aruisekiwa[i + r - 1] ) ;
    }


    // Initialize the result with a value that ensures the first valid difference will be smaller.
    var   res   =   -1 ;

    // Iterate through all possible combinations of P, Q, R, S segments
    // (corresponding to the same 'i' split point between Q and R)
    for ( var   i   =   0   ;   i   <   P.length   ;   ++i )   {
        // Calculate the difference between the maximum and minimum sum among P[i], Q[i], R[i], S[i]
        var   curRes   =   Math.max( P[i],   Q[i],   R[i],   S[i] )   -   Math.min( P[i],   Q[i],   R[i],   S[i] ) ;

        // Update the overall minimum difference if the current one is smaller
        if ( res   <   0   ||   curRes   <   res )   {
            res   =   curRes ;
        }
    }

    // Output the final minimum difference
    console.log( res ) ;

}
Main( require( "fs" ).readFileSync( "/dev/stdin",   "utf8" ) ) ;