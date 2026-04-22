/*
 * This file contains functions for processing geometric input
 * specifically designed to identify and evaluate triangles.
 * It includes a Triangle constructor and its associated prototype methods
 * for validation and right-angle determination.
 */

function    generateTrianglesFromInput   (   input   )   {

    // Define the maximum permissible value for triangle vertices.
    var     max     =    1000   ;


    // First, split the entire input string into individual lines.
    var lines = getInputAsLines( input , "\n" );

    // Then, convert each line of string data into an array of numeric vertices.
    var vertices = lines . map ( processLineToVertices ) ;


    // Iterate through each processed line (which now represents a potential triangle's vertices).
    for ( var   i   =   0   ;   i   <   vertices.length   ;   i ++ )   {

        var     line     =     vertices[   i   ]   ;

        // Special handling for the very first line of input.
        if  (  i  ===  0  )   {
            // If the first vertex of the first line exceeds the maximum,
            // it indicates an invalid input scenario, so we terminate.
            if  (  line[   0   ]   >   max  )   {
                break   ;
            }
        }

        /*
         * Construct a new Triangle object using the parsed vertices.
         * Constraints are explicitly defined here for clarity.
         */
        var   tri   =   new   Triangle   (   {
            constraints   :   {
                min   :   1   ,
                max   :   1000
            }   ,
            vertices   :   {
                a   :   line[   0   ]   ,
                b   :   line[   1   ]   ,
                c   :   line[   2   ]
            }
        }   )   ;


        // Check if the newly created triangle object is valid according to its internal rules.
        if   (   tri   .   isValid   (   )   )   {

            // Determine if it is a right-angle triangle.
            var   isRightAngleTriangle   =   tri   .   isRightAngleTriangle   (   )   ;

            // Prepare the output string based on the right-angle determination.
            var   logValue   =   (   isRightAngleTriangle   )   ?   'YES'   :   'NO'   ;

            // Display the result to the console.
            console   .   log   (   logValue   )   ;
        }
    }
}


/*
 * Helper function: Takes a raw input string and a delimiter,
 * returning an array of strings, each representing a line of input.
 */
function getInputAsLines( input , delimeter ) {

    return   input   .   split   (   delimeter   )   ;

}


/*
 * Helper function: Processes a single line string, splitting it by spaces
 * to extract individual vertex values.
 */
function processLineToVertices( line ) {

    var   vertices   =   line   .   split   (   ' '   )   ;

    return   vertices   ;

}


//
// Definition of the Triangle constructor function.
// It initializes a triangle object with its constraints and vertex values.
//
function Triangle( options ) {

    // Initialize empty objects to hold constraints and vertices.
    this   .   constraints   =   {   }   ;
    this   .   vertices   =   {   }   ;

    // Set up triangle constraints, using defaults if not provided.
    this   .   constraints   .   min   =   options   .   constraints   .   min   ||   1   ;
    this   .   constraints   .   max   =   options   .   constraints   .   max   ||   1000   ;

    // Set up triangle vertices, validating each against the defined constraints.
    // If a vertex is outside constraints, it's set to null.
    this   .   vertices   .   a   =   (   this   .   vertexIsWithinConstraints   (   options   .   vertices   .   a   )   )   ?   options   .   vertices   .   a   :   null   ;
    this   .   vertices   .   b   =   (   this   .   vertexIsWithinConstraints   (   options   .   vertices   .   b   )   )   ?   options   .   vertices   .   b   :   null   ;
    this   .   vertices   .   c   =   (   this   .   vertexIsWithinConstraints   (   options   .   vertices   .   c   )   )   ?   options   .   vertices   .   c   :   null   ;

}


/*
 * Prototype method for Triangle objects:
 * Checks if a given vertex value falls within the triangle's defined constraints.
 */
Triangle .   prototype   .   vertexIsWithinConstraints   =   function   (   vertex   )   {

    return   (   vertex   >=   this   .   constraints   .   min   &&   vertex   <=   this   .   constraints   .   max   )   ;
}


/*
 * Prototype method for Triangle objects:
 * Determines if the triangle is valid, meaning all its vertices are non-null
 * (i.e., they passed the constraint validation during construction).
 */
Triangle .   prototype   .   isValid   =   function   (   )   {

    return   (   this   .   vertices   .   a   &&   this   .   vertices   .   b   &&   this   .   vertices   .   c   )   ;

}


/*
 * Prototype method for Triangle objects:
 * Determines if the triangle is a right-angle triangle using the Pythagorean theorem.
 * It first checks if the triangle is valid.
 */
Triangle .   prototype   .   isRightAngleTriangle   =   function   ( )   {

    var   value   =   false   ;

    // Proceed only if the triangle's vertices are valid.
    if   (   this   .   isValid   )   {

        // Create an array to hold the numeric vertex values.
        var   vertexArray   =   [   ]   ;
        vertexArray   .   push   (   this   .   vertices   .   a   )   ;
        vertexArray   .   push   (   this   .   vertices   .   b   )   ;
        vertexArray   .   push   (   this   .   vertices   .   c   )   ;

        // Sort the vertices in ascending order, which is necessary for the Pythagorean theorem (a^2 + b^2 = c^2).
        vertexArray .   sort   (   function   ( a , b )   {   return   a   -   b   }   )   ;

        // Calculate the square of each vertex.
        var   squares   =   vertexArray   .   map   (   function   (   vertex   )   {   return   Math   .   pow   (   vertex   ,   2   )   }   )   ;

        // Apply the Pythagorean theorem: the square of the longest side (squares[2])
        // should equal the sum of the squares of the other two sides (squares[0] + squares[1]).
        value   =   (   squares[   2   ]   ===   (   squares[   0   ]   +   squares[   1   ]   )   )   ;
    }

    return   value   ;
}


//
// Main execution block:
// Reads input from standard input, processes it, and then generates triangle evaluations.
//

var   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   .   trim   (   )   ;


generateTrianglesFromInput   (   input   )   ;