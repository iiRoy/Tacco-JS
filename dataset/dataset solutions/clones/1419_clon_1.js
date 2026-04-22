/*
 * This JavaScript program reads input from standard input,
 * processes each line, and outputs a corresponding grade.
 * It continues processing until a specific termination condition is met.
 */
var  input  =  require (   'fs'   ) . readFileSync (   '/dev/stdin'  ,  'utf8'   ) ;
// The entire content of the standard input is read into the 'input' variable as a UTF-8 string.

var  lines  =  input . split (   '\n'   ) ;
// The input string is then split into an array of individual lines, using the newline character as a delimiter.


while  (  true  )
{
    // This loop runs indefinitely until an explicit 'break' statement is encountered.

    var  vals  =  lines . shift (   ) . split (   ' '   ) ;
    // In each iteration, the first line is removed from the 'lines' array using 'shift()',
    // and then split into an array of strings ('vals') based on space characters.

    var  m  =  +vals [  0  ] ; // Converts the first value from string to number (using unary plus operator).
    var  f  =  +vals [  1  ] ; // Converts the second value from string to number.
    var  r  =  +vals [  2  ] ; // Converts the third value from string to number.


    // Check for the termination condition of the loop.
    if  (  m  +  f  +  r   ==   -3  )
    {
        break ; // If the sum of m, f, and r is -3, the loop is exited.
    }


    /*
     * The following series of 'if-else if' statements determines the grade
     * based on the values of 'm', 'f', and 'r' according to specific criteria.
     */
    if  (  m  ==  -1  ||  f  ==  -1  )
    {
        console . log (   'F'   ) ; // If either 'm' or 'f' is -1, the grade is 'F'.
    }
    else  if  (  m  +  f  >=  80  )
    {
        console . log (   'A'   ) ; // If the sum of 'm' and 'f' is 80 or more, the grade is 'A'.
    }
    else  if  (  m  +  f  >=  65  )
    {
        console . log (   'B'   ) ; // If the sum of 'm' and 'f' is 65 or more, the grade is 'B'.
    }
    else  if  (  m  +  f  >=  50  )
    {
        console . log (   'C'   ) ; // If the sum of 'm' and 'f' is 50 or more, the grade is 'C'.
    }
    else  if  (  m  +  f  >=  30  &&  r  >=  50  )
    {
        console . log (   'C'   ) ; // If (m+f) is 30 or more AND 'r' is 50 or more, the grade is 'C'.
    }
    else  if  (  m  +  f  >=  30  )
    {
        console . log (   'D'   ) ; // If the sum of 'm' and 'f' is 30 or more (but less than 50, and 'r' < 50 if applicable), the grade is 'D'.
    }
    else
    {
        console . log (   'F'   ) ; // In all other cases (i.e., m+f is less than 30), the grade is 'F'.
    }
}

// The program concludes execution once the 'while' loop is terminated.