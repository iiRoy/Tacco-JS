// This file contains unit tests for the Notification class.
// It leverages the 'assert' module for assertions and 'describe'/'it' from a test framework (e.g., Mocha).

/*
 * Global variables declared to satisfy linting tools for the test runner environment.
 * 'describe' is used to group related test cases.
 * 'it' is used to define individual test cases within a suite.
 */
var assert = require( 'assert' ) ; // Core assertion library for Node.js tests.

// Import necessary classes from the timeline library's 'lib' directory.
var Pin          = require( '../lib/timeline' ).Pin;
var Notification = require( '../lib/timeline' ).Pin.Notification;
var Layout       = require( '../lib/timeline' ).Pin.Layout;


// Test suite for the Notification class.
describe ( 'Notification' , function ( ) {

    'use strict' ; // Enforce stricter parsing and error handling in the code for this test suite.


    // Prepare some mock data representing a layout object's properties.
    var fakeLayouData = {

        type:     Pin.LayoutType.GENERIC_PIN, // Specifies the general type of the pin layout.
        title:    'Pin Title',                // A descriptive title string for the pin.
        tinyIcon: Pin.Icon.PIN                // An icon identifier associated with the pin.

    } ;

    // Create an actual Layout object instance using the mock data prepared above.
    var fakeLayout = new Layout( fakeLayouData ) ;


    // Test case: Verify that an error is thrown if the 'time' property is not a Date object.
    it ( 'should throw an error if time is not a Date object' , function ( done ) {

        // Data for a notification with an invalid 'time' property (a number instead of a Date).
        var notificationData = { time: 5 , layout: fakeLayout } ;

        // Assert that attempting to construct a Notification with this data throws an error.
        assert.throws ( function ( ) { new Notification ( notificationData ) ; } ) ;

        done ( ) ; // Signal that this asynchronous test is complete.

    } ) ;


    // Test case: Confirm that the 'layout' option, if provided as raw data, is converted into a Layout object.
    it ( 'should convert the layout option to a Layout object' , function ( done ) {

        // Data for a notification, using the current date and the raw fake layout data.
        var notificationData = { time: new Date ( ) , layout: fakeLayouData } ;

        // Create a new Notification instance using the prepared data.
        var notification = new Notification ( notificationData ) ;

        // Assert that the 'layout' property of the created notification is indeed an instance of the Layout class.
        assert.ok ( notification.layout instanceof Layout ) ;

        done ( ) ; // Complete this test case.

    } ) ;


    // Test case: Ensure that a Notification can be successfully instantiated with valid time and layout.
    it ( 'should be happy with a time and layout' , function ( done ) {

        // Attempt to create a new Notification with a valid current date and the pre-defined fake layout.
        new Notification ( { time: new Date ( ) , layout: fakeLayout } ) ;

        done ( ) ; // Mark the test as finished.

    } ) ;


    // Test case: Validate that an error is thrown if the 'layout' option is not provided during instantiation.
    it ( 'should throw an error if layout is not set' , function ( done ) {

        // Assert that calling the Notification constructor without any arguments (and thus no layout) throws an error.
        assert.throws ( function ( ) { new Notification ( ) ; } ) ;

        done ( ) ; // Conclude the test.

    } ) ;

} ) ; // End of the 'Notification' describe block.