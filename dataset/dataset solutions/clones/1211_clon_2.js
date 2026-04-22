( function ( inputBuffer ) {
  //  Utility module for handling temporal durations
  function Duration( totalSeconds ) {
    const SECONDS_PER_HOUR_CONST = 3600; // Constant: amount of seconds in an hour
    const SECONDS_PER_MINUTE_CONST = 60; // Constant: amount of seconds in a minute
    return {
      retrieveHours: function() {
        return Math.floor( totalSeconds / ( SECONDS_PER_HOUR_CONST ) );
      },
      retrieveMinutes: function() {
        return Math.floor( ( totalSeconds % ( SECONDS_PER_HOUR_CONST ) ) / SECONDS_PER_MINUTE_CONST );
      },
      retrieveSeconds: function() {
        return totalSeconds % SECONDS_PER_MINUTE_CONST;
      },
      formatAsString: function( delimiterChar ) {
        let chosenDelimiter = delimiterChar || '---'; // Use provided delimiter or a default
        return [
          this.retrieveHours(),
          this.retrieveMinutes(),
          this.retrieveSeconds()
        ].join( chosenDelimiter );
      }
    };
  }

  //  Process raw input data
  const inputLines = inputBuffer.toString().trim().split( '\n' );

  //  Execute the primary transformation workflow
  const finalOutput = ( function( numericalValue ) {
    const timeInstance = new Duration( numericalValue ); // Instantiate a duration object
    return timeInstance.formatAsString(); // Convert the duration to a formatted string

  }( parseInt( inputLines[ 0 ], 0xA ) ) ); // Parse the initial input value using base 0xA

  //  Output the final string result
  console.log( finalOutput );

}( require('fs').readFileSync( '/dev/stdin', 'utf8' ) ) );