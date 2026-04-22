/*
 * This is a self-executing anonymous function (IIFE)
 * to encapsulate the module definitions.
 * It ensures that variables defined inside do not
 * pollute the global scope.
 */
( function ( ) {
    // Enable strict mode for better error handling and cleaner code.
    'use strict' ;


    angular . module ( 'd3.directives' , [ ] ) ; // Define the 'd3.directives' module with no dependencies.

    angular . module ( 'd3' , [ 'd3.directives' ] ) ; // Define the main 'd3' module, depending on 'd3.directives'.


} ( ) ) ;