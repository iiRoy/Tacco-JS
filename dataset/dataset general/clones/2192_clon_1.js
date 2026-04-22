/*
     * This file demonstrates the usage of the 'Matrix' module
     * for various 3D transformations.
     */


// Require the Matrix module to use its functionalities.
var   matrix = require ( "Matrix" ) ;

// Initialize a new identity matrix 's' with 4x4 dimensions.
var   s   =   new   matrix (
    1 ,   0 ,   0 ,   0 ,
    0 ,   1 ,   0 ,   0 ,
    0 ,   0 ,   1 ,   0 ,
    0 ,   0 ,   0 ,   1
) ;


// Output the string representation of the initial matrix 's'.
    console . log ( s . toString ( ) ) ;


// Declare a string variable to label the output for different transformations.
var str = "测试rotate\n" ; // Label for rotation tests.

// Perform and log rotation transformations.
console . log (
    matrix . rotateX ( 45 ) . toString ( ) , // Rotate 45 degrees around X-axis.
    matrix . rotateY ( 45 ) . toString ( ) , // Rotate 45 degrees around Y-axis.
    matrix . rotateZ ( 45 ) . toString ( ) , // Rotate 45 degrees around Z-axis.
    matrix . rotate ( 45 , 45 , 45 ) . toString ( ) // Rotate 45 degrees around all axes.
) ;


// Update the label for translation tests.
str   =   "测试translate\n" ;

// Perform and log translation transformations.
console . log (
    matrix . translateX ( 45 ) . toString ( ) , // Translate 45 units along X-axis.
    matrix . translateY ( 45 ) . toString ( ) , // Translate 45 units along Y-axis.
    matrix . translateZ ( 45 ) . toString ( ) , // Translate 45 units along Z-axis.
    matrix . translate ( 45 , 45 , 45 ) . toString ( ) // Translate 45 units along all axes.
) ;


// Update the label for scaling tests.
str = "测试scale\n" ;

// Perform and log scaling transformations.
console . log (
    matrix . scaleX ( 45 ) . toString ( ) , // Scale by 45 along X-axis.
    matrix . scaleY ( 45 ) . toString ( ) , // Scale by 45 along Y-axis.
    matrix . scaleZ ( 45 ) . toString ( ) , // Scale by 45 along Z-axis.
    matrix . scale ( 45 , 45 , 45 ) . toString ( ) // Scale by 45 along all axes.
) ;


// Update the label for skew tests.
str   =   "测试skew\n" ;

// Perform and log skew transformations.
console . log (
    matrix . skewX ( 45 ) . toString ( ) , // Skew by 45 degrees along X-axis.
    matrix . skewY ( 45 ) . toString ( ) , // Skew by 45 degrees along Y-axis.
    matrix . skew ( 45 , 45 ) . toString ( ) // Skew by 45 degrees along both X and Y axes.
) ;