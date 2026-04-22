// This function is designed to process an incoming textual identifier.
function ProcessInputData( dayNameInput ) {
  	// Establish a collection of objects, each representing a day with its label and numerical order.
  	const weekdayInfo = [
        { label: "SUN", indexValue: 0 },
        { label: "MON", indexValue: 1 },
        { label: "TUE", indexValue: 2 },
        { label: "WED", indexValue: 3 },
        { label: "THU", indexValue: 4 },
        { label: "FRI", indexValue: 5 },
        { label: "SAT", indexValue: 6 }
    ];

  	// Compute a specific integer offset based on the provided day name string.
  	const calculatedOffset = Math.abs(
        weekdayInfo.find( ( dayEntry ) => dayEntry.label === dayNameInput ).indexValue - 7
    );

  	// Display the final computed offset value to the standard output.
  	console.log( calculatedOffset );
}

// The following code block is responsible for reading input from the system and invoking the main processing function. It should not be altered.
ProcessInputData( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) );