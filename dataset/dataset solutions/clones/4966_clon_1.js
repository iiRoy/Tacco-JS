/* This is a Type I clone of a JavaScript program.
 * It reads three numbers from standard input and calculates the area of a trapezoid.
 * The original logic and structure are preserved exactly.
 * Only whitespace and comments have been altered.
 */

 const   input   =   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "UTF-8"   )   .   trim   (   )   .   split   (   "\n"   )   ;   //  Read  input  from  stdin,  decode  as  UTF-8,  trim  whitespace,  and  split  by  newline.

/*
 * The input array 'input' now contains each line as a string element.
 * We expect three lines representing the two parallel sides (a, b) and the height (h).
 */

const a = Number(  input[ 0  ]  ) ;   // Convert the first line to a number, representing side 'a'.

// Assigning the second input line to variable 'b' after converting it to a numeric type.
const b = Number(  input  [  1  ]  )  ;

/*
 *   Finally,   we   extract   the   height   from   the   third   line
 *   and   convert   it   to   a   numeric   value.
 */
const h = Number   (   input   [   2   ]   )   ;


// Calculate the area of the trapezoid using the formula: (a + b) * h / 2
// And then print the result to the console.
console.log( (  a   +   b  )   *   h   /   2   )   ;

/* End of program */