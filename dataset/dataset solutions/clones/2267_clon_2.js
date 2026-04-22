/*
 * This JavaScript module is designed to process incoming textual data.
 * It's structured to pinpoint a specific musical track within a list
 * and then sum the playback durations of all tracks that follow it.
 */
function ProcessInputData( rawData )
{

	// The entire raw input is given as a single string.
	// We first segment it into an array of strings, one for each line.
	var linesOfText = rawData.split( '\n' );

	// The very first line in the input specifies the total quantity of tracks.
	// This value is parsed as a base-10 integer to represent the count.
	var trackCount = parseInt( linesOfText[0], 10 );

    // The name of the particular song we are searching for is found
    // at an index corresponding to `trackCount + 1` in the `linesOfText` array.
    var targetTuneName = linesOfText[trackCount + 1];

    // A variable initialized to zero, which will accumulate the total time
    // of subsequent tracks once the target tune is located.
    var totalDuration = 0;

	// Begin an iteration from the first actual track entry (index 1)
	// up to the total number of tracks specified by `trackCount`.
	for ( var idx = 1; idx <= trackCount; idx++ )
    {
    	// Each line representing a track contains its title and duration,
    	// separated by a space. This line is split into an array.
    	var currentTrackInfo = linesOfText[idx].split( ' ' );

        // The title of the current track is the first element in its info array.
        var trackTitle = currentTrackInfo[0];

        // We check if the title of the track we are currently examining
        // matches the specific tune we are looking for.
        if ( trackTitle === targetTuneName )
        {
          // If the target track is identified, we proceed to sum the durations
          // of all tracks that appear *after* it in the list.
          // This nested loop starts from the track immediately following the found one.
          for ( var subIdx = idx + 1; subIdx <= trackCount; subIdx++ )
          {
            // Similar to the outer loop, parse the information for each subsequent track.
            var subsequentTrackInfo = linesOfText[subIdx].split( ' ' );

        	// The duration for this subsequent track is the second element
        	// in its parsed information, converted into a numerical value.
        	var trackPlaybackTime = Number( subsequentTrackInfo[1] );

            // Add this track's duration to our running total.
            totalDuration += trackPlaybackTime;
          }
          // After processing all subsequent tracks and summing their durations,
          // the accumulated total is printed to the console, and the function terminates.
          return console.log( totalDuration );
        }
    }
}
/* This concluding segment should remain untouched. It handles the standard input/output operations and invokes the primary processing function. */
ProcessInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );