/*
 * This JavaScript program is designed to process numerical input from standard input.
 * It calculates the area and circumference (perimeter) of a circle,
 * assuming the input number represents the radius of that circle.
 * Both calculated values are then formatted to a specific precision
 * before being printed to the standard output.
 *
 * This file demonstrates basic I/O operations, type conversion,
 * mathematical calculations using built-in constants, and string formatting.
 *
 * Author: Code Clone Generator Bot
 * Date: 2023-10-27
 */


//  First, we import the 'fs' (file system) module, which provides
//  utilities for interacting with the file system.
//  Specifically, we use 'readFileSync' to synchronously read the entire
//  content of '/dev/stdin' (standard input) as a UTF-8 encoded string.
const   input    =    require   (   'fs'   ) .   readFileSync   (   '/dev/stdin'   ,    'utf8'   )   ;


//  Next, the string 'input' obtained from standard input is converted
//  into a numerical type. This is crucial as all subsequent mathematical
//  operations require a number. This converted value is assigned to the
//  constant 'r', which represents the radius of the circle.
const   r    =    Number   (   input   )   ;


//  Here, we calculate the circumference of the circle. The formula for
//  circumference is 2 * pi * radius. 'Math.PI' provides the value of pi.
//  The result of this calculation is then formatted to a string with
//  exactly 6 decimal places using the 'toFixed(6)' method.
//  This formatted string is stored in the 'pi' constant (note: 'pi' here
//  is a variable name for circumference, not the mathematical constant itself).
const   pi    =    (   2    *    r    *    Math .   PI   ) .   toFixed   (   6   )   ;


//  Subsequently, the area of the circle is calculated. The formula for
//  area is pi * radius * radius (or pi * r^2).
//  Similar to the circumference, the calculated area is also formatted
//  to a string with exactly 6 decimal places using 'toFixed(6)'.
//  This formatted string is stored in the 'area' constant.
const   area    =    (   r    *    r    *    Math .   PI   ) .   toFixed   (   6   )   ;


//  Finally, both the calculated 'area' and 'pi' (circumference) values,
//  which are now strings due to 'toFixed()', are concatenated together
//  with a single space in between.
//  This combined string is then printed to the console (standard output).
console .   log   (   area    +    " "    +    pi   )   ;