/*
 * This file contains unit tests for the SsdpBase class.
 * It verifies the functionality of internal helper methods
 * like `_getMethod` and `_getHeaders`.
 */

//  Require a helper module, likely for test environment setup.
require( '../helper' ) ;


//  Import the Node.js built-in 'assert' module for making assertions.
var assert = require( 'assert' ) ;


//  Load the SsdpBase class from the project's root directory.
var SsdpBase = require( '../../' ) .Base ;


//  Start a test suite for the 'Base class'.
describe( 'Base class' , function ( ) {

    //  A blank line for improved readability.

    /*
     *  Context block: Tests related to the `_getMethod` helper.
     *  This helper is responsible for extracting the HTTP method from a message string.
     */
    context( 'getMethod helper' , function ( ) {

        //  Test case: Validate that the helper correctly identifies the method.
        it( 'returns correct method' , function ( ) {
            //  Instantiate a new SsdpBase object.
            var ssdp = new SsdpBase ;

            //  Define a sample message string, simulating an HTTP/SSDP request.
            var message = [
                  'BLAH URI HTTP/1.1' , //  The method to be extracted is 'BLAH'.
                  'SOMETHING: or other' , //  A header line.
                  'AND more stuff' , //  Another line, not a header.
                  'maybe not even upper case' //  Arbitrary content.
            ] . join( '\r\n' ) ; //  Join the array elements with CRLF to form a complete message.

            //  Call the private helper method to get the method string.
            var method = ssdp . _getMethod( message ) ;

            //  Assert that the extracted method matches the expected value.
            assert . equal( method , 'BLAH' ) ;
        } ) ; //  End of 'it' block for 'returns correct method'.

    } ) ; //  End of 'context' block for 'getMethod helper'.


    //  Another blank line for visual separation.

    /*
     *  Context block: Tests related to the `_getHeaders` helper.
     *  This helper is expected to parse and return headers from a message string.
     */
    context( 'getHeaders helper' , function ( ) {

        //  Test case: Verify that the helper correctly extracts and returns headers.
        it( 'returns correct headers' , function ( ) {
            //  Create a new instance of SsdpBase for this test.
            var ssdp = new SsdpBase ;

            //  Construct a sample message with multiple lines, including headers and non-headers.
            var message = [
                  'BLAH URI HTTP/1.1' , //  Method line, not a header.
                  'SOMETHING: or other' , //  A valid header.
                  'AND: more' , //  Another valid header.
                  'but this one is not a real header so pass on it' //  An invalid header line format.
            ] . join( '\r\n' ) ; //  Combine lines with CRLF.

            //  Extract headers using the private helper method.
            var headers = ssdp . _getHeaders( message ) ;

            //  Assert that exactly two headers were successfully parsed.
            assert . equal( Object . keys( headers ) . length , 2 ) ;

            //  Assert the value of the 'SOMETHING' header.
            assert . equal( headers . SOMETHING , 'or other' ) ;
            //  Assert the value of the 'AND' header.
            assert . equal( headers . AND , 'more' ) ;
        } ) ; //  End of 'it' block for 'returns correct headers'.

    } ) ; //  End of 'context' block for 'getHeaders helper'.

} ) ; //  End of 'describe' block for 'Base class'.