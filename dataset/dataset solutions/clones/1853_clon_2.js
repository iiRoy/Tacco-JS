process.stdin.setEncoding("UTF-8"); // Configure the standard input stream to use UTF-8 character encoding.

process.stdin.on("data",  ( rawInputData )  =>  {
    // This comment explains the expected input format: four numeric values separated by spaces.
    // The first two are side lengths, the last two are clock hour and minute.
    // Example: "10 20 5 30" would mean side_a=10, side_b=20, time=05:30.
    const parsedValuesArray = rawInputData.split(' '); // Parse the incoming text data by splitting on spaces.

    const sideLengthX = parseFloat(parsedValuesArray[0]);  // Extract the first side length from the input.
    const sideLengthY = parseFloat(parsedValuesArray[1]);  // Extract the second side length from the input.
    const clockHour = parseFloat(parsedValuesArray[2]);    // Extract the hour component of the time.
    const clockMinute = parseFloat(parsedValuesArray[3]);  // Extract the minute component of the time.

    const finalCalculatedLength = computeClockHandDistance( sideLengthX, sideLengthY, clockHour, clockMinute ); // Invoke the primary calculation function.

    console.info( `The computed distance is: ${finalCalculatedLength}` ); // Display the final result to the console.
});

const computeClockHandDistance = ( firstSide, secondSide, currentHour, currentMinute ) => {
    // Determine the angular position of the minute hand in radians.
    // A full circle (360 degrees) is 2*PI radians.
    // The minute hand completes a circle in 60 minutes.
    const minuteAngleRadians = ( Math.PI * 2.0 * currentMinute ) / 60.0;

    // Determine the angular position of the hour hand in radians.
    // The hour hand completes a circle in 12 hours.
    // Its position also depends on the minutes passed within the hour.
    const hourAngleRadians = ( Math.PI * 2.0 * ( currentHour / 12.0 + currentMinute / ( 60.0 * 12.0 ) ) );

    // Calculate the absolute angular difference between the two clock hands.
    const angleDifferenceRad = minuteAngleRadians - hourAngleRadians;
    
    // Apply the Law of Cosines to find the length of the third side of the triangle
    // formed by the two clock hands and the line connecting their tips.
    return applyLawOfCosines( firstSide, secondSide, angleDifferenceRad );
};

const applyLawOfCosines = ( side1, side2, angleBetween ) => {
    // This function calculates the length of the third side of a triangle
    // given two sides and the angle between them, using the Law of Cosines.
    // Formula: c^2 = a^2 + b^2 - 2ab * cos(C)
    return Math.sqrt(
        ( side1 * side1 ) +
        Math.pow( side2, 2 ) -
        ( 2 * side1 * side2 * Math.cos( angleBetween ) )
    );
};