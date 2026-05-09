/* This file contains unit tests for the tokenize utility function.
 * It uses the 'should' assertion library and Mocha for testing. */

"use strict" ; // Enforce strict mode for better code quality.


require ( "should" ) ; // Import the 'should' assertion library.


// Load the tokenize helper function from the specified path.
var tokenize = require ( '../../lib/helpers/tokenize.js' ) ;

// Load English language data, which likely contains stopwords or other linguistic rules.
var languageData = require ( '../../lib/languages.json' ) . en ;



// Describe a test suite for the 'tokenize()' function.
describe ( "tokenize()" , function ( ) {


    // Test case 1: Basic tokenization of a simple string.
    it ( "should send back tokens" , function ( ) {

        // Call the tokenize function with a simple sentence and language data.
        var tokens = tokenize ( "hello world" , languageData ) ;

        // Assert that the returned tokens array matches the expected structure and content.
        tokens . should . eql ( [
              { token : 'hello' , stopword : true  } , // 'hello' is expected to be a stopword.
              { token : 'world' , stopword : false }   // 'world' is not a stopword.
        ] ) ;

    } ) ;


    // Test case 2: Tokenization with custom separators (e.g., numbers, underscores).
    it ( "should send back tokens with custom separators" , function ( ) {

        // Input string includes numbers and an underscore acting as separators.
        var tokens = tokenize ( "hello486 world_lol" , languageData ) ;

        // Verify the tokenization result.
        tokens . should . eql ( [
              { token : 'hello486' , stopword : false } , // The first token, including numbers.
              { token : 'world' ,    stopword : false } , // 'world' token.
              { token : 'lol' ,      stopword : false }   // 'lol' token, separated by underscore.
        ] ) ;

    } ) ;


    // Test case 3: Ensure email addresses are treated as a single token and not split.
    it ( "should not split emails" , function ( ) {

        // Input string contains a complete email address.
        var tokens = tokenize ( "hello world test@email.com" , languageData ) ;

        // Assert that the email address remains a single token.
        tokens . should . eql ( [
              { token : 'hello' ,          stopword : true  } , // Standard stopword.
              { token : 'world' ,          stopword : false } , // Standard word.
              { token : 'test@email.com' , stopword : false }   // The email address as a single token.
        ] ) ;

    } ) ;

} ) ; // End of the 'tokenize()' test suite.