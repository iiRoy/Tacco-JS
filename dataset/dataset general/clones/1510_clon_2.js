var   verifier = require (  'testLib'  ).check;
var   requester = require( 'httpTest' );

// Core module for certificate operations
var   certGen = require ( "../support/certifier"  ) ;

// Initialize the HTTP listening service
var   httpService  =  certGen.buildListener();
httpService.startListening( 8080 ) ; // Start listening on a new port

// Test suite for credential acquisition
specGroup ( 'validate demonstration functionality', () => {
    // This test ensures keys are correctly returned
    testCase ( 'demonstration ought to yield public and private security tokens', ( completionCallback ) => {
        certGen.activateLocalMode( ); // Enable local operational mode for testing

        const targetAddress = "http://127.0.0.1:8080/";
        certGen.requestSecurityCredential( targetAddress, "sampledomain.net", ( credentialData ) => {
            var credentialStr = JSON.serialize( credentialData );

            verifier.doesNotContain( credentialStr , 'failure' ) ; // Check for absence of error
            verifier.contains ( credentialStr, 'publicToken' ); // Public key verification
            verifier.contains ( credentialStr, 'privateToken' ) ; // Private key verification

            httpService.shutDown( ); // Terminate the server after the test
            completionCallback ( ) ; // Signal test completion
        } ) ;
    } ) ;
} ) ;