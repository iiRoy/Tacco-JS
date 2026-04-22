( function () {

    // Enable strict mode for better error handling and cleaner code.
    'use strict' ;

    // Initialize an array to store input lines.
    var lines = [ ] ;

    // Set up the readline interface to process input from stdin.
    require ( 'readline' ) . createInterface ( {
        input   :   process . stdin ,   // Standard input stream.
        output  :   process . stdout    // Standard output stream.
    } )
    . on ( 'line' , function ( line ) {
        // Callback function executed for each line read from input.
        lines . push ( line ) ;
    } ) ;

    // Attach an event listener for the 'end' event on the standard input stream.
    process . stdin . on ( 'end' , function ( ) {

        // The following block was commented out in the original code,
        // and is kept as is, with only whitespace and comment changes.
        /*
        lines . forEach ( function ( line ) {
            var tokens = line . split ( ' ' ) . map ( Number ) ;
            console . log ( tokens [ 0 ] + ' ' + tokens [ 1 ] ) ;
        } ) ;
        */
        ; // This semicolon was present and is retained.

        // --- Start of the main problem-solving logic ---

        // Parse the first line of input to get N, Z, and W.
        var inLines = lines [ 0 ] . split ( " " ) ;
        var N = parseInt ( inLines [ 0 ] ) ; // Number of cards.
        var Z = parseInt ( inLines [ 1 ] ) ; // Player Z's initial score.
        var W = parseInt ( inLines [ 2 ] ) ; // Player W's initial score.

        // Parse the second line of input to get the array A.
        var A = lines [ 1 ] . split ( " " ) ;

        // Declare variables for scores of players X and Y (or the last card values).
        var X ;
        var Y ;

        // Convert elements of array A from strings to integers.
        for ( var i = 0 ; i < N ; i ++ ) {
            A [ i ] = parseInt ( A [ i ] ) ;
        }

        // --- Core logic for determining the optimal score ---

        // The problem implies that the game's outcome might be determined by the last few cards.
        // Consider the scenario where player X takes the very last card.
        // In this case, X's score would be the value of the last card, and Y's score would be W.
        X = A [ N - 1 ] ; // X takes the last card.
        Y = W ;           // Y's score remains W.
        var score1 = Math . abs ( X - Y ) ; // Calculate the absolute difference.
        // console.log ( "Score 1 (X takes last card): " + score1 ) ; // Debugging line (commented out).

        // Now, consider the scenario where player Y takes the last card.
        // This implies X took the second to last card.
        // So, X's score would be the second to last card, and Y's score would be the last card.
        X = A [ N - 2 ] ; // X takes the second-to-last card.
        Y = A [ N - 1 ] ; // Y takes the last card.
        var score2 = Math . abs ( X - Y ) ; // Calculate the absolute difference.
        // console.log ( "Score 2 (Y takes last card): " + score2 ) ; // Debugging line (commented out).

        // The final answer is the maximum of these two possible scores,
        // representing the optimal strategy for the players.
        var ans = Math . max ( score1 , score2 ) ;

        // Output the calculated maximum score.
        console . log ( ans ) ;

        // --- Further commented-out/unused logic from original code ---
        /*
        for ( var i = 0 ; i < A . length ; i ++ ) {
            var getX = A [ i ] ;
            var getY = Math . max ( A . slice ( i + 1 , A . length - 1 ) ) ;
        }
        */

        // Another commented line, possibly for a different problem or calculation.
        // console.log ( Math . pow ( parseInt ( lines [ 0 ] ) , 2 ) - parseInt ( lines [ 1 ] ) ) ;

        // --- End of the main problem-solving logic ---

    } ) ; // End of the 'end' event listener.

} ) ( ) ; // Immediately Invoked Function Expression (IIFE) closure.