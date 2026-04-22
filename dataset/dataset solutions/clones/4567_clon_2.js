function ProcessInput( dataString ) {
    // Parse the incoming string to extract two numerical dimensions
    let [ firstDimension, secondDimension ] = dataString.split( " " ).map( Number );

    // Initialize the smallest observed difference to the maximum possible safe integer value
    let minimumDifference = Number.MAX_SAFE_INTEGER;

    { // Calculation block 1: Split the first dimension with floor, then split the remainder of the second dimension
        let valueArray = [ 0, 0, 0 ]; // Array to store the areas of three sections
        valueArray[0] = Math.floor( firstDimension / 3 ) * secondDimension; // Area of the first large section
        let partialDimension = Math.ceil( firstDimension / 3 * 2 ); // Remaining length after the first cut
        valueArray[1] = partialDimension * Math.ceil( secondDimension / 2 ); // Area of the second section
        valueArray[2] = partialDimension * Math.floor( secondDimension / 2 ); // Area of the third section

        // Update the minimum difference between max and min areas among the three sections
        minimumDifference = Math.min( minimumDifference, Math.max.apply( null, valueArray ) - Math.min.apply( null, valueArray ) );
    }

    { // Calculation block 2: Split the first dimension with ceil, then split the remainder of the second dimension
        let valueArray = [ 0, 0, 0 ]; // Array for current area calculations
        valueArray[0] = Math.ceil( firstDimension / 3 ) * secondDimension; // First section area
        let partialDimension = Math.floor( firstDimension / 3 * 2 ); // Remaining length
        valueArray[1] = partialDimension * Math.ceil( secondDimension / 2 ); // Second section area
        valueArray[2] = partialDimension * Math.floor( secondDimension / 2 ); // Third section area

        // Update the minimum difference if this configuration yields a smaller one
        minimumDifference = Math.min( minimumDifference, Math.max.apply( null, valueArray ) - Math.min.apply( null, valueArray ) );
    }

    // Temporarily swap the dimensions to simulate a 90-degree rotation of the area
    firstDimension = secondDimension + ( secondDimension = firstDimension, 0 );

    { // Calculation block 3: Repeat split strategy 1 with the swapped dimensions
        let valueArray = [ 0, 0, 0 ];
        valueArray[0] = Math.floor( firstDimension / 3 ) * secondDimension;
        let partialDimension = Math.ceil( firstDimension / 3 * 2 );
        valueArray[1] = partialDimension * Math.ceil( secondDimension / 2 );
        valueArray[2] = partialDimension * Math.floor( secondDimension / 2 );

        // Re-evaluate and potentially update the minimum difference
        minimumDifference = Math.min( minimumDifference, Math.max.apply( null, valueArray ) - Math.min.apply( null, valueArray ) );
    }

    { // Calculation block 4: Repeat split strategy 2 with the swapped dimensions
        let valueArray = [ 0, 0, 0 ];
        valueArray[0] = Math.ceil( firstDimension / 3 ) * secondDimension;
        let partialDimension = Math.floor( firstDimension / 3 * 2 );
        valueArray[1] = partialDimension * Math.ceil( secondDimension / 2 );
        valueArray[2] = partialDimension * Math.floor( secondDimension / 2 );

        // Final update to the minimum difference from these calculations
        minimumDifference = Math.min( minimumDifference, Math.max.apply( null, valueArray ) - Math.min.apply( null, valueArray ) );
    }

    { // Special case check: If the first dimension is perfectly divisible by 3
        if ( firstDimension % 3 === 0 ) {
            minimumDifference = 0; // The difference can be zero in this scenario
        } else {
            // Otherwise, compare the current minimum difference with the value of the second dimension
            minimumDifference = Math.min( minimumDifference, secondDimension );
        }
    }

    { // Another special case check: If the second dimension is perfectly divisible by 3
        if ( secondDimension % 3 === 0 ) {
            minimumDifference = 0; // The difference can be zero
        } else {
            // Otherwise, compare the current minimum difference with the value of the first dimension
            minimumDifference = Math.min( minimumDifference, firstDimension );
        }
    }

    // Output the final calculated minimum difference
    console.log( minimumDifference );
}

// Invoke the main processing function with input read from standard input
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).trim() );