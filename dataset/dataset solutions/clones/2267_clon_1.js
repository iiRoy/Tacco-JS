// This script processes song data from standard input.
// The primary function is Main, which handles all the logic.


function Main (   input   ) {

    // The input data is a single string. We split it into an array of lines.
    input = input.split ( "\n" ) ;


    // The first line contains the total number of songs to process.
    // We convert this string to a number.
    var num = Number ( input [ 0 ] ) ;


    // The song name to look for (the 'sleep song') is found at a specific index.
    // This index is derived from 'num'.
    var sleepSong = input [ num + 1 ] ;


    // Initialize a variable to accumulate the total time.
    var time = 0 ;


    // Iterate through the input lines, starting from the first song entry.
    // The loop runs from index 1 up to 'num' (inclusive).
    for ( var i = 1 ;   i <= num ;   i ++ ) {

        // Each song entry is a line, which we split by space to get song name and duration.
        var current = input [ i ] . split ( ' ' ) ;

        // The song name is the first part of the split line.
        var currentSong = current [ 0 ] ;


        // Check if the current song matches the designated 'sleep song'.
        if ( currentSong === sleepSong ) {

            // If a match is found, we need to sum the durations of all subsequent songs.
            // This inner loop starts from the song immediately after the current one.
            for ( var j = i + 1 ;   j <= num ;   j ++ ) {

                // Split the subsequent song line to extract its components.
                var current = input [ j ] . split ( ' ' ) ;

                // The duration (time) of the current subsequent song is the second part, converted to a number.
                var currentSongTime = Number ( current [ 1 ] ) ;

                // Add this song's duration to the total time.
                time += currentSongTime ;

            } // End of inner loop for summing times.


            // Once the sleep song is found and subsequent times are summed,
            // we print the total time and exit the function.
            return console . log ( time ) ;

        } // End of if condition for matching sleep song.

    } // End of outer loop iterating through songs.

} // End of Main function definition.


/*
 * This section of the code is boilerplate for reading input in a specific environment.
 * It should not be modified to ensure the script functions correctly with standard input/output.
 * It reads the entire standard input and passes it to the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;