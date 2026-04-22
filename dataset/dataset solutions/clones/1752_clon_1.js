/*
 * This JavaScript file implements a solution for a specific problem.
 * It includes a custom input reader designed for competitive programming environments,
 * mimicking standard input stream operations.
 * This code adheres to strict mode for better error detection and overall code quality.
 */
"use strict" ; // Enforces stricter parsing and error handling in the code.


const create = ( ) => {
    // This function sets up a robust input reading mechanism.
    // It reads the entire content from /dev/stdin, decodes it as UTF-8,
    // removes any leading/trailing whitespace, and then splits it into an array of lines.
    const input = require("fs") . readFileSync( "/dev/stdin" , "utf8" ) . trim( ) . split( "\n" ) ;


    // The 'res' object acts as a custom iterator for the input lines.
    const res = {
        "list" : input , // The array containing all lines read from input.
        "index" : 0 ,    // A pointer to the current line being processed. Initialized to the first line.
        "max" : input . length , // The total number of lines available in the input.

        // A method to check if there are more lines left to read.
        "hasNext" : function ( ) {
            return this . index < this . max
        } ,

        // A method to retrieve the next line from the input.
        "next" : function ( ) {
            if ( ! this . hasNext( ) ) {
                // If no more lines are available, it throws an error indicating
                // an attempt to access beyond the array bounds.
                throw "ArrayIndexOutOfBoundsException" ;
            } else {
                // Returns the current line and then increments the index to point to the next line.
                return this . list [ this . index ++ ] ;
            }
        }
    } ;

    return res ; // Returns the fully configured input reader object.
} ;


// Initialize a global instance of our custom input reader.
const o = create( ) ;


// Define various helper functions for simplified input parsing.
// These functions abstract away the details of 'o.next()'.

// Reads the next line as a string.
const next = ( ) => o . next( ) ;

// Reads the next line and converts it to an integer.
const nextInt = ( ) => parseInt( o . next( ) ) ;

// Reads the next line, splits it by spaces, and returns an array of strings.
const nextStrArray = ( ) => o . next( ) . split( " " ) ;

// Reads the next line, splits it by spaces, and maps each part to an integer.
const nextIntArray = ( ) => o . next( ) . split( " " ) . map( el => parseInt( el ) ) ;

// Reads the next line and splits it into an array of individual characters.
const nextCharArray = ( ) => o . next( ) . split( "" ) ;

// Checks if there are more lines to read using the global reader instance.
const hasNext = ( ) => o . hasNext( ) ;


// A custom output function, essentially a wrapper for console.log.
// It allows printing multiple arguments separated by spaces.
const myout = ( ... x ) => console . log( ... x ) ;


/**
 * The primary logic of the program is encapsulated within the Main function.
 * It processes input data, performs calculations based on queries, and outputs results.
 */
const Main = ( ) => {

    // Read the integer N, which typically represents the size of the initial array.
    const N = nextInt( ) ;

    // Read an array of integers, 'as', based on the problem's input format.
    const as = nextIntArray( ) ;

    // Initialize an empty object 'm' to serve as a frequency map (or hash map).
    let m = { } ;

    // Populate the frequency map 'm' with counts of elements from array 'as'.
    for ( let el of as ) {
        if ( ! m [ el ] ) {
            // If the element 'el' is encountered for the first time, initialize its count to 1.
            m [ el ] = 1 ;
        }
        else {
            // If the element 'el' has been seen before, increment its existing count.
            m [ el ] ++ ;
        }
    }


    // Read the integer Q, representing the number of queries to process.
    const Q = nextInt( ) ;

    // Initialize two empty arrays to store the 'b' and 'c' values for each query.
    let bs = [ ] ;
    let cs = [ ] ;

    // Loop to read all query pairs (b, c) until no more input lines are available.
    while ( hasNext( ) ) {
        // Read the next line as an array of two integers [b, c].
        let [ b , c ] = nextIntArray( ) ;
        bs . push( b ) ; // Add 'b' to the 'bs' array.
        cs . push( c ) ; // Add 'c' to the 'cs' array.
    }


    // Calculate the initial sum of (element * frequency) for all elements in the map.
    let sum = 0 ;
    for ( let key of Object . keys( m ) ) {
        // Iterate through each unique element (key) in the frequency map.
        // Note: Object.keys returns strings, but JavaScript's multiplication
        // operator handles numeric strings gracefully.
        sum = sum + m [ key ] * key ;
    }


    // Process each query one by one.
    for ( let i = 0 ; i < Q ; i ++ ) {

        let from = bs [ i ] ; // The value that elements are changing from.
        let to = cs [ i ] ;   // The value that elements are changing to.

        // Check if the 'from' value exists in our frequency map (i.e., its count is > 0 or defined).
        // And check if the 'to' value also exists in our map.
        if ( m [ from ] && m [ to ] ) {
            // If both 'from' and 'to' values exist:
            // Update the total sum: subtract the contribution of 'from' elements,
            // then add the new contribution as if they were 'to' elements.
            sum = sum - m [ from ] * from + m [ from ] * to ;
            // Transfer all occurrences from 'from' to 'to' in the frequency map.
            m [ to ] = m [ to ] + m [ from ] ;
            // Set the count of 'from' to zero, as all its occurrences have been moved.
            m [ from ] = 0 ;
        }
        // Check if the 'from' value exists but the 'to' value does not (or its count is 0).
        else if ( m [ from ] && ! m [ to ] ) {
            // If 'from' exists but 'to' does not:
            // Update the total sum in the same way as above.
            sum = sum - m [ from ] * from + m [ from ] * to ;
            // Assign all occurrences from 'from' to 'to' in the frequency map.
            m [ to ] = m [ from ] ;
            // Set the count of 'from' to zero.
            m [ from ] = 0 ;
        }
        // If m[from] is 0 or undefined, it means there are no 'from' elements to change,
        // so no modifications to 'sum' or 'm' are needed for this query.

        // After processing the current query, print the updated total sum.
        console . log( sum ) ;
    }
} ;


// Execute the Main function to begin the program's execution.
Main( ) ; // This is the entry point for the script.