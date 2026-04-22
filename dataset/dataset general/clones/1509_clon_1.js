/*
 * This file contains QUnit tests for the Breakpoint utility.
 * It ensures that various functionalities of the breakpoint plugin
 * work as expected across different scenarios, including image loading,
 * source finding, and deferred object handling.
 */

/* ==========================================================================
// Module: Utility Function Testing
// This section focuses on testing the core utility functions
// provided by the $.fn.breakpoint plugin.
========================================================================== */

module( 'Utility Function Testing' );

/**
 * Test case for the `removeQuotes` utility function.
 * Browsers can return CSS-parsed JSON strings in inconsistent ways,
 * so this function aims to normalize them by stripping extra quotes.
 *
 * @param {string} testName - The name of the test.
 * @param {number} assertions - The number of assertions expected.
 * @param {Function} callback - The test function itself.
 */
test ( 'Remove Quotes' , 4 , function ( ) {

    // Initialize the breakpoint plugin in debug mode for testing.
    var test = $.fn.breakpoint ( { debug : true } ) ;

    // Define the expected normalized JSON string result.
    var result = JSON.stringify ( { "current" : "small" , "all" : [ "small" , "medium" , "large" ] , "position" : 0 } ) ;

    // Assertion 1: Test with a standard JSON string.
    deepEqual ( test.removeQuotes ( '{"current":"small","all":["small","medium","large"],"position":0}' ) , result ) ;
    // Assertion 2: Test with a JSON string using escaped double quotes.
    deepEqual ( test.removeQuotes ( "{\"current\":\"small\",\"all\":[\"small\",\"medium\",\"large\"],\"position\":0}" ) , result ) ;
    // Assertion 3: Test with a JSON string containing extra spaces.
    deepEqual ( test.removeQuotes ( "{\"current\" : \"small\", \"all\" : [\"small\",\"medium\",\"large\"], \"position\" : 0 }" ) , result ) ;
    // Assertion 4: Test with a malformed JSON string that includes a semicolon at the end.
    deepEqual ( test.removeQuotes ( "{\"current\" : \"small\", \"all\" : [\"small\",\"medium\",\"large\"], \"position\" : 0 } ; }" ) , result ) ;

} ) ;

/* Test case for the `findSource` utility function.
 * This function is responsible for locating the correct image source
 * by matching the current breakpoint label to a data attribute on an image element.
 */
test ( 'Find Source' , 2 , function ( ) {

    // Setup the breakpoint instance for testing purposes.
    var test = $.fn.breakpoint ( { debug : true } ) ;

    // First assertion: Expect to find 'small.jpg' when a matching data attribute exists.
    deepEqual ( test.findSource ( $ ( '<img data-small="small.jpg">' ) , test.breakpointImages ) , 'small.jpg' ) ;
    // Second assertion: Expect `undefined` when no matching data attribute is present.
    deepEqual ( test.findSource ( $ ( '<img>' ) , test.breakpointImages ) , undefined ) ;

} ) ;

/**
 * Test case: `Find Source Walks Down`.
 * Verifies that if no direct matching source is found, the breakpoint utility
 * correctly walks down the label array to find the next available source.
 */
test ( 'Find Source Walks Down' , 1 , function ( ) {

    // Initialize the breakpoint plugin.
    var test = $.fn.breakpoint ( { debug : true } ) ;

    // Manually override the breakpoint information to simulate a 'medium' breakpoint
    // with 'small' and 'medium' available labels.
    test.breakpointImages.breakpoint = { current : 'medium' , all : [ 'small' , 'medium' ] , position : 1 } ;

    // Expect 'small.jpg' to be found, even if 'medium' is the current breakpoint,
    // because it walks down from 'medium' to 'small' if 'medium' source is not available.
    deepEqual ( test.findSource ( $ ( '<img data-small="small.jpg">' ) , test.breakpointImages ) , 'small.jpg' ) ;

} ) ;

// Test to ensure that when a prefix option is passed,
// the `findSource` function correctly identifies the image source
// using the prefixed data attribute.
test ( 'Find Source With Prefix' , 2 , function ( ) {

    // Initialize the breakpoint plugin with a custom prefix.
    var test = $.fn.breakpoint ( { debug : true , prefix : 'awesome-' } ) ;

    // Expect 'small.jpg' to be found using the 'data-awesome-small' attribute.
    deepEqual ( test.findSource ( $ ( '<img data-awesome-small="small.jpg">' ) , test.breakpointImages ) , 'small.jpg' ) ;
    // Expect `undefined` when the prefix is specified but the attribute is not prefixed.
    deepEqual ( test.findSource ( $ ( '<img data-small="small.jpg">' ) , test.breakpointImages ) , undefined ) ;

} ) ;

// This test verifies that the `setSource` function correctly applies the image source
// to the `src` attribute of the provided image element.
test ( 'Set Source' , 2 , function ( ) {

    // Create a breakpoint instance for testing.
    var test = $.fn.breakpoint ( { debug : true } ) ;

    // Define two input image elements with different data attributes.
    var $inputImage = $ ( '<img data-small="small.jpg">' ) ;
    var $inputImage2 = $ ( '<img data-medium="medium.jpg">' ) ;

    // Call `setSource` to apply the source based on the current breakpoint.
    var $outputImage = test.setSource ( $inputImage , test.breakpointImages ) ;
    var $outputImage2 = test.setSource ( $inputImage2 , test.breakpointImages ) ;

    // First assertion: Verify that the `src` attribute is set to 'small.jpg'.
    deepEqual ( $outputImage.attr ( 'src' ) , 'small.jpg' ) ;
    // Second assertion: Verify that the `src` attribute is `undefined`
    // if no matching source is found (assuming current breakpoint is 'small' by default).
    deepEqual ( $outputImage2.attr ( 'src' ) , undefined ) ;

} ) ;

/* ==========================================================================
 * Module: Returns
 * This section focuses on testing the return values and deferred objects
 * provided by the breakpoint plugin, ensuring correct API behavior.
 ========================================================================== */

module ( 'Returns' ) ;

/* --------------------------------------------------------------------------
 * API / getBreakpoint()
 * This test block ensures that the `breakpoint` object,
 * which includes 'current', 'all', and 'position' keys,
 * is correctly returned as part of the plugin instance.
 * -------------------------------------------------------------------------- */

test ( 'Breakpoint Object on Instance' , 3 , function ( ) {

    // Create a breakpoint instance without any specific configuration.
    var test = $.fn.breakpoint ( ) ;

    // Verify the 'current' breakpoint value.
    deepEqual ( test.breakpoint.current , 'small' ) ;
    // Verify the 'all' breakpoints array.
    deepEqual ( test.breakpoint.all , [ 'small' ] ) ;
    // Verify the 'position' of the current breakpoint.
    deepEqual ( test.breakpoint.position , 0 ) ;

} ) ;

/* --------------------------------------------------------------------------
 * API / always deferred
 * This section tests the `.always()` deferred method.
 * It verifies that the deferred object is always resolved (or rejected)
 * and passes the 'breakpoint' information (current, all, position)
 * to its callbacks.
 * -------------------------------------------------------------------------- */

asyncTest ( 'Breakpoint Always Deferred' , 4 , function ( ) {

    // Initialize the breakpoint plugin.
    var test = $.fn.breakpoint ( ) ;

    // Initially, the state should be 'resolved' immediately for non-image breakpoints.
    deepEqual ( test.state ( ) , 'resolved' ) ;

    // Attach an 'always' callback to the deferred object.
    test.always ( function ( breakpoint ) {
        QUnit.start ( ) ; // Resume QUnit testing.
        // Assert the 'current' breakpoint.
        deepEqual ( breakpoint.current , 'small' ) ;
        // Assert the 'all' breakpoints array.
        deepEqual ( breakpoint.all , [ 'small' ] ) ;
        // Assert the 'position' of the current breakpoint.
        deepEqual ( breakpoint.position , 0 ) ;
    } ) ;

} ) ;

// This async test checks the 'always' deferred behavior when dealing with
// both successfully loaded and failed image sources.
asyncTest ( 'Breakpoint Always When Good/Bad' , 2 , function ( ) {

    // Create an image element with one valid and one invalid image source.
    var $image = $ ( '<img data-small="http://i.imgur.com/xrQHn.jpg"><img data-small="http://i.imdfd.com/dfdf.jpg">' ) ;
    // Apply the breakpoint plugin to the image.
    var test = $image.breakpoint ( ) ;

    // The deferred should be 'pending' as images are loading.
    deepEqual ( test.state ( ) , 'pending' ) ;

    // Attach an 'always' callback. It should always execute, regardless of success or failure.
    test.always ( function ( breakpoint ) {
        QUnit.start ( ) ; // Resume QUnit.
        ok ( true ) ; // Simply assert that the callback was executed.
    } ) ;

} ) ;

/* --------------------------------------------------------------------------
 * API / done deferred
 * This test block focuses on the `.done()` deferred method.
 * It confirms that the deferred object is resolved successfully
 * and correctly passes the 'breakpoint' information and an
 * `imagesLoaded` instance to its callbacks.
 * -------------------------------------------------------------------------- */

asyncTest ( 'Breakpoint Done Deferred' , 6 , function ( ) {

    // Create an image element with a known good source.
    var $image = $ ( '<img data-small="http://i.imgur.com/xrQHn.jpg">' ) ;
    // Apply the breakpoint plugin.
    var test = $image.breakpoint ( ) ;

    // Initially, the deferred state should be 'pending' while the image loads.
    deepEqual ( test.state ( ) , 'pending' ) ;

    // Attach a 'done' callback, which should execute upon successful image loading.
    test.done ( function ( breakpoint , instance ) {

        QUnit.start ( ) ; // Resume QUnit.
        deepEqual ( test.state ( ) , 'resolved' ) ; // Verify the deferred state is 'resolved'.
        deepEqual ( breakpoint.current , 'small' ) ; // Check 'current' breakpoint.
        deepEqual ( breakpoint.all , [ 'small' ] ) ; // Check 'all' breakpoints.
        deepEqual ( breakpoint.position , 0 ) ; // Check 'position'.

        // Verify the `imagesLoaded` instance: ensure the image element matches.
        deepEqual ( instance.images [ 0 ] .img , $image [ 0 ] ) ;

    } ) ;

} ) ;

/* --------------------------------------------------------------------------
 * API / fail deferred
 * This section tests the `.fail()` deferred method.
 * It verifies that the deferred object is rejected when an image fails to load,
 * and that it correctly passes the 'breakpoint' info and an `imagesLoaded` instance
 * to its callbacks.
 * -------------------------------------------------------------------------- */

asyncTest ( 'Breakpoint Fail Deferred' , 6 , function ( ) {

    // Create an image element with a deliberately bad (non-existent) image source.
    var $image = $ ( '<img data-small="http://adfadf.com/adfadf.jpg">' ) ;
    // Apply the breakpoint plugin.
    var test = $image.breakpoint ( ) ;

    // The deferred state should be 'pending' while the browser attempts to load the image.
    deepEqual ( test.state ( ) , 'pending' ) ;

    // Attach a 'fail' callback, expected to execute when the image fails to load.
    test.fail ( function ( breakpoint , instance ) {

        QUnit.start ( ) ; // Resume QUnit.
        deepEqual ( test.state ( ) , 'rejected' ) ; // Confirm the deferred state is 'rejected'.
        deepEqual ( breakpoint.current , 'small' ) ; // Verify 'current' breakpoint.
        deepEqual ( breakpoint.all , [ 'small' ] ) ; // Verify 'all' breakpoints.
        deepEqual ( breakpoint.position , 0 ) ; // Verify 'position'.

        // Check the `imagesLoaded` instance to ensure the image is marked as not loaded.
        deepEqual ( instance.images [ 0 ] .isLoaded , false ) ;

    } ) ;

} ) ;

/* --------------------------------------------------------------------------
 * API / progress
 * This test block validates the `.progress()` deferred method.
 * It ensures that the progress callback is triggered for each image
 * as it loads (or fails to load), passing the 'breakpoint' info,
 * the `imagesLoaded` instance, and the individual image object.
 * -------------------------------------------------------------------------- */

test ( 'Test Progress' , 10 , function ( ) {

    // Create multiple image elements with good sources to trigger progress events.
    var $image = $ ( '<img data-small="http://i.imgur.com/xrQHn.jpg"><img data-small="http://i.imgur.com/b3fBJ.jpg"><img data-small="http://i.imgur.com/xmSh2.jpg"><img data-small="http://i.imgur.com/iIpJm.jpg">' ) ;
    // Apply the breakpoint plugin, which returns a deferred object.
    var dfd = $image.breakpoint ( ) ;
    var progressCount = 0 ; // Counter to track how many progress events occurred.

    QUnit.stop ( ) ; // Pause QUnit until all async operations are complete.

    // Attach a 'progress' callback. This should fire for each image.
    dfd.progress ( function ( breakpoint , instance , image ) {

        QUnit.start ( ) ; // Resume QUnit to run assertions within the callback.

        ok ( image.isLoaded , 'image is loaded' ) ; // Assert that the individual image is loaded.
        deepEqual ( instance.images [ progressCount ] .img , $image [ progressCount ] ) ; // Check image instance.

        progressCount = progressCount + 1 ; // Increment the progress counter.

        // After all images have processed, perform final assertions.
        if ( progressCount >= $image.length ) {
            equal ( progressCount , $image.length , 'progressed right amount of times' ) ; // Verify total progress events.
            deepEqual ( breakpoint.current , 'small' ) ; // Check breakpoint info.
        }

        QUnit.stop ( ) ; // Pause QUnit again, as the 'always' callback will handle the final resume.

    } ) ;

    // Attach an 'always' callback to ensure QUnit resumes when all deferred operations are done.
    dfd.always ( function ( ) {
        QUnit.start ( ) ; // Final resume for QUnit.
    } ) ;

} ) ;

/* --------------------------------------------------------------------------
 * API / general callback
 * This test block verifies the general callback behavior of the breakpoint plugin,
 * specifically when no image elements are involved.
 * It ensures the callback receives the correct 'breakpoint' information.
 * -------------------------------------------------------------------------- */

asyncTest ( 'Breakpoint Callback w/o Images' , 3 , function ( ) {

    // Call the breakpoint plugin with a direct callback function (no image context).
    $.fn.breakpoint ( function ( breakpoint ) {
        QUnit.start ( ) ; // Resume QUnit.
        deepEqual ( breakpoint.current , 'small' ) ; // Verify 'current' breakpoint.
        deepEqual ( breakpoint.all , [ 'small' ] ) ; // Verify 'all' breakpoints.
        deepEqual ( breakpoint.position , 0 ) ; // Verify 'position'.
    } ) ;

} ) ;

/* --------------------------------------------------------------------------
 * API / image callback
 * This test block confirms the callback behavior when an image element is provided.
 * It checks that the callback receives both the 'breakpoint' information
 * and an `imagesLoaded` instance upon completion.
 * -------------------------------------------------------------------------- */

asyncTest ( 'Breakpoint Callback w/o Images' , 4 , function ( ) {

    // Create an image element with a valid source.
    var $image = $ ( '<img data-small="http://i.imgur.com/b3fBJ.jpg">' ) ;

    // Apply the breakpoint plugin to the image, providing a callback.
    $image.breakpoint ( function ( breakpoint , instance ) {

        QUnit.start ( ) ; // Resume QUnit.
        deepEqual ( breakpoint.current , 'small' ) ; // Verify 'current' breakpoint.
        deepEqual ( breakpoint.all , [ 'small' ] ) ; // Verify 'all' breakpoints.
        deepEqual ( breakpoint.position , 0 ) ; // Verify 'position'.

        // Check the `imagesLoaded` instance: ensure the image element matches.
        deepEqual ( instance.images [ 0 ] .img , $image [ 0 ] ) ;

    } ) ;

} ) ;