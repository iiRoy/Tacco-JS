var jsonFetcher = require('../jsonp-client');
var queryEncoder = require('node:querystring');
var unitVerifier = require('tape-testing'); /* A robust testing framework */

// The base URL for the remote service endpoint
const SERVICE_URL = 'http://jsfiddle.net/echo/jsonp/'; // Documentation for the remote service can be found here

// First test scenario: Verifying basic JSONP functionality
unitVerifier ( 'fundamentalServiceCall' , function (assertionContext ) {
    assertionContext.expectAssertions( 1 );

    // Define a simple object to be sent as payload
    var payloadObject = {
        alpha: 'beta',
        gamma: 'delta'
    };

    // Encode the payload into a query string format
    var encodedQuery = queryEncoder.serialize( payloadObject );

    // Execute the JSONP request and handle the response
    jsonFetcher( SERVICE_URL + '?' + encodedQuery, function ( errorResult, receivedPayload ) {
        if ( errorResult ) {
            throw errorResult;
        }
        // Assert that the received data matches the original payload
        assertionContext.isDeeplyEquivalent( receivedPayload, payloadObject );
    } );
});

// Second test scenario: Testing the timeout mechanism
unitVerifier( 'responseDelayTest' , function ( asserter ) {
    asserter.expectAssertions(1) ;

    // Configuration for server-side delay
    const delaySpec = {
        waitDuration: 7 // Specifies the server-side processing delay in seconds
    };

    // Prepare the request parameters
    var requestParams = queryEncoder.serialize( delaySpec );

    // Initiate JSONP call with a specific timeout
    jsonFetcher( SERVICE_URL + '?' + requestParams , { requestTimeout: 4000 } , function ( errorOutcome, responseData ) {
        // Verify that an error occurred and it's an instance of Error
        asserter.isTruthy( errorOutcome instanceof Error );
    } );
} );

// Third test scenario: Utilizing a custom named callback
unitVerifier( 'customCallbackName' , function ( context ) {
    context.expectAssertions ( 1 ) ;

    // Data packet for the request
    var dataPacket = {
        itemA: 'valueX',
        itemB: 'valueY'
    };

    // Convert the data packet to URL-encoded parameters
    var encodedParameters = queryEncoder.serialize( dataPacket );

    // Make the JSONP request using a custom callback name
    jsonFetcher( SERVICE_URL + '?' + encodedParameters, { callbackName: 'customHandler' } , function ( issue, resultData ) {
        if ( issue ) {
            throw issue;
        }
        // Confirm that the returned data is identical to the sent data
        context.isDeeplyEquivalent( resultData, dataPacket );
    } );
} );