// This file contains utility functions for processing styling information.
// It's part of a larger system for front-end development verification.

 var   verifier   =   require  (  'assert'  )  ;  // Module for assertion testing.
 var   diskOps    =   require  (  'fs'  )  ;     // File system operations module.
var    styleProcessor   =   require  (  '..'  )  ;   // Our custom style processing library.
 require  (  'mocha-as-promised'  )  ( )  ;  // Setup for asynchronous testing frameworks.


// Exports a function to process styling code and verify its output against an expectation.
 exports . processStylingRequest   =   function   (   sourceText  ,   expectedResult   )    {
     // The core logic is to compile the given source, then assert against the expected outcome.
    return   styleProcessor . compile  (   sourceText   ) . then  (  function   (   generatedText   )    {
        // Assert that the processed output matches the anticipated result string.
        verifier . equal  (   generatedText  ,   expectedResult   ) ;
    }  )  ;
} ;