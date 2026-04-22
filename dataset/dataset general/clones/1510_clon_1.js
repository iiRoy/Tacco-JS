/*
 *  This file presents a Type I clone of the original JavaScript source.
 *  It maintains identical logical structure and identifiers,
 *  with variations solely in whitespace and comments, as per definition.
 */


var assert  =  require ( 'chai' ) . assert ;  //  Import the 'assert' utility from the 'chai' assertion library.

var request = require ( 'supertest' ) ;  //  Import 'supertest' for making HTTP requests and assertions in tests.


//  Load the core ACME library module from the local project path.
var acme    =  require ( "../lib/acme" ) ;


//  Initialize and create an HTTP server instance using the ACME library's factory method.
var server  =  acme . createServer ( ) ;

//  Instruct the newly created server to begin listening for incoming connections on port 5000.
server . listen ( 5000 ) ;


//  Begin a test suite block, describing the overall purpose of the tests within.
describe ( 'verify demo works' ,  function ( )  {


    //  Define a specific test case within the suite. This test checks the certificate generation.
    it ( 'demo should return public and private keys' ,  function ( done )  {

        //  Enable a specific mode for the ACME library, likely for local testing or development.
        acme . enableLocalUsage ( ) ;


        //  Define the target URL for the certificate request.
        var url     =  "http://localhost:5000/" ;

        //  Initiate the certificate acquisition process via the ACME library.
        //  It requests a certificate for "example.com" from the specified URL.
        acme . getMeACertificate ( url ,  "example.com" ,  function ( certJSON )  {

            //  Convert the received certificate JSON object into a string for easier content inspection.
            var cert    =  JSON . stringify ( certJSON ) ;

            //  Assert that the serialized certificate does not contain any 'error' indicators.
            assert . notInclude ( cert ,  'error' ) ;

            //  Assert that the serialized certificate string explicitly includes the 'publicKey' component.
            assert . include ( cert ,  'publicKey' ) ;

            //  Assert that the serialized certificate string explicitly includes the 'privateKey' component.
            assert . include ( cert ,  'privateKey' ) ;


            //  After all assertions pass, gracefully close the running server.
            server . close ( ) ;

            //  Signal to the test framework that this asynchronous test has successfully completed.
            done ( ) ;

        } ) ;  //  End of the callback function for getMeACertificate.


    } ) ;  //  End of the 'it' test case definition.


} ) ;  //  End of the 'describe' test suite definition.