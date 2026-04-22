/* This script processes input from stdin to calculate the distance between two points
   on a clock face, given their lengths and the time. */

process.stdin.setEncoding(   "utf8" ); // Set the input encoding for standard input.


process.stdin.on( "data" ,   (  input  )   =>   {
    // The original example input might look like "3 4 9 0" representing A, B, H, M.
    // Parse the incoming data string into an array of values.
    const inputArr = input . split ( " " );

    // Extract the individual components from the parsed array.
    const A = inputArr [ 0 ];
    const B = inputArr [ 1 ];
    const H = inputArr [ 2 ];
    const M = inputArr [ 3 ];

    // Calculate the final result using a helper function.
    const result = getResult ( A ,   B ,   H ,   M );

    // Output the computed result to the console.
    console . log ( result );
}  );


/**
 * Calculates the distance between the tips of the hour and minute hands
 * on a clock, given their lengths and the current time.
 * @param {number} A - Length of the first hand (e.g., hour hand).
 * @param {number} B - Length of the second hand (e.g., minute hand).
 * @param {number} H - Current hour (0-23).
 * @param {number} M - Current minute (0-59).
 * @returns {number} The distance between the tips of the hands.
 */
const getResult = (A, B, H, M) => {
    // Calculate the angular position of the minute hand in radians.
    // Full circle (2*PI) in 60 minutes.
    const minuteDegree = ( Math.PI * 2.0 * M ) / 60 ;

    // Calculate the angular position of the hour hand in radians.
    // The hour hand moves based on hours and also fraction of hour due to minutes.
    // Full circle (2*PI) in 12 hours.
    const hourDegree = Math . PI * 2 * ( H / 12 + M / 60 / 12 ) ;

    // Determine the absolute difference in angles between the two hands.
    // This is the angle 'theta' for the law of cosines.
    const theta = minuteDegree - hourDegree ;
    
    // Use the Law of Cosines to find the distance between the tips.
    return calcCosinTheorem ( A , B , theta ) ;
};



/*
 * Applies the Law of Cosines to find the length of the third side of a triangle
 * given two sides and the angle between them.
 * @param {number} A - Length of side 1.
 * @param {number} B - Length of side 2.
 * @param {number} theta - The angle (in radians) between sides A and B.
 * @returns {number} The length of the third side.
 */
const calcCosinTheorem = ( A , B , theta ) => {
    // The formula is c = sqrt(a^2 + b^2 - 2ab*cos(theta))
    return Math . sqrt ( A * A + B * B - 2 * A * B * Math . cos ( theta ) ) ;
};