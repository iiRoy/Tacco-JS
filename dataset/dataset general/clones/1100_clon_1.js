/*
 * This file contains a suite of Jasmine tests for the Apy library's
 * AJAX call functionalities.
 * It primarily focuses on verifying query parameters, HTTP methods,
 * and URL construction for various API operations.
 *
 * Generated as a Type I code clone, meaning only whitespace and comments
 * have been altered from the original source.
 */

describe ( 'Apy ajax calls' , function ( )
{
    // Declare a variable to hold the Apy instance for testing.
    var     PeopleApi;


    // Setup routine before each test specification.
    beforeEach ( function ( )
    {
        // Install the Jasmine AJAX mock library to intercept requests.
        jasmine . Ajax . install ( ) ;

        // Initialize a new Apy instance targeting the 'people' collection.
        PeopleApi   =   new     Apy (
            {
                    base        :   '/api/v3/'      ,
                    collection  :   'people'
            }
        )   ;
    } ) ;


    // Teardown routine after each test specification.
    afterEach ( function ( )
    {
        // Uninstall the Jasmine AJAX mock library to clean up.
        jasmine . Ajax . uninstall ( ) ;
    } ) ;



    // Group of tests focusing on query parameter handling.
    describe ( 'Query' , function ( )
    {

        // Test case: Ensure an error is thrown if parameters are not an object.
        it ( 'should throw an error if params are not passed as object' , function ( )
        {
            try
            {
                // Attempt to call 'all' with an invalid params type (string).
                PeopleApi . all ( function ( err , data ) { } , 'some string' ) ;
            }
            catch   ( err )
            {
                // Verify the error message is as expected.
                expect ( err . message ) . toEqual ( 'Params must be passed as object.' ) ;
            }
        } ) ;

        // Test case: Verify no query string is appended when no params are provided.
        it ( 'should not append query' , function ( )
        {
            // Call the 'all' method without any query parameters.
            PeopleApi . all ( function ( err , data ) { } ) ;

            // Assert that the URL does not contain any query string.
            expect ( jasmine . Ajax . requests . mostRecent ( ) . url ) . toBe ( '/api/v3/people/' ) ;
        } ) ;


        // Test case: Verify query string is appended for the 'all' method.
        it ( 'should append query for all method' , function ( )
        {
            // Call 'all' with specific query parameters.
            PeopleApi . all ( function ( err , data ) { } , { kind : 'nice' , job : 'developers' } ) ;

            // Expect the URL to include the correctly formatted query string.
            expect ( jasmine . Ajax . requests . mostRecent ( ) . url ) . toBe ( '/api/v3/people/?kind=nice&job=developers' ) ;
        } ) ;


        // Test case: Verify query string is appended for the 'find' method.
        it ( 'should append query for find method' , function ( )
        {
            // Call 'find' with an ID and query parameters.
            PeopleApi . find ( 12 , function ( err , data ) { } , { job : 'developers' } ) ;

            // Expect the URL to include both the ID and the query string.
            expect ( jasmine . Ajax . requests . mostRecent ( ) . url ) . toBe ( '/api/v3/people/12?job=developers' ) ;
        } ) ;


        // Test case: Verify query string is appended for the 'save' method.
        it ( 'should append query for save method' , function ( )
        {
            // Call 'save' with data and query parameters.
            PeopleApi . save ( { name : 'apy' } , function ( err , data ) { } , { job : 'developers' } ) ;

            // Expect the URL to include the query string (for collection-level save).
            expect ( jasmine . Ajax . requests . mostRecent ( ) . url ) . toBe ( '/api/v3/people/?job=developers' ) ;
        } ) ;

        // Test case: Verify query string is appended for the 'update' method.
        it ( 'should append query for update method' , function ( )
        {
            // Call 'update' with an ID, data, and query parameters.
            PeopleApi . update ( 12 , { name : 'apy' } , function ( err , data ) { } , { changed : 'name' } ) ;

            // Expect the URL to include both the ID and the query string.
            expect ( jasmine . Ajax . requests . mostRecent ( ) . url ) . toBe ( '/api/v3/people/12?changed=name' ) ;
        } ) ;


        // Test case: Verify query string is appended for the 'destroy' method.
        it ( 'should append query for destroy method' , function ( )
        {
            // Call 'destroy' with an ID and query parameters.
            PeopleApi . destroy ( 12 , function ( err , data ) { } , { soft : true } ) ;

            // Expect the URL to include both the ID and the query string.
            expect ( jasmine . Ajax . requests . mostRecent ( ) . url ) . toBe ( '/api/v3/people/12?soft=true' ) ;
        } ) ;

    } ) ; // End of 'Query' describe block.


    // Group of tests focusing on HTTP method verification.
    describe ( 'Method' , function ( )
    {

        // Test case: Ensure 'all' sends a GET request.
        it ( 'should send GET request for all' , function ( )
        {
            // Trigger the 'all' method.
            PeopleApi . all ( function ( err , data ) { } ) ;

            // Assert that the HTTP method used was GET.
            expect ( jasmine . Ajax . requests . mostRecent ( ) . method ) . toBe ( 'GET' ) ;
        } ) ;

        // Test case: Ensure 'find' sends a GET request.
        it ( 'should send GET request for find' , function ( )
        {
            // Trigger the 'find' method with an ID.
            PeopleApi . find ( 12 , function ( err , data ) { } ) ;

            // Assert that the HTTP method used was GET.
            expect ( jasmine . Ajax . requests . mostRecent ( ) . method ) . toBe ( 'GET' ) ;
        } ) ;

        // Test case: Ensure 'save' sends a POST request.
        it ( 'should send POST request for save' , function ( )
        {
            // Trigger the 'save' method with some data.
            PeopleApi . save ( { name : 12 } , function ( err , data ) { } ) ;

            // Assert that the HTTP method used was POST.
            expect ( jasmine . Ajax . requests . mostRecent ( ) . method ) . toBe ( 'POST' ) ;
        } ) ;

        // Test case: Ensure 'update' sends a PUT request.
        it ( 'should send PUT request for update' , function ( )
        {
            // Trigger the 'update' method with an ID and data.
            PeopleApi . update ( 12 , { name : 'apy' } , function ( err , data ) { } ) ;

            // Assert that the HTTP method used was PUT.
            expect ( jasmine . Ajax . requests . mostRecent ( ) . method ) . toBe ( 'PUT' ) ;
        } ) ;

        // Test case: Ensure 'destroy' sends a DELETE request.
        it ( 'should send DELETE request for destroy' , function ( )
        {
            // Trigger the 'destroy' method with an ID.
            PeopleApi . destroy ( 12 , function ( err , data ) { } ) ;

            // Assert that the HTTP method used was DELETE.
            expect ( jasmine . Ajax . requests . mostRecent ( ) . method ) . toBe ( 'DELETE' ) ;
        } ) ;

    } ) ; // End of 'Method' describe block.


    // Group of tests focusing on the constructed URL paths.
    describe ( 'URL' , function ( )
    {
        // Test case: Verify the URL for the 'all' method.
        it ( 'should point to right url for all' , function ( )
        {
            // Call 'all' to trigger an AJAX request.
            PeopleApi . all ( function ( err , data ) { } ) ;

            // Expect the URL to be the base collection URL.
            expect ( jasmine . Ajax . requests . mostRecent ( ) . url ) . toBe ( '/api/v3/people/' ) ;
        } ) ;

        // Test case: Verify the URL for the 'find' method.
        it ( 'should point to right url for find' , function ( )
        {
            // Call 'find' with a specific ID.
            PeopleApi . find ( 12 , function ( err , data ) { } ) ;

            // Expect the URL to include the ID.
            expect ( jasmine . Ajax . requests . mostRecent ( ) . url ) . toBe ( '/api/v3/people/12' ) ;
        } ) ;

        // Test case: Verify the URL for the 'save' method.
        it ( 'should point to right url for save' , function ( )
        {
            // Call 'save' with some data.
            PeopleApi . save ( { name : 12 } , function ( err , data ) { } ) ;

            // Expect the URL to be the base collection URL (for creating a new resource).
            expect ( jasmine . Ajax . requests . mostRecent ( ) . url ) . toBe ( '/api/v3/people/' ) ;
        } ) ;

        // Test case: Verify the URL for the 'update' method.
        it ( 'should point to right url for update' , function ( )
        {
            // Call 'update' with an ID and data.
            PeopleApi . update ( 12 , { name : 'apy' } , function ( err , data ) { } ) ;

            // Expect the URL to include the ID of the resource being updated.
            expect ( jasmine . Ajax . requests . mostRecent ( ) . url ) . toBe ( '/api/v3/people/12' ) ;
        } ) ;

        // Test case: Verify the URL for the 'destroy' method.
        it ( 'should point to right url for destroy' , function ( )
        {
            // Call 'destroy' with a specific ID.
            PeopleApi . destroy ( 12 , function ( err , data ) { } ) ;

            // Expect the URL to include the ID of the resource being destroyed.
            expect ( jasmine . Ajax . requests . mostRecent ( ) . url ) . toBe ( '/api/v3/people/12' ) ;
        } ) ;
    } ) ; // End of 'URL' describe block.

} ) ; // End of main 'Apy ajax calls' describe block.