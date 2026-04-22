suite ( "All" , function ( ) {
    // This block defines constants and imports necessary modules
    // for the entire test suite.
    var FAKE_KEY = "fakekey" ;

    var FAKE_MASTER_KEY = "fakemasterkey" ;

    var FAKE_SECRET = "fakesecret" ;

    var UA = require ( "../lib/urban-airship" ) ;

    var assert = require ( "assert" ) ;


    test ( "All" , function ( ) {
        // For testing purposes, the internal _transport mechanism of the Urban Airship library
        // is overridden. This allows verification of request payloads and methods
        // without making actual network calls to the Urban Airship API.
        // The focus here is on unit testing the library's functionality, not integration.
        describe ( "getDeviceTokenCounts" , function ( ) {
            it ( "should return total and active device tokens" , function ( done ) {
                // Initialize a new Urban Airship client instance with mock credentials.
                var ua = new UA ( FAKE_KEY , FAKE_MASTER_KEY , FAKE_SECRET ) ;

                // Define expected device token counts for the mock response.
                var num_device_tokens = 137 ;
                var num_active_tokens = 64 ;

                // Override the internal _transport function to simulate API responses.
                // This mock function will check the request parameters and provide a predefined response.
                ua . _transport = function ( path , method , request_data , callback ) {
                    // Assertions to verify the correctness of the generated API request.
                    assert . equal ( path , "/api/device_tokens/count/" , "Incorrect path for device token retrieval." ) ;
                    assert . equal ( method , "GET" , "Incorrect request method for device token retrieval." ) ;
                    assert . ok ( request_data instanceof Function , "No data should be passed to _transport for device token retrieval." ) ;

                    // Simulate the API response by calling the callback with mock data.
                    request_data ( null , { "device_tokens_count" : num_device_tokens , "active_device_tokens_count" : num_active_tokens } ) ;
                } ;

                // Call the actual library function under test.
                ua . getDeviceTokenCounts ( function ( error , num_devices , num_devices_active ) {
                    // Verify that the callback received the correct total device token count.
                    assert . equal ( num_device_tokens , num_devices , "Incorrect device token count." ) ;
                    // Verify that the callback received the correct active device token count.
                    assert . equal ( num_active_tokens , num_devices_active , "Incorrect device token count." ) ;
                    // Signal that the asynchronous test is complete.
                    done ( ) ;
                } ) ;
            } ) ;
        } ) ;
    } ) ;
} ) ;