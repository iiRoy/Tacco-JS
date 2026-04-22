// Begin processing standard input to receive data.
process.stdin.resume();

// Configure the input stream to interpret data as UTF-8 characters.
process.stdin.setEncoding( 'utf8' );

// Attach an event handler to respond to incoming 'data' chunks.
process.stdin.on(
    'data',
    function(  inputSegment  )
    {
        // Transform the raw input segment into a string,
        // then split it by spaces, and finally convert each resulting part into a numerical value.
        const parsedNumbers = inputSegment.toString().split( ' ' ).map( Number );

        // Extract the first number from the array, which represents the radial dimension.
        const radiusVal = Number( parsedNumbers[0] );

        // Compute the surface area of the circular shape using the formula: Area = π * r².
        // Math.PI provides the mathematical constant Pi.
        const calculatedArea = radiusVal * radiusVal * Math.PI;

        // Determine the total length of the boundary (circumference) of the circular shape,
        // using the formula: Circumference = 2 * π * r.
        const perimeterCalc = 2 * radiusVal * Math.PI;

        // Display the computed perimeter and area to the console,
        // ensuring they are separated by a single space character.
        console.log( perimeterCalc + ' ' + calculatedArea );
    }
);