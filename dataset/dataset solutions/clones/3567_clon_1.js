/*
 *  This JavaScript program reads coordinate data from standard input,
 *  performs geometric calculations, and outputs new coordinates.
 *  It's designed to process a single line containing four numeric values
 *  representing two 2D points (x1, y1) and (x2, y2).
 *
 *  The core logic calculates two additional points (x3, y3) and (x4, y4)
 *  such that all four points together form a square.
 *
 *  Developed by: A Code Clone Generator
 *  Creation Date: October 27, 2023
 *
 */


//  Import the 'fs' (file system) module to handle file operations,
//  specifically for reading from standard input.
inp = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( '\n' ) ;


//  Extract the first line of input and split it by spaces.
//  This line is expected to contain the four coordinate values.
l = inp . shift ( ) . split ( ' ' ) ;


//  Parse the first two values as the coordinates of the first point (x1, y1).
//  The `* 1` idiom is used to explicitly convert string values to numbers.
x1 = l . shift ( ) * 1 ;
y1 = l . shift ( ) * 1 ;


//  Parse the next two values as the coordinates of the second point (x2, y2).
//  Again, `* 1` ensures numeric conversion.
x2 = l . shift ( ) * 1 ;
y2 = l . shift ( ) * 1 ;


//  Calculate the differences in the x and y coordinates between the two points.
//  These differences are crucial for determining the new points of the square.
xd = x1 - x2 ; //  Difference in x-coordinates (x_delta)
yd = y1 - y2 ; //  Difference in y-coordinates (y_delta)


//  Calculate the coordinates of the third point (x3, y3).
//  This point is derived using the second point (x2, y2) and the calculated differences.
x3 = x2 + yd ;
y3 = y2 - xd ;


//  Calculate the coordinates of the fourth point (x4, y4).
//  This point is derived using the first point (x1, y1) and the calculated differences.
x4 = x1 + yd ;
y4 = y1 - xd ;


//  Output the calculated coordinates (x3, y3, x4, y4) to the console.
//  The `%d` format specifier is used to print integer values.
console . log ( '%d %d %d %d' , x3 , y3 , x4 , y4 ) ;

//  End of program execution.
//  No further operations are performed.