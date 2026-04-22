/*
 *  This file contains utility functions for competitive programming.
 *  It includes an input reader, type converters, and a main function.
 */

// Global variable to store the input data read from stdin.
// It reads the entire file, trims whitespace, and splits by newlines.
var input = require("fs") . readFileSync( "/dev/stdin" , "utf8" ) . trim() . split( "\n" ) ;


/**
 *  An object to manage input iteration.
 *  It provides methods like `next()` to get the next item
 *  and `hasNext()` to check if there are more items.
 */
var obj = {
	"list"  :  input ,  // The array of input lines
	"index" :  0 ,      // Current index in the input array
	"max"   :  input.length , // Total number of input lines

	/**
	 *  Retrieves the next element from the input list.
	 *  Throws an error if no more elements are available.
	 *  @returns {string} The next input line.
	 */
	"next"  :  function ( )  {
		// Check if there are more elements to process.
		if  (  ! this . hasNext ( )  )  {
			throw "NoSuchElementException:次に要素は無いよ" ;
		}

		// Retrieve the current element and advance the index.
		var returnObj = this . list [ this . index ] ;
		this . index ++ ;
		return returnObj ;
	} ,

	/**
	 *  Checks if there are more elements in the input list.
	 *  @returns {boolean} True if more elements exist, false otherwise.
	 */
	"hasNext"  :  function ( )  {
		return  (  this . index  <  this . max  ) ;
	}
} ;

// --- Application Entry Point ---
// Call the main function to start program execution.
Main ( ) ;

// --- Helper Functions for Input Processing ---

/**
 *  Gets the next raw string from the input.
 *  @returns {string} The next input string.
 */
function next ( )  {
	return obj . next ( ) ;
}

/**
 *  Gets the next input string and converts it to an integer.
 *  @returns {number} The next input as an integer.
 */
function nextInt ( )  {
	return myconv ( next ( ) , 1 ) ;
}

/**
 *  Gets the next input string and splits it by spaces into an array of strings.
 *  @returns {string[]} An array of strings.
 */
function nextStrArray ( )  {
	return myconv ( next ( ) , 2 ) ; // Splits by half-width space.
}

/**
 *  Gets the next input string, splits it by spaces, and converts elements to numbers.
 *  @returns {number[]} An array of numbers.
 */
function nextIntArray ( )  {
	return myconv ( next ( ) , 4 ) ; // Splits by half-width space and converts to numbers.
}

/**
 *  Gets the next input string and splits it into an array of single characters.
 *  @returns {string[]} An array of characters.
 */
function nextCharArray ( )  {
	return myconv ( next ( ) , 6 ) ; // Splits into individual characters.
}

/**
 *  Checks if there are more elements in the input stream.
 *  @returns {boolean} True if more elements are available, false otherwise.
 */
function hasNext ( )  {
	return obj . hasNext ( ) ;
}

// --- Output Functions ---

/**
 *  Prints the given argument to standard output.
 *  @param {*} t - The value to print.
 */
function myout ( t )  {
	console . log ( t ) ; // Standard output.
}

/**
 *  Prints the given argument to standard error output.
 *  @param {*} t - The value to print.
 */
function myerr ( t )  {
	console . error ( t ) ; // Standard error output.
}

/*
 *  myconv function: A versatile converter for input and array manipulation.
 *
 *  [no] parameter handling:
 *  - Unknown value or error: Returns the input 'i' as is.
 *  - 1: Converts 'i' to an integer.
 *  - 2: Splits 'i' by half-width spaces into a string array.
 *  - 4: Splits 'i' by half-width spaces and converts elements to numbers.
 *  - 6: Splits 'i' into an array of individual characters.
 *  - 7: Splits 'i' into characters and converts them to numbers.
 *  - 8: Joins array 'i' with half-width spaces.
 *  - 9: Joins array 'i' with newlines.
 *  - 0: Joins array 'i' with no separator.
 */
function myconv ( i , no )  {
	try  {
		switch ( no )  {
			case 1 :
				return parseInt ( i ) ;
			case 2 :
				return i . split ( " " ) ;
			case 4 :
				return i . split ( " " ) . map ( ( a )  =>  Number ( a ) ) ;
			case 6 :
				return i . split ( "" ) ;
			case 7 :
				return i . split ( "" ) . map ( ( a )  =>  Number ( a ) ) ;
			case 8 :
				return i . join ( " " ) ;
			case 9 :
				return i . join ( "\n" ) ;
			case 0 :
				return i . join ( "" ) ;
			default :
				return i ;
		}
	}
	catch ( e )  {
		return i ; // In case of error during conversion, return original input.
	}
}

/**
 *  The main function where the program logic resides.
 *  It calculates an output based on an integer input N.
 */
function Main ( )  {
	// Read an integer N from the input.
	var N = nextInt ( ) ;

	// Calculate the base output value.
	var output = Math . floor ( N / 11 ) * 2 ;

	// Calculate the remainder when N is divided by 11.
	var tmp = N % 11 ;

	// Adjust the output based on the remainder.
	if  ( tmp  >=  6 )  {
		output  +=  2 ;
	}
	else if  ( tmp  >  0 )  {
		output ++ ;
	}

	// Print the final calculated output.
	myout ( output ) ;
}