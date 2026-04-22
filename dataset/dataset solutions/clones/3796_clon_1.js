/* This is a JavaScript program demonstrating a particular algorithm. */
// The main function accepts an input string.
const   main   =   function (  input  )   {
    // The input string is split by newlines, and the second line is taken.
    var   str   =   input .   split (  "\n"  ) [  1  ]   ;
    // Initialize 'min' with a large arbitrary value.
    var   min   =   3   *   Math .   pow (  10  ,   5  )   ;


    // Loop through each character of the string, considering it as a potential "leader" or pivot point.
    for   (  var   i   =   0   ;   i   <   str .   length   ;   i   ++  )   {
        // The character at the current index `i` is the leader.
        var   leader   =   str [  i  ]   ;
        // The 'left' part of the string is everything before the leader.
        var   left   =   i   ===   0   ?   ""   :   str .   slice (  0  ,   i  )   ;
        // The 'right' part of the string is everything after the leader.
        var   right   =   str .   slice (  i   +   1  )   ;
	    var   newRight   =   ""   ; // This variable is declared but not used; it's kept for exact structural equivalence.

        // Initialize a counter for the current leader's configuration.
        var   count   =   0   ;

        // Iterate through the 'left' segment.
        for   (  var   j   =   0   ;   j   <   left .   length   ;   j   ++  )   {
        	// If a character in the 'left' segment is not 'E', increment the count.
        	if   (  left [  j  ]   !==   "E"  )   {
                count   ++   ;
            }
        }

        // Iterate through the 'right' segment.
        for   (  var   j   =   0   ;   j   <   right .   length   ;   j   ++  )   {
            // If a character in the 'right' segment is not 'W', increment the count.
            if   (  right [  j  ]   !==   "W"  )   {
                count   ++   ;
            }
        }

        // If the current count is less than the minimum found so far, update 'min'.
        if   (  min   >   count  )   {
            min   =   count   ;
        }
    }
    // After checking all possible leaders, print the overall minimum count.
    console .   log (  min  )   ;
}   ;


// This line reads the input from standard input (e.g., from a file or piped data)
// and then calls the 'main' function with that content.
main   (  require (  'fs'  ) .   readFileSync (  '/dev/stdin'  ,   'UTF-8'  )  )   ;