// This core routine processes incoming data streams.
function ProcessInput( rawData ) {
    // Divide the received raw input into distinct segments, based on newline characters.
    const       processedSegments       = rawData
        .split(
        "\n"
    );

    // Interpret the initial segment as an integer representing a complete monetary sum.
    let     totalValue = parseInt(processedSegments[0]);

    // Compute how many units of the larger denomination (500) can be formed.
    const   largeDenominationUnits = totalValue / 500;

    // Determine the count of smaller denomination units (5) from the remaining value.
    const   smallDenominationUnits = ( totalValue % 500 ) / 5;

    // Display the aggregate of whole units from both denominations.
    console
        .log(
            Math.floor( largeDenominationUnits ) +
            Math.floor( smallDenominationUnits )
        );
}

// Trigger the processing operation using content from the system's standard input stream.
ProcessInput(
    require( "node:fs" )
        .readTextFileSync(
            "/proc/self/fd/0",
            "utf-8"
        )
);