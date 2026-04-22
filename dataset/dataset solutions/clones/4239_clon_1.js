/*
 * This file contains a utility for reading input from stdin
 * and a main function to solve a specific problem.
 * It demonstrates a common pattern for competitive programming in JavaScript.
 */
"use strict" ; // Enforce strict mode for better error handling and cleaner code.

/**
 * Creates an input reader object.
 * This function reads all input from /dev/stdin, decodes it as UTF-8,
 * trims any leading/trailing whitespace, and then splits the content
 * into an array of lines based on the newline character.
 * The returned object provides methods to check for the existence of
 * more input lines and to retrieve the next available line.
 *
 * @returns {object} An object with 'list', 'index', 'max', 'hasNext', and 'next' properties.
 */
const create = ( ) => {
   // Utilize Node.js 'fs' module to read the entire content of standard input.
   // The input is expected to be a file at /dev/stdin in a typical competitive programming environment.
   const input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;

   // Initialize the result object which acts as an input stream reader.
   const res = {
      "list"    : input ,                    // The array containing all lines of input.
      "index"   : 0 ,                        // The current position (index) in the 'list' array.
      "max"     : input . length ,           // The total number of lines in the 'list' array.

      /**
       * Checks if there are more elements (lines) available to be read from the input stream.
       * @returns {boolean} True if 'index' is less than 'max', indicating more lines are present; false otherwise.
       */
      "hasNext" : function ( ) {
         return this . index < this . max ;
      } ,

      /**
       * Retrieves the next available element (line) from the input stream.
       * This method increments the internal 'index' after returning the current line.
       * @returns {string} The next line from the 'list' array.
       * @throws {string} "ArrayIndexOutOfBoundsException" if no more elements are available.
       */
      "next"    : function ( ) {
         if ( ! this . hasNext ( ) ) {
            // If there are no more elements, throw an error to signal the end of input.
            throw "ArrayIndexOutOfBoundsException" ;
         } else {
            // Return the current line and then increment the index for the next call.
            return this . list [ this . index ++ ] ;
         }
      }
   } ;

   return res ; // Return the fully constructed input reader object.
} ;


// Create a global instance of the input reader.
// This instance will be used by all subsequent input-related helper functions.
const o = create ( ) ;


// --- Input Helper Functions ---
// These functions provide convenient ways to parse different types of input.

/**
 * Retrieves the next raw string token from the input stream.
 * @returns {string} The next line of input as a string.
 */
const next = ( ) => o . next ( ) ;

/**
 * Retrieves the next token from the input stream and parses it as an integer.
 * Uses `parseInt()` to convert the string to a base-10 integer.
 * @returns {number} The next input token converted to an integer.
 */
const nextInt = ( ) => parseInt ( o . next ( ) ) ;

/**
 * Retrieves the next line, then splits it into an array of strings using a space as a delimiter.
 * Useful for lines containing multiple space-separated string values.
 * @returns {string[]} An array of strings.
 */
const nextStrArray = ( ) => o . next ( ) . split ( " " ) ;

/**
 * Retrieves the next line, splits it into an array of strings by spaces,
 * and then maps each string element to its integer representation.
 * Ideal for lines containing multiple space-separated integer values.
 * @returns {number[]} An array of integers.
 */
const nextIntArray = ( ) => o . next ( ) . split ( " " ) . map ( el => parseInt ( el ) ) ;

/**
 * Retrieves the next line and splits it into an array of individual characters.
 * Useful for processing input as a sequence of characters.
 * @returns {string[]} An array of characters.
 */
const nextCharArray = ( ) => o . next ( ) . split ( "" ) ;

/**
 * Checks if there are any more input lines available.
 * This is a direct delegate to the 'hasNext' method of the input reader object 'o'.
 * @returns {boolean} True if more input is available, false otherwise.
 */
const hasNext = ( ) => o . hasNext ( ) ;


// --- Output Helper Function ---

/**
 * A custom output function that logs all provided arguments to the console.
 * Uses the spread operator to accept any number of arguments.
 * @param {...any} x - Any number of arguments to be logged.
 */
const myout = ( ... x ) => console . log ( ... x ) ;


/**
 * The main entry point of the program.
 * This function encapsulates the primary logic for solving the problem.
 * It reads specific input values, performs calculations, and prints the result.
 */
const Main = ( ) => {
   // Read two integers, 'n' and 'm', from a single line of input.
   // Assuming they are space-separated.
   const [ n , m ] = nextIntArray ( ) ;

   // Perform the calculation as per the problem's formula.
   // The formula is: 1900 * m + 100 * (n - m) * 2^m
   // Math.pow(2, m) calculates 2 raised to the power of m.
   console . log ( 1900 * m + 100 * ( n - m ) * Math . pow ( 2 , m ) ) ;

} ;

// Execute the Main function to begin the program's execution flow.
Main ( ) ;