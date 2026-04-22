function Main( input ) {
    // The Main function takes the raw input string.

    // First, we split the input string by newline characters.
    // This typically separates different lines of input data.
    input = input.split( "\n" );


    // The first line of input is assigned to the constant 's'.
    const s = input[ 0 ];

    // The second line of input is assigned to the constant 't'.
    const t = input[ 1 ];


    // Initialize an empty array called 'match'.
    // This array will store boolean values indicating whether a substring match occurs.
    const match = [];


    // We iterate through the string 's' using a for loop.
    // The loop variable 'i' represents the starting index for potential matches.
    for ( i = 0; i < s.length; i++ ) {

        // Construct a temporary string by concatenating 's' and 't'.
        // This allows us to check for matches that wrap around the end of 's'.
        // We then slice this temporary string from index 'i' for a length equal to 't'.
        // If this sliced substring is exactly equal to 't', it means a match is found.
        if ( ( s + t ).slice( i, i + t.length ) == t ) {
            // If a match is found, we push 'true' into our 'match' array.
            match.push( true );
        } else {
            // If no match is found, we push 'false' into the 'match' array.
            match.push( false );
        }
    }


    // Initialize a variable 'max' to 0.
    // This variable will store the maximum length of the sequence of matches found.
    max = 0;


    // Begin the second main loop, also iterating through each character position in 's'.
    // This loop attempts to find the longest chain of consecutive matches.
    for ( i = 0; i < s.length; i++ ) {

        // Initialize a boolean flag 'isInf' to false.
        // This flag will help us detect if an infinite loop (cycle) of matches occurs.
        isInf = false;

        // Set 'now' to the current starting index 'i'.
        // 'now' tracks the current position in the sequence of matches.
        now = i;

        // Initialize an empty array 'getted'.
        // This array will store the indices already visited in the current sequence to detect cycles.
        getted = [];


        // Start a while loop that continues as long as 'match[now]' is true.
        // This means we are finding consecutive matches from the current position 'now'.
        while ( match[ now ] ) {
            // Add the current position 'now' to the list of visited positions.
            getted.push( now );

            // Calculate the next position in the sequence.
            // We advance by the length of 't' and use the modulo operator to wrap around 's.length'.
            now = ( now + t.length ) % s.length;

            // Check if the newly calculated 'now' position has already been visited in 'getted'.
            if ( getted.indexOf( now ) != -1 ) {
                // If it has been visited, an infinite loop (cycle) is detected.
                isInf = true;
                break; // Exit the inner while loop.
            }
        }


        // After the inner while loop finishes, check the 'isInf' flag.
        if ( isInf ) {
            // If an infinite loop was detected, set 'max' to -1.
            // This indicates that there is no finite maximum length.
            max = -1;
            break; // Exit the outer for loop immediately, as the result is determined.
        } else {
            // If no infinite loop was detected, compare the length of the current sequence ('getted.length')
            // with the current maximum ('max').
            if ( max < getted.length ) {
                // If the current sequence is longer, update 'max'.
                max = getted.length;
            }
        }
    }

    // Finally, print the calculated maximum length to the console.
    console.log( max );
}

// This line handles the execution of the script in a typical competitive programming environment.
// It reads the entire content of standard input as a UTF-8 string and passes it to the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );