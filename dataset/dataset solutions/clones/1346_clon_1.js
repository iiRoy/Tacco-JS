/*
 * This JavaScript file contains a program designed to calculate
 * the area and circumference of a circle.
 *
 * The radius of the circle is provided as input.
 *
 * Author: Code Clone Generator
 * Date: Current Date
 */


// Define the primary function that orchestrates the calculation process.
function   Main   (   input   )   {

    // The 'input' parameter initially holds a string value.
    // It must be converted into an integer to perform mathematical operations.
    // parseInt() is used for this conversion, assuming the input is a valid number string.
    input    =    parseInt    (    input    )    ;


    // Now, we proceed to calculate and display the results.
    // The console.log() function is used for output.
    //
    // The first placeholder '%d' will be replaced by the area of the circle.
    // Formula for Area: π * radius * radius (π * r^2)
    //
    // The second placeholder '%d' will be replaced by the circumference of the circle.
    // Formula for Circumference: 2 * π * radius (2 * π * r)
    console .   log   (
        '%d %d'   ,
        Math .   PI   *   input   *   input   ,    // Calculation for the area
        Math .   PI   *   2   *   input      // Calculation for the circumference
    )   ;

}   // End of the Main function definition.


// --- Program Execution Section ---

/*
 * This part of the code is responsible for reading the input data
 * and passing it to the Main function for processing.
 *
 * It uses Node.js's built-in 'fs' (file system) module.
 */
Main   (
    require   (   "fs"   )   .
    readFileSync   (   "b.txt"   ,   "utf8"   )
)   ; // The file "b.txt" is read synchronously, and its content is treated as the radius.


// End of the JavaScript program.