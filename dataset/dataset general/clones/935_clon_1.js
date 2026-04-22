// This is a test file for the mapcat library.
// It ensures that the public API is correctly exposed.

/*
 * This section handles module dependencies.
 * We are requiring the mapcat library itself.
 */
var     mapcat      =       require     (   '../lib'    )   ;


// Here we define a test case.
// The name of the test describes its purpose clearly.
exports [   'test that the api is properly exposed in the top level'    ]   =
    function    (   assert  )   {

        // Inside the test function, we perform an assertion.
        // We are checking the type of a specific member of the mapcat object.
        // The expected type is "function".
        assert  .   equal   (   typeof      mapcat  .   cat     ,       "function"      )   ;

    }   ; // End of the test case definition.


// Additional blank lines for visual separation.


// File ends here.