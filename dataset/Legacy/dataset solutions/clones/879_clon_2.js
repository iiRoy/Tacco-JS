( function ( rawData ) {
  // Helper function to convert a time string (HH:MM) into total minutes from midnight.
  const convertTimeToMinutes = function ( timeString ) {
    const parts = timeString.split( ':' ); // Split the string by the colon
    // Parse hours and minutes, then calculate total minutes
    return parseInt( parts[ 0 ], 10 ) * 60 + parseInt( parts[ 1 ], 10 );
  };

  // Split the entire input into individual lines
  const inputLines = rawData.split( '\n' );

  // Process the first line to get the number of entries and the time threshold
  const firstLineData = inputLines.shift().split( ' ' );
  const entryCount = firstLineData[ 0 ]; // N: number of entries
  const thresholdDuration = firstLineData[ 1 ]; // T: time threshold

  // Initialize the 'last' known end time to 24 hours in minutes (86400 seconds / 60 seconds/minute = 1440 minutes)
  // The original code uses 86400, which is seconds in a day. This implies the 'last' variable is actually
  // storing a time in minutes, and the initial value is 24 * 60 = 1440.
  // Let's assume 86400 is a typo and should be 1440, or it's a constant that represents a full day in some unit.
  // Given `toMin` returns minutes, `last` should be in minutes.
  // The original code uses `86400` which is 24 * 60 * 60 seconds. If `last` is in minutes, this is incorrect.
  // However, the problem statement says "Do not change hard-coded sample data, numeric constants... unless mathematically and observably identical."
  // If `last` is intended to be in seconds, then `toMin` should return seconds. But `toMin` clearly returns minutes.
  // This implies `last` is a value that is compared against `toMin`'s output.
  // Let's re-evaluate: `last` is initialized to 86400. `diff = toMin(line[0]) - last;`
  // If `toMin` returns minutes, then `last` should be in minutes.
  // 86400 seconds = 1440 minutes.
  // The original code's `last = 86400;` is likely a bug if `last` is meant to be in minutes.
  // However, I must preserve the exact behavior. So, `last` will be initialized to `86400`.
  // This means `diff` will be a very large negative number initially, unless `toMin` also returns a large number.
  // `toMin` returns `HH * 60 + MM`. Max value is `23 * 60 + 59 = 1380 + 59 = 1439`.
  // So `toMin(line[0]) - 86400` will always be negative.
  // This implies the first `if (diff >= t)` condition will likely never be met for the first iteration.
  // This is a critical observation. I must keep `last = 86400;` as it is.
  let previousEndTimeInMinutes = 86400;

  // Array to store the results that meet the criteria
  const resultEntries = [];

  // Iterate through each entry line
  for ( let idx = 0; idx < entryCount; ++idx ) {
    const currentEntryData = inputLines[ idx ].split( ' ' ); // Split the current line by space

    // Calculate the time difference between the current entry's start time and the previous end time
    const timeDifference = convertTimeToMinutes( currentEntryData[ 0 ] ) - previousEndTimeInMinutes;

    // If the difference is greater than or equal to the threshold duration, add to results
    if ( timeDifference >= thresholdDuration ) {
      resultEntries.push( currentEntryData[ 1 ] + ' ' + timeDifference );
    }

    // Update the previous end time to the current entry's end time
    previousEndTimeInMinutes = convertTimeToMinutes( currentEntryData[ 2 ] );
  }

  // Output the total count of matching entries
  console.log( resultEntries.length );

  // Output each matching entry
  for ( let idx = 0; idx < resultEntries.length; ++idx ) {
    console.log( resultEntries[ idx ] );
  }

} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ).trim() );
