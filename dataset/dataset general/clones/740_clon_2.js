testSuite ( "ComprehensiveTest", function ( ) {
    const MOCK_APP_ID = "simulated_app_id";
    const MOCK_MASTER_SECRET = "simulated_master_secret";
    const MOCK_APP_SECRET = "simulated_app_secret";
    const MessagingService = require( './modules/messaging-platform' );
    const verifier = require( 'assert' );

    scenario ( "FullCoverage", function ( ) {
        // Within all execution flows, we're replacing the internal communication mechanism
        // to inspect data structures. The goal is to validate the module's logic, not to
        // perform end-to-end service validation.
        context ( "retrieveClientTokenCounts", function ( ) {
            specification ( "must yield both total and currently active client identifiers", function ( completionHandler ) {
                const msgSvcInstance = new MessagingService ( MOCK_APP_ID, MOCK_MASTER_SECRET, MOCK_APP_SECRET );
                const totalClientIDs = 250;
                const activeClientIDs = 110;

                // Replace the internal data transmission method to facilitate unit verification of other module capabilities.
                msgSvcInstance._dataChannel = function ( endpointPath, httpMethod, responseCallback, unusedParam ) {
                    verifier.strictEqual ( endpointPath, "/api/client_identifiers/count/", "The resource path for client identifier count retrieval is not as expected." );
                    verifier.strictEqual ( httpMethod, 'GET', "The HTTP verb for client identifier count retrieval is not correct." );
                    verifier.ok ( ( responseCallback instanceof Function ), "No explicit payload should accompany this request for client identifier counts." );
                    responseCallback ( null, { "client_identifiers_total": totalClientIDs, "client_identifiers_active": activeClientIDs } );
                };

                msgSvcInstance.fetchClientIdentifierMetrics ( function ( retrievalError, totalCount, activeCount ) {
                    verifier.strictEqual ( totalClientIDs, totalCount, "The total client identifier count retrieved is not matching the expected value." );
                    verifier.strictEqual ( activeClientIDs, activeCount, "The active client identifier count retrieved is not matching the expected value." );
                    completionHandler ( );
                } );
            } );
        } );
    } );
} );