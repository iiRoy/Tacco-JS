'use strict'; // Enforce strict mode for better code quality and security.

// This top-level describe block encapsulates all tests related to the Angular promise DSL.
// It groups together various tests for custom promise methods.
describe( 'The Angular promise DSL', function () {

    // Declare variables that will be initialized before each test spec.
    var $location, // Mocked $location service.
        $scope,    // AngularJS scope for digest cycles.
        $q;        // AngularJS $q service for promises.

    /**
     * Setup function that runs before each test spec in this describe block.
     * It initializes mocks and injects necessary AngularJS services.
     */
    beforeEach( function () {
        // Create a Jasmine spy object for $location to track its method calls.
        $location = jasmine.createSpyObj( '$location', [ 'path', 'replace' ] );

        // Load the 'ngPromiseDsl' module and provide our mocked $location service.
        module( 'ngPromiseDsl', function ( $provide ) {
            $provide.value( '$location', $location );
        } );

        // Inject the $q service and $rootScope to get a new scope.
        inject( function ( _$q_, $rootScope ) {
            $q = _$q_; // Assign the injected $q service to our variable.
            $scope = $rootScope.$new(); // Create a new child scope for testing isolation.
        } );
    } ); // End of the beforeEach setup block.


    // Test suite for the 'except' method.
    describe( 'The except method', function () {

        // Test case: Verify that 'except' method functions as an alias for .then(null, fn).
        it( 'should be an alias for .then(null, fn)', function () {
            var deferred = $q.defer(); // Create a new deferred object.
            var failureCallback = jasmine.createSpy( 'failure callback' ); // Create a spy for the failure handler.

            deferred.promise.except( failureCallback ); // Attach the failure handler using 'except'.
            deferred.reject(); // Reject the promise to trigger the failure handler.
            $scope.$apply(); // Apply changes to propagate the promise rejection.

            // Assert that the failure callback spy was called.
            expect( failureCallback ).toHaveBeenCalled();
        } );

    } ); // End of 'The except method' describe block.


    // Test suite for the 'thenSet' method.
    describe( 'The thenSet method', function () {

        // Test case: Ensure thenSet correctly assigns the resolved promise's value to an object property.
        it( 'should set the resolved promise\'s value to the given object under the given key', function () {
            var obj = {}; // The target object where the value will be set.
            var key = 'test'; // The key within the object.
            var value = 'for great justice'; // The value that the promise will resolve with.

            var deferred = $q.defer(); // Create a new deferred instance.
            deferred.promise.thenSet( obj, key ); // Use thenSet to bind promise resolution to obj[key].
            deferred.resolve( value ); // Resolve the promise with the specified value.

            $scope.$apply(); // Trigger the digest cycle to process promise resolution.

            // Assert that obj.test was set to the resolved value.
            expect( obj.test ).toBe( value );
        } );


        // Test case: Verify that thenSet can set a fixed constant value upon promise resolution.
        it( 'should set a fixed value when the promise resolves and a constant was provided', function () {
            var obj = {}; // Object to be modified.
            var deferred = $q.defer(); // Deferred promise.
            // Call thenSet with a fixed constant 'teeest'.
            deferred.promise.thenSet( obj, 'test', 'teeest' );
            deferred.resolve(); // Resolve the promise (value here is irrelevant as a constant is provided).
            $scope.$apply(); // Propagate changes through the scope.
            expect( obj.test ).toBe( 'teeest' ); // Ensure the fixed constant was used.
        } );

    } ); // End of 'The thenSet method' describe block.


    // Test suite for the 'exceptSet' method.
    describe( 'The exceptSet method', function () {

        // Test case: Check if exceptSet assigns the rejected promise's value to an object property.
        it( 'should set the rejected promise\'s value to the given object under the given key', function () {
            var obj = {}; // Target object for assignment.
            var deferred = $q.defer(); // Create a deferred object.
            deferred.promise.exceptSet( obj, 'test' ); // Bind promise rejection to obj.test.
            deferred.reject( 'for great justice' ); // Reject the promise with a specific value.
            $scope.$apply(); // Update the scope to process the rejection.
            expect( obj.test ).toBe( 'for great justice' ); // Check if the rejection value was correctly set.
        } );

        // Test case: Ensure exceptSet can set a fixed constant value upon promise rejection.
        it( 'should set a fixed value when the promise resolves and a constant was provided', function () {
            var obj = {}; // Object for testing.
            var deferred = $q.defer(); // Deferred instance.
            // Using exceptSet with a constant value 'teeest'.
            deferred.promise.exceptSet( obj, 'test', 'teeest' );
            deferred.reject(); // Reject the promise (value here is irrelevant).
            $scope.$apply(); // Apply scope changes to process rejection.
            expect( obj.test ).toBe( 'teeest' ); // Assert that the constant value was set on rejection.
        } );

    } ); // End of 'The exceptSet method' describe block.


    // Test suite for the 'thenTake' method.
    describe( 'The thenTake method', function () {

        // Test case: Verify thenTake extracts a property from the resolved object and passes it along.
        it( 'should take the value of the given key from the object returned by the promise and pass it to the next then in the chain', function () {
            var obj = { test: 'teeeest' }; // An object with a property to be extracted.
            var deferred = $q.defer(); // Deferred promise.
            var successCallback = jasmine.createSpy( 'success' ); // Spy for the subsequent 'then' callback.

            // Chain thenTake to extract 'test' property, then attach successCallback.
            deferred.promise
                .thenTake( 'test' )
                .then( successCallback );

            deferred.resolve( obj ); // Resolve the promise with the object.
            $scope.$apply(); // Trigger the digest cycle.
            expect( successCallback ).toHaveBeenCalledWith( obj.test ); // Expect the specific property value to be passed.
        } );

    } ); // End of 'The thenTake method' describe block.


    // Test suite for the 'thenReturn' method.
    describe( 'The thenReturn method', function () {

        // Test case: Check if thenReturn passes the first argument when the promise resolves.
        it( 'should pass the first argument to the next then in the chain when the promise resolves', function () {
            var deferred = $q.defer(); // Deferred object.
            var successCallback = jasmine.createSpy( 'success' ); // Spy function to verify argument.

            // Chain thenReturn with a single argument for resolution.
            deferred.promise
                .thenReturn( 'success' )
                .then( successCallback );

            deferred.resolve(); // Resolve the promise.
            $scope.$apply(); // Trigger digest.

            expect( successCallback ).toHaveBeenCalledWith( 'success' ); // Verify the 'success' argument was passed.
        } );

        // Test case: Check if thenReturn passes the second argument when the promise rejects.
        it( 'should pass the second argument to the next then in the chain when the promise rejects', function () {
            var deferred = $q.defer(); // Deferred instance.
            var successCallback = jasmine.createSpy( 'success' ); // Spy for callback.

            // Chain thenReturn with two arguments; the second should be used on rejection.
            deferred.promise
                .thenReturn( 'success', 'failure' )
                .then( successCallback );

            deferred.reject(); // Reject the promise.
            $scope.$apply(); // Apply changes.

            expect( successCallback ).toHaveBeenCalledWith( 'failure' ); // Verify the 'failure' argument was passed.
        } );

    } ); // End of 'The thenReturn method' describe block.


    // Test suite for the 'thenExec' method.
    describe( 'The thenExec method', function () {

        // Test case: Ensure thenExec calls the provided function with the promise's resolved value.
        it( 'should call the function with the promise value when the promise resolves', function () {
            var deferred = $q.defer(); // Create a deferred.
            var successCallback = jasmine.createSpy( 'success' ); // Spy for execution.
            deferred.promise.thenExec( successCallback ); // Call thenExec with the spy.
            deferred.resolve( 'argument' ); // Resolve the promise with a value.
            $scope.$apply(); // Update scope.
            expect( successCallback ).toHaveBeenCalledWith( 'argument' ); // Expect the spy to be called with the resolved value.
        } );

        // Test case: Verify that thenExec passes the original resolved value to subsequent handlers,
        // ignoring the return value of its own handler function.
        it( 'should pass the resolved value to the next entry in the promise chain regardless of the return value of the first handler', function () {
            var deferred = $q.defer(); // New deferred.
            var successCallback = jasmine.createSpy( 'success' ); // Spy for the second handler.

            // Chain multiple thenExec calls.
            deferred.promise
                .thenExec( function () {
                    return 'another result'; // This return value should be ignored by the next thenExec.
                } )
                .thenExec( successCallback ); // This one should receive the original resolved value.

            deferred.resolve( 'argument' ); // Resolve the promise.
            $scope.$apply(); // Trigger digest.
            expect( successCallback ).toHaveBeenCalledWith( 'argument' ); // Assert original value is passed.
        } );

    } ); // End of 'The thenExec method' describe block.


    // Test suite for the 'thenApply' method.
    describe( 'The thenApply method', function () {

        // Test case: Check if thenApply calls a method on the resolved object with provided arguments.
        it( 'should call the given function name on the object returned by the project with the remaining parameters as arguments', function () {
            var deferred = $q.defer(); // Deferred promise.
            var successCallback = jasmine.createSpy( 'success' ); // Spy to be called as a method.

            // Use thenApply to call the 'run' method on the resolved object.
            deferred.promise.thenApply( 'run', 'first argument' );

            deferred.resolve( { run: successCallback } ); // Resolve with an object containing the spy.
            $scope.$apply(); // Apply scope changes.

            expect( successCallback ).toHaveBeenCalledWith( 'first argument' ); // Verify the method was called with the correct argument.
        } );

    } ); // End of 'The thenApply method' describe block.


    // Test suite for the 'thenRedirectTo' method.
    describe( 'The thenRedirectTo method', function () {

        // Test case: Verify that thenRedirectTo calls $location.path with the given path.
        it( 'should call $location.path with the given path argument', function () {
            var deferred = $q.defer(); // Deferred object.

            deferred.promise.thenRedirectTo( '/path' ); // Redirect without replacement.
            deferred.resolve(); // Resolve the promise.
            $scope.$apply(); // Update scope.

            expect( $location.path ).toHaveBeenCalledWith( '/path' ); // $location.path should be called with '/path'.
            expect( $location.replace ).not.toHaveBeenCalled(); // $location.replace should NOT be called.
        } );

        // Test case: Check if thenRedirectTo calls $location.replace when the second argument is true.
        it( 'should call $location.replace if the second argument is true', function () {
            var deferred = $q.defer(); // Another deferred.

            deferred.promise.thenRedirectTo( '/path', true ); // Redirect with replacement.
            deferred.resolve(); // Resolve the promise.
            $scope.$apply(); // Digest cycle.

            expect( $location.path ).toHaveBeenCalledWith( '/path' ); // $location.path should still be called.
            expect( $location.replace ).toHaveBeenCalled(); // $location.replace should now be called.
        } );

    } ); // End of 'The thenRedirectTo method' describe block.


    // Test suite for the 'thenSetAll' method.
    describe( 'the thenSetAll method', function () {

        // Test case: Ensure thenSetAll correctly assigns values from multiple promises to an object.
        it( 'should set the given promises to the given object under their respective object keys', function () {
            var promise1 = $q.when( 'value one' ); // A promise immediately resolved with 'value one'.
            var promise2 = $q.when( 'value two' ); // A promise immediately resolved with 'value two'.
            var obj = {}; // The object to receive the resolved values.

            // Use $q.all to wait for both promises, then thenSetAll to assign their values to 'obj'.
            $q.all( { one: promise1, two: promise2 } )
                .thenSetAll( obj );
            $scope.$apply(); // Trigger promise resolution and digest cycle.

            expect( obj.one ).toBe( 'value one' ); // Verify the first value was set.
            expect( obj.two ).toBe( 'value two' ); // Verify the second value was set.
        } );

    } ); // End of 'the thenSetAll method' describe block.

} ); // End of top-level 'The Angular promise DSL' describe block.