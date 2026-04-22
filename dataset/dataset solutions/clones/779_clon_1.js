/*
 * This JavaScript code reads input from standard input,
 * processes it to decode numerical sequences into text
 * (mimicking an old-style mobile phone keypad input),
 * and then prints the resulting text to standard output.
 * It's structured to handle multiple test cases.
 */


//  Require the built-in 'fs' (file system) module.
//  Then, synchronously read the entire content of '/dev/stdin'
//  (standard input) as a UTF-8 encoded string.
var input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

//  Trim any leading/trailing whitespace from the input string.
//  Then, split the cleaned input string by newline characters
//  into an array of strings, where each element is a line from the input.
var Arr = ( input . trim() ) . split ( "\n" ) ;

//  The first element of the 'Arr' array represents the number of test cases (AL).
//  'shift()' removes this element from 'Arr' and returns it.
//  JavaScript's type coercion will convert this string to a number when used in the loop.
var AL  =   Arr . shift ( ) ;


//  Initialize a global array 'abc' which acts as our character mapping.
//  Each index corresponds to a number on the keypad (0-9).
//  The strings contain the characters available for that number.
//  Note: index 0 is empty, index 1 contains punctuation/space.
var abc = [
    "" ,              //  0: No characters
    ".,!? " ,         //  1: Punctuation and space
    "abc" ,           //  2: a, b, c
    "def" ,           //  3: d, e, f
    "ghi" ,           //  4: g, h, i
    "jkl" ,           //  5: j, k, l
    "mno" ,           //  6: m, n, o
    "pqrs" ,          //  7: p, q, r, s
    "tuv" ,           //  8: t, u, v
    "wxyz"            //  9: w, x, y, z
];

//  Transform the 'abc' array. For each string element 'v',
//  split it into an array of individual characters.
//  This makes it easier to access specific characters by index.
abc = abc . map (
    function ( v )
    {
        return v . split ( "" ) ;
    }
);


//  This is the main processing loop.
//  It iterates 'AL' times, once for each test case.
for ( var i = 0 ;  i < AL ;  i++ )
{
    //  For the current test case (Arr[i]):
    //  1. Split the string into an array of individual character strings.
    //  2. Map each character string to its numerical equivalent using 'Number'.
    //  The result is an array of numbers representing the key presses.
    var arr = Arr [ i ] . split ( "" ) . map ( Number ) ;

    //  Initialize an empty string to store the decoded output for the current test case.
    var str = "" ;

    //  'a' will temporarily hold the last character decoded from a sequence.
    var a   =   "" ;

    //  'n' is a counter for how many times a key has been pressed consecutively.
    //  It's initialized to -1 because the first press increments it to 0.
    var n   =   -1 ;

    //  Iterate over each number ('v') in the 'arr' array (the sequence of key presses).
    arr . forEach ( function ( v ) {

            //  If the current number 'v' is greater than 0, it represents a key press
            //  for a character (not a separator).
            if ( v > 0 )
            {
                n++; // Increment the counter for consecutive presses of the current key.
                //  Determine the character:
                //  - 'abc[v]' gets the character array for the current key 'v'.
                //  - 'n % abc[v].length' uses the modulo operator to cycle through
                //    the characters if the key is pressed more times than available characters.
                a = abc [ v ] [ n % abc [ v ] . length ] ;
            }
            //  If the number 'v' is 0, it signifies a separator, meaning
            //  the previous character sequence is complete.
            else
            {
                str += a ; // Append the last decoded character 'a' to the result string 'str'.
                n = -1 ;   // Reset the consecutive press counter 'n'.
                a = "" ;   // Clear the temporary character 'a' for the next sequence.
            }

        }
    );

    //  After processing all numbers for the current test case, print the
    //  fully decoded string 'str' to the console (standard output).
    console . log ( str ) ;
}

//  End of script execution.