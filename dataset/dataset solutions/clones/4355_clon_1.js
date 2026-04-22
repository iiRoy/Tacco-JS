var       obj       =       init(); /* Initialize the global input object */


Main( ); // Start the main execution flow of the program

/* Function to read the next integer from the input stream */
function   nextInt ( )   {
 return   myconv (   next ( )   ,   1   )   ;
}


/* Function to read the next string array (space-separated) */
function   nextStrArray ( )   {
 return   myconv (   next ( )   ,   2   )   ;   // Splits input string by half-width spaces.
}

/**
 * Function to read the next integer array.
 * Splits by half-width spaces and converts elements to numbers.
 */
function   nextIntArray ( )   {
 return   myconv (   next ( )   ,   4   )   ;
}


/*
 * Function to read the next character array.
 * Splits the input string into individual characters.
 */
function   nextCharArray ( )   {
 return   myconv (   next ( )   ,   6   )   ;
}


/* Retrieves the next item from the global input object. */
function   next ( )   {
 return   obj .   next ( )   ;
}


// Checks if there are more items available in the input stream.
function   hasNext ( )   {
 return   obj .   hasNext ( )   ;
}


/*
 * Utility function to read all input from standard input.
 * Reads the entire file, trims whitespace, and splits by newlines.
 */
function   myin ( )   {
 return   require (   "fs"   )   .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   .   trim ( )   .   split (   "\n"   )   ;
}


/*
 * Initializes the global input object responsible for managing
 * the input stream, including methods to check for next items
 * and retrieve them.
 */
function   init ( )   {

 var   inputFile   =   myin ( )   ;


 var   returnObj   =   {
 "list"   :   inputFile   ,
 "index"   :   0   ,
 "max"   :   inputFile .   length   ,

 "hasNext"   :   function ( )   {
 return   (   this .   index   <   this .   max   )   ;
 }   ,

 "next"   :   function ( )   {
 if   (   !   this .   hasNext ( )   )   {
 throw   "ArrayIndexOutOfBoundsException これ以上ないよ"   ;
 }   else   {
 var   returnInput   =   this .   list   [   this .   index   ]   ;
 this .   index   ++   ;
 return   returnInput   ;
 }
 }
 }   ;


 return   returnObj   ;

}


// Function for standard output (console.log).
function   myout (   t   )   {
 console .   log (   t   )   ;
}

// Function for standard error output (console.error).
function   myerr (   t   )   {
 console .   error (   t   )   ;
}


/*
 * This section describes the 'no' parameter for the myconv function.
 * It dictates how the input 'i' should be processed or converted.
 *
 * [no] parameter handling:
 *   - Default (unknown/error): Returns 'i' as is.
 *   - 1: Converts 'i' to an integer (parseInt).
 *   - 2: Splits 'i' by half-width spaces into a string array.
 *   - 4: Splits 'i' by half-width spaces, then maps elements to numbers.
 *   - 6: Splits 'i' into a character array (each character is an element).
 *   - 7: Splits 'i' into a character array, then maps elements to numbers.
 *   - 8: Joins elements of 'i' with half-width spaces.
 *   - 9: Joins elements of 'i' with newlines.
 *   - 0: Joins elements of 'i' without any separator.
 */
function   myconv (   i   ,   no   )   {
 try   {
 switch   (   no   )   {
 case   1   :
 return   parseInt (   i   )   ;
 case   2   :
 return   i .   split (   " "   )   ;
 case   4   :
 return   i .   split (   " "   )   .   map (   (   a   )   =>   Number (   a   )   )   ;
 case   6   :
 return   i .   split (   ""   )   ;
 case   7   :
 return   i .   split (   ""   )   .   map (   (   a   )   =>   Number (   a   )   )   ;
 case   8   :
 return   i .   join (   " "   )   ;
 case   9   :
 return   i .   join (   "\n"   )   ;
 case   0   :
 return   i .   join (   ""   )   ;
 default   :
 return   i   ;
 }
 }   catch   (   e   )   {
 return   i   ;
 }
}


// The main function where the program's logic resides.
function   Main ( )   {

 var   N   =   nextInt ( )   ;

 var   list   =   new   Array (   N   )   ;

 for   (   var   i   =   0   ;   i   <   N   ;   i   ++   )   {
 list   [   i   ]   =   nextIntArray ( )   ;
 }


 var   minus   =   0   ;
 var   output   =   0   ;

 /* Calculate the initial sum of all elements in the list. */
 for   (   var   i   =   0   ;   i   <   N   ;   i   ++   )   {
 for   (   var   j   =   0   ;   j   <   N   ;   j   ++   )   {
 output   +=   list   [   i   ]   [   j   ]   ;
 }
 }

 output   /=   2   ; // Divide the total sum by two.


 /*
  * This nested loop structure implements a variation of the Floyd-Warshall algorithm
  * to check for path validity and identify redundant edges in a graph represented
  * by the 'list' adjacency matrix.
  */
 for   (   var   k   =   0   ;   k   <   N   ;   k   ++   )   {
 for   (   var   i   =   0   ;   i   <   N   ;   i   ++   )   {
 for   (   var   j   =   0   ;   j   <   N   ;   j   ++   )   {

 // If a shorter path is found via 'k', it's an invalid input state.
 if   (   list   [   i   ]   [   j   ]   >   (   list   [   i   ]   [   k   ]   +   list   [   k   ]   [   j   ]   )   )   {
 myout (   -1   )   ;
 return   ;
 }   else   if   (   list   [   i   ]   [   j   ]   ==   (   list   [   i   ]   [   k   ]   +   list   [   k   ]   [   j   ]   )   &&   i   !=   k   &&   j   !=   k   )   {
 // If an equally long path exists via 'k' (and 'k' is not 'i' or 'j'),
 // then the direct edge (i,j) is redundant and its weight should be subtracted.
 minus   +=   list   [   i   ]   [   j   ]   ;
 }
 }
 }
 }


 minus   /=   2   ; // The sum of redundant edges is also divided by two.


 myout (   output   -   minus   )   ; // Output the final calculated value.

}