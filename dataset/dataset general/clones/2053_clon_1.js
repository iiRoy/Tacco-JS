/*
 * Global variables declaration for linting purposes.
 * This comment spans multiple lines to demonstrate a style change.
 * It indicates that certain global objects are expected but not defined in this file.
 */
/* global require: false, describe: false, it: false, expect: false, sinon: false, beforeEach: false, afterEach: false, scrollMonitor: false */

// This line might be part of an AMD define block, currently commented out.
// define(function(require) {

// Assign scrollMonitor to the global window object.
window.scrollMonitor = scrollMonitor ;
// Assign chai to the global window object.
window.chai = chai ;
// Assign chai.expect to the global window.expect object.
window.expect = chai.expect ;
// Assign chai.assert to the global window.assert object.
window.assert = chai.assert ;
// Assign chai.should() to the global window.should object.
window.should = chai.should() ;
// Set a global flag 'notrack' to true.
window.notrack = true ;



// Configure Mocha test framework.
mocha.setup( {
    // Use 'bdd' (Behavior-Driven Development) interface style.
    ui: 'bdd'
} ) ;


// Define constants for various event types.
var VISIBILITYCHANGE      = 'visibilityChange' ;
var ENTERVIEWPORT         = 'enterViewport' ;
var FULLYENTERVIEWPORT    = 'fullyEnterViewport' ;
var EXITVIEWPORT          = 'exitViewport' ;
var PARTIALLYEXITVIEWPORT = 'partiallyExitViewport' ;
var LOCATIONCHANGE        = 'locationChange' ;
var STATECHANGE           = 'stateChange' ;

// Array containing all defined event types.
var eventTypes = [
    VISIBILITYCHANGE,
    ENTERVIEWPORT,
    FULLYENTERVIEWPORT,
    EXITVIEWPORT,
    PARTIALLYEXITVIEWPORT,
    LOCATIONCHANGE,
    STATECHANGE
] ;


// Determine the appropriate requestAnimationFrame function across browsers.
// Fallback to setTimeout if no native requestAnimationFrame is found.
var requestAnimationFrameDoer =
    window.requestAnimationFrame       ||
    window.mozRequestAnimationFrame    ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame     ||
    function ( cb ) {
        setTimeout( cb, 20 );
    } ;


// Helper function to get the current viewport height.
var getViewportHeight = function ( ) {
    return window.innerHeight || document.documentElement.clientHeight ;
} ;


// A wrapper for requestAnimationFrame to introduce a slight delay.
var requestAnimationFrame = function ( cb ) {
    setTimeout( function ( ) {
        requestAnimationFrameDoer( cb ) ;
    }, 4 ) ;
} ;


// Get the test fixture element.
var fixture = document.getElementById( 'fixture' ) ;
// If the fixture element doesn't exist, create it and append to the body.
if ( ! fixture ) {
    fixture = document.createElement( 'div' ) ;
    document.body.appendChild( fixture ) ;
}


// Declare a variable for the div element used in tests.
var div ;

// Setup function for tests, creating a new div element for each test.
var setup = function ( done ) {
    // Create a new div element.
    div = document.createElement( 'div' ) ;
    // Set its position to absolute.
    div.style.position      = 'absolute' ;
    // Set its top position.
    div.style.top           = '0px' ;
    // Set its left position.
    div.style.left          = '0px' ;
    // Set its width.
    div.style.width         = '10px' ;
    // Set its background color.
    div.style.backgroundColor = 'silver' ;
    // Set its height to twice the viewport height.
    div.style.height        = '' + ( getViewportHeight() * 2 ) + 'px' ;
    // Append the div to the fixture.
    fixture.appendChild( div ) ;
    // Scroll to the top of the page.
    window.scrollTo( 0, 0 ) ;
    // Use requestAnimationFrame to ensure browser has processed scroll before calling done.
    requestAnimationFrame( function ( ) { done() ; } ) ;
} ;


// Teardown function for tests, clearing the fixture and scrolling to top.
var destroy = function ( done ) {
    // Clear all content within the fixture.
    fixture.innerHTML = '' ;
    // Scroll to the top of the page.
    window.scrollTo( 0, 0 ) ;
    // Use requestAnimationFrame to ensure browser has processed scroll before calling done.
    requestAnimationFrame( function ( ) { done() ; } ) ;
} ;


// Test suite for the scrollMonitor API.
describe( 'API', function ( ) {

    // Test case: module should have correct API methods and properties.
    it( 'module should have correct API.', function ( ) {
        // Check if scrollMonitor responds to 'create' method.
        expect( scrollMonitor ).to.respondTo( 'create' ) ;
        // Check if scrollMonitor responds to 'update' method.
        expect( scrollMonitor ).to.respondTo( 'update' ) ;
        // Check if scrollMonitor responds to 'recalculateLocations' method.
        expect( scrollMonitor ).to.respondTo( 'recalculateLocations' ) ;

        // Check if scrollMonitor.viewportTop is a number.
        expect( scrollMonitor.viewportTop ).to.be.a( 'number' ) ;
        // Check if scrollMonitor.viewportBottom is a number.
        expect( scrollMonitor.viewportBottom ).to.be.a( 'number' ) ;
        // Check if scrollMonitor.viewportHeight is a number.
        expect( scrollMonitor.viewportHeight ).to.be.a( 'number' ) ;
        // Check if scrollMonitor.documentHeight is a number.
        expect( scrollMonitor.documentHeight ).to.be.a( 'number' ) ;
    } ) ;

    // Test case: watcher instances should have correct API methods and properties.
    it( 'watcher should have correct API.', function ( ) {
        // Create a watcher for a number.
        var watcher = scrollMonitor.create( 10 ) ;

        // Check various methods of the watcher.
        expect( watcher ).to.respondTo( 'on' ) ;
        expect( watcher ).to.respondTo( 'off' ) ;
        expect( watcher ).to.respondTo( 'one' ) ;
        expect( watcher ).to.respondTo( 'lock' ) ;
        expect( watcher ).to.respondTo( 'unlock' ) ;
        expect( watcher ).to.respondTo( 'destroy' ) ;
        expect( watcher ).to.respondTo( 'update' ) ;
        expect( watcher ).to.respondTo( 'triggerCallbacks' ) ;

        // Check that the watcher responds to all defined event types.
        eventTypes.forEach( function ( type ) {
            expect( watcher ).to.respondTo( type ) ;
        } ) ;

        // Check various properties of the watcher.
        expect( watcher.isInViewport ).to.be.a( 'boolean' ) ;
        expect( watcher.isFullyInViewport ).to.be.a( 'boolean' ) ;
        expect( watcher.isAboveViewport ).to.be.a( 'boolean' ) ;
        expect( watcher.isBelowViewport ).to.be.a( 'boolean' ) ;
        expect( watcher.top ).to.be.a( 'number' ) ;
        expect( watcher.bottom ).to.be.a( 'number' ) ;
        expect( watcher.height ).to.be.a( 'number' ) ;
        expect( watcher.watchItem ).to.be.a( 'number' ) ;
        expect( watcher.offsets ).to.be.an( 'object' ) ;

        // Clean up the watcher.
        watcher.destroy() ;
    } ) ;
} ) ;


// Test suite for calculating element locations.
describe( 'calculating locations', function ( ) {

    // Test case: should calculate numbers correctly.
    it( 'should calculate numbers correctly', function ( ) {
        // Create watchers for simple numbers.
        var watcher10 = scrollMonitor.create( 10 ) ;
        var watcher15 = scrollMonitor.create( 15 ) ;

        // Assert top positions.
        expect( watcher10.top ).to.equal( 10 ) ;
        expect( watcher15.top ).to.equal( 15 ) ;

        // Assert bottom positions.
        expect( watcher10.bottom ).to.equal( 10 ) ;
        expect( watcher15.bottom ).to.equal( 15 ) ;

        // Assert height. For numbers, height should be 0.
        expect( watcher10.height ).to.equal( 0 ) ;
        expect( watcher15.height ).to.equal( 0 ) ;

        // Assert default offsets.
        expect( watcher10.offsets ).to.eql( { top: 0, bottom: 0 } ) ;
        expect( watcher15.offsets ).to.eql( { top: 0, bottom: 0 } ) ;

        // Destroy watchers.
        watcher10.destroy() ;
        watcher15.destroy() ;
    } ) ;

    // Test case: should calculate objects correctly.
    it( 'should calculate objects correctly', function ( ) {
        // Create a watcher with an object defining top and bottom.
        var watcher = scrollMonitor.create( { top: 100, bottom: 102 } ) ;

        // Assert top, bottom, and height.
        expect( watcher.top ).to.equal( 100 ) ;
        expect( watcher.bottom ).to.equal( 102 ) ;
        expect( watcher.height ).to.equal( 2 ) ;

        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should calculate things with a property of "0" correctly (e.g., arrays).
    it( 'should calculate things with a property of "0" correctly', function ( ) {
        // Create a watcher with an array.
        var watcher = scrollMonitor.create( [ 10 ] ) ;

        // Assert top, bottom, and height.
        expect( watcher.top ).to.equal( 10 ) ;
        expect( watcher.bottom ).to.equal( 10 ) ;
        expect( watcher.height ).to.equal( 0 ) ;

        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should calculate DOM elements correctly.
    it( 'should calculate DOM elements correctly', function ( ) {
        // Create a div element.
        var div = document.createElement( 'div' ) ;

        // Style the div.
        div.style.position      = 'relative' ;
        div.style.top           = '10px' ;
        div.style.width         = '100px' ;
        div.style.height        = '15px' ;
        div.style.backgroundColor = 'gray' ;

        // Append the div to the fixture.
        fixture.appendChild( div ) ;
        // Create a watcher for the div.
        var watcher = scrollMonitor.create( div ) ;

        // Calculate expected offset.
        var offset = fixture.offsetTop ;
        // Assert top, bottom, and height based on DOM element properties.
        expect( watcher.top ).to.equal( offset + 10 ) ;
        expect( watcher.bottom ).to.equal( offset + 25 ) ;
        expect( watcher.height ).to.equal( 15 ) ;

        // Destroy watcher.
        watcher.destroy() ;
        // Clear the fixture.
        fixture.innerHTML = '' ;
    } ) ;
} ) ;


// Test suite for location boolean properties.
describe( 'location booleans', function ( ) {
    // Run setup before each test.
    beforeEach( setup ) ;
    // Run destroy after each test.
    afterEach( destroy ) ;

    // Test case: should calculate fully in viewport correctly.
    it( 'should calculate fully in viewport correctly', function ( ) {
        // Create a watcher for a number (which is always fully in viewport initially).
        var watcher = scrollMonitor.create( 10 ) ;

        // Assert boolean states.
        expect( watcher.isInViewport ).to.equal( true ) ;
        expect( watcher.isFullyInViewport ).to.equal( true ) ;
        expect( watcher.isAboveViewport ).to.equal( false ) ;
        expect( watcher.isBelowViewport ).to.equal( false ) ;

        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should calculate partially below viewport correctly.
    it( 'should calculate partially below viewport correctly', function ( ) {
        // Get viewport height.
        var windowHeight = getViewportHeight() ;
        // Create a watcher that spans from just above to just below the viewport.
        var watcher = scrollMonitor.create( { top: windowHeight - 10, bottom: windowHeight + 10 } ) ;

        // Assert boolean states.
        expect( watcher.isInViewport ).to.equal( true ) ;
        expect( watcher.isFullyInViewport ).to.equal( false ) ;
        expect( watcher.isAboveViewport ).to.equal( false ) ;
        expect( watcher.isBelowViewport ).to.equal( true ) ;

        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should calculate partially above viewport correctly.
    it( 'should calculate partially above viewport correctly', function ( done ) {
        // Scroll the window down.
        window.scrollTo( 0, 100 ) ;
        // Wait for the next animation frame.
        requestAnimationFrame( function ( ) {
            // var windowHeight = getViewportHeight(); // This line was commented out in original.
            // Create a watcher that spans from the top of the document, extending below current scroll.
            var watcher = scrollMonitor.create( { top: 0, bottom: 200 } ) ;

            // Assert boolean states.
            expect( watcher.isInViewport ).to.equal( true ) ;
            expect( watcher.isFullyInViewport ).to.equal( false ) ;
            expect( watcher.isAboveViewport ).to.equal( true ) ;
            expect( watcher.isBelowViewport ).to.equal( false ) ;

            // Destroy watcher.
            watcher.destroy() ;
            // Signal test completion.
            done() ;
        } ) ;
    } ) ;

    // Test case: should calculate below viewport correctly.
    it( 'should calculate below viewport correctly', function ( ) {
        // Get viewport height.
        var windowHeight = getViewportHeight() ;
        // Create a watcher entirely below the viewport.
        var watcher = scrollMonitor.create( { top: windowHeight + 10, bottom: windowHeight + 20 } ) ;

        // Assert boolean states.
        expect( watcher.isInViewport ).to.equal( false ) ;
        expect( watcher.isFullyInViewport ).to.equal( false ) ;
        expect( watcher.isAboveViewport ).to.equal( false ) ;
        expect( watcher.isBelowViewport ).to.equal( true ) ;

        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should calculate above viewport correctly.
    it( 'should calculate above viewport correctly', function ( done ) {
        // Scroll the window down.
        window.scrollTo( 0, 100 ) ;
        // Wait for the next animation frame.
        requestAnimationFrame( function ( ) {
            // var windowHeight = getViewportHeight(); // This line was commented out in original.
            // Create a watcher entirely above the current viewport.
            var watcher = scrollMonitor.create( { top: 0, bottom: 20 } ) ;

            // Assert boolean states.
            expect( watcher.isInViewport ).to.equal( false ) ;
            expect( watcher.isFullyInViewport ).to.equal( false ) ;
            expect( watcher.isAboveViewport ).to.equal( true ) ;
            expect( watcher.isBelowViewport ).to.equal( false ) ;

            // Destroy watcher.
            watcher.destroy() ;
            // Signal test completion.
            done() ;
        } ) ;
    } ) ;

    // Test case: should calculate larger than and fully in viewport correctly.
    it( 'should calculate larger than and fully in viewport correctly', function ( done ) {
        // Scroll the window down.
        window.scrollTo( 0, 100 ) ;
        // Wait for the next animation frame.
        requestAnimationFrame( function ( ) {
            // Get viewport height.
            var windowHeight = getViewportHeight() ;
            // Create a watcher that is much larger than the viewport and encompasses it.
            var watcher = scrollMonitor.create( { top: 0, bottom: windowHeight + 200 } ) ;

            // Assert boolean states.
            expect( watcher.isInViewport ).to.equal( true ) ;
            expect( watcher.isFullyInViewport ).to.equal( true ) ;
            expect( watcher.isAboveViewport ).to.equal( true ) ;
            expect( watcher.isBelowViewport ).to.equal( true ) ;

            // Destroy watcher.
            watcher.destroy() ;
            // Signal test completion.
            done() ;
        } ) ;
    } ) ;
} ) ;


// Test suite for setting offsets on watchers.
describe( 'setting offsets', function ( ) {
    // Test case: should not have offsets by default.
    it( 'should not have offsets by default', function ( ) {
        // Create a watcher without specifying offsets.
        var watcher = scrollMonitor.create( 10 ) ;
        // Assert that offsets are default (0,0).
        expect( watcher.offsets ).to.eql( { top: 0, bottom: 0 } ) ;
        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should add offsets as a number (applies to both top and bottom).
    it( 'should add offsets as a number', function ( ) {
        // Create a watcher with a single number offset.
        var watcher = scrollMonitor.create( 10, 10 ) ;
        // Assert that both top and bottom offsets are set to that number.
        expect( watcher.offsets ).to.eql( { top: 10, bottom: 10 } ) ;
        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should add offsets with just the top specified in an object.
    it( 'should add offsets as a with just the top in an object', function ( ) {
        // Create a watcher with an object specifying only top offset.
        var watcher = scrollMonitor.create( 10, { top: 10 } ) ;
        // Assert top offset is set, bottom remains default.
        expect( watcher.offsets ).to.eql( { top: 10, bottom: 0 } ) ;
        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should add offsets with just the bottom specified in an object.
    it( 'should add offsets as a with just the bottom in an object', function ( ) {
        // Create a watcher with an object specifying only bottom offset.
        var watcher = scrollMonitor.create( 10, { bottom: 10 } ) ;
        // Assert bottom offset is set, top remains default.
        expect( watcher.offsets ).to.eql( { top: 0, bottom: 10 } ) ;
        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should add offsets with both properties specified in an object.
    it( 'should add offsets as a with both properties in an object', function ( ) {
        // Create a watcher with an object specifying both top and bottom offsets.
        var watcher = scrollMonitor.create( 10, { top: 5, bottom: 10 } ) ;
        // Assert both offsets are set correctly.
        expect( watcher.offsets ).to.eql( { top: 5, bottom: 10 } ) ;
        // Destroy watcher.
        watcher.destroy() ;
    } ) ;
} ) ;


// Test suite for callback application logic.
describe( 'callback application', function ( ) {
    // A no-operation function to use as a dummy callback.
    function noop ( ) { }

    // Test case: should create arrays to hold callbacks for each event type.
    it( 'should create arrays to hold callbacks.', function ( ) {
        // Create a watcher.
        var watcher = scrollMonitor.create( 10 ) ;
        // Iterate through all event types.
        eventTypes.forEach( function ( type ) {
            // Assert that an array exists for each event type in watcher.callbacks.
            expect( watcher.callbacks[ type ] ).to.be.an( 'array' ) ;
            // Assert that the array is initially empty.
            expect( watcher.callbacks[ type ].length ).to.equal( 0 ) ;
        } ) ;
        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should correctly add event listeners.
    it( 'should add event listeners.', function ( ) {
        // Create a watcher.
        var watcher = scrollMonitor.create( 10 ) ;
        // Iterate through all event types.
        eventTypes.forEach( function ( type ) {
            // Add a noop callback for the current event type.
            watcher.on( type, noop ) ;
            // Assert that one callback is registered.
            expect( watcher.callbacks[ type ].length ).to.equal( 1 ) ;
            // Assert that the registered callback is the noop function.
            expect( watcher.callbacks[ type ][ 0 ].callback ).to.equal( noop ) ;
            // Assert that the 'isOne' flag is false for 'on' listeners.
            expect( watcher.callbacks[ type ][ 0 ].isOne ).to.equal( false ) ;
        } ) ;
        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should correctly remove event listeners.
    it( 'should remove event listeners.', function ( ) {
        // Create a watcher.
        var watcher = scrollMonitor.create( 10 ) ;
        // Iterate through all event types.
        eventTypes.forEach( function ( type ) {
            // Add a noop callback.
            watcher.on( type, noop ) ;
            // Remove the noop callback.
            watcher.off( type, noop ) ;
            // Assert that the callback array is now empty.
            expect( watcher.callbacks[ type ].length ).to.equal( 0 ) ;
        } ) ;
        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should add "one" event listeners correctly.
    it( 'should add "one" event listeners as "one" event listeners.', function ( ) {
        // Create a watcher.
        var watcher = scrollMonitor.create( 10 ) ;
        // Iterate through all event types.
        eventTypes.forEach( function ( type ) {
            // Create a Sinon spy to track calls.
            var spy = sinon.spy() ;
            // Add a 'one' listener.
            watcher.one( type, spy ) ;
            // For 'enterViewport' and 'fullyEnterViewport', if the item is already in view,
            // the 'one' callback is called immediately and then removed.
            if ( type === 'enterViewport' || type === 'fullyEnterViewport' ) {
                // Expect the callback array to be empty after immediate execution.
                expect( watcher.callbacks[ type ].length ).to.equal( 0 ) ;
                // Expect the spy to have been called.
                expect( spy.called ).to.equal( true ) ;
            } else {
                // For other event types, the callback should be registered.
                expect( watcher.callbacks[ type ].length ).to.equal( 1 ) ;
                // Expect the spy not to have been called yet.
                expect( spy.called ).to.equal( false ) ;
                // Assert that the registered callback is the spy.
                expect( watcher.callbacks[ type ][ 0 ].callback ).to.equal( spy ) ;
                // Assert that the 'isOne' flag is true for 'one' listeners.
                expect( watcher.callbacks[ type ][ 0 ].isOne ).to.equal( true ) ;
            }
        } ) ;
        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should automatically call listeners when they are already in the viewport.
    it( 'should automatically call listeners when they are already in the viewport.', function ( ) {
        // Create a watcher.
        var watcher = scrollMonitor.create( 10 ) ;
        // Iterate through all event types.
        eventTypes.forEach( function ( type ) {
            // Create a Sinon spy.
            var spy = sinon.spy() ;
            // Add an 'on' listener.
            watcher.on( type, spy ) ;
            // If the event type is 'enterViewport' or 'fullyEnterViewport' and the item is already in view,
            // the callback should be called immediately.
            if ( type === 'enterViewport' || type === 'fullyEnterViewport' ) {
                expect( spy.called ).to.equal( true ) ;
            } else {
                // For other events, it should not be called immediately.
                expect( spy.called ).to.equal( false ) ;
            }
        } ) ;
        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // This test case seems to be a duplicate of the one above.
    // Keeping it as-is to preserve Type I cloning.
    it( 'should automatically call listeners when they are already in the viewport.', function ( ) {
        // Create a watcher.
        var watcher = scrollMonitor.create( 10 ) ;
        // Iterate through event types.
        eventTypes.forEach( function ( type ) {
            // Create a spy.
            var spy = sinon.spy() ;
            // Add listener.
            watcher.on( type, spy ) ;
            // Assert call status based on event type.
            if ( type === 'enterViewport' || type === 'fullyEnterViewport' ) {
                expect( spy.called ).to.equal( true ) ;
            } else {
                expect( spy.called ).to.equal( false ) ;
            }
        } ) ;
        // Destroy watcher.
        watcher.destroy() ;
    } ) ;
} ) ;


// Test suite for events triggered by user scrolling.
describe( 'events as the user scrolls', function ( ) {
    // Setup before each test.
    beforeEach( setup ) ;
    // Teardown after each test.
    afterEach( destroy ) ;

    // Test case: should call enterViewport immediately if the element is already in the viewport.
    it( 'should call enterViewport immediately if the element is already in the viewport.', function ( ) {

        // Create a watcher for the 'div' element which is in viewport by default.
        var watcher = scrollMonitor.create( div ) ;
        // Create a spy.
        var spy = sinon.spy() ;

        // Add enterViewport listener.
        watcher.enterViewport( spy ) ;
        // Expect the spy to have been called immediately.
        expect( spy.called ).to.equal( true ) ;
        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should call enterViewport and fullyEnterViewport callbacks immediately if the element is fully in the viewport.
    it( 'should call enterViewport and fullyEnterViewport callbacks immediately if the element is fully in the viewport', function ( ) {

        // Ensure div is at the top.
        div.style.top = '0px' ;

        // Create a watcher for a small number, fully in viewport.
        var watcher = scrollMonitor.create( 10 ) ;
        // Create two spies.
        var spy1 = sinon.spy() ;
        var spy2 = sinon.spy() ;

        // Add listeners.
        watcher.enterViewport( spy1 ) ;
        watcher.fullyEnterViewport( spy2 ) ;
        // Expect both spies to have been called immediately.
        expect( spy1.called ).to.equal( true ) ;
        expect( spy2.called ).to.equal( true ) ;

        // Destroy watcher.
        watcher.destroy() ;
    } ) ;

    // Test case: should call exitViewport immediately if the element is already above the viewport.
    it( 'should call exitViewport immediately if the element is already above the viewport.', function ( done ) {
        // Scroll the window down.
        window.scrollTo( 0, 100 ) ;
        // Wait for next animation frame.
        requestAnimationFrame( function ( ) {
            // Create a watcher for a small number, which is now above the viewport.
            var watcher = scrollMonitor.create( 10 ) ;
            // Create a spy.
            var spy = sinon.spy() ;

            // Add exitViewport listener.
            watcher.exitViewport( spy ) ;
            // Expect the spy to have been called immediately.
            expect( spy.called ).to.equal( true ) ;
            // Signal test completion.
            done() ;
        } ) ;
    } ) ;

    // Test case: should call partiallyExitViewport immediately if the element is already above the viewport.
    it( 'should call partiallyExitViewport immediately if the element is already above the viewport.', function ( done ) {
        // Scroll the window down.
        window.scrollTo( 0, 100 ) ;
        // Wait for next animation frame.
        requestAnimationFrame( function ( ) {
            // Create a watcher for a small number, now above the viewport.
            var watcher = scrollMonitor.create( 10 ) ;
            // Create a spy.
            var spy = sinon.spy() ;

            // Add partiallyExitViewport listener.
            watcher.partiallyExitViewport( spy ) ;
            // Expect the spy to have been called immediately.
            expect( spy.called ).to.equal( true ) ;
            // Destroy watcher.
            watcher.destroy() ;
            // Signal test completion.
            done() ;
        } ) ;
    } ) ;

    // Test case: should call exitViewport and partiallyExitViewport when the element exits the viewport.
    it( 'should call exitViewport and partiallyExitViewport when the element exits the viewport.', function ( done ) {
        // Create a watcher for a small number, initially in viewport.
        var watcher = scrollMonitor.create( 10 ) ;
        // Create two spies.
        var spy1 = sinon.spy() ;
        var spy2 = sinon.spy() ;

        // Add listeners.
        watcher.exitViewport( spy1 ) ;
        watcher.partiallyExitViewport( spy2 ) ;
        // Initially, spies should not be called.
        expect( spy1.called ).to.equal( false ) ;
        expect( spy2.called ).to.equal( false ) ;

        // Scroll the window down to make the element exit the viewport.
        window.scrollTo( 0, 100 ) ;
        // Wait for next animation frame.
        requestAnimationFrame( function ( ) {
            // Now, both spies should have been called.
            expect( spy1.called ).to.equal( true ) ;
            expect( spy2.called ).to.equal( true ) ;
            // Signal test completion.
            done() ;
        } ) ;
    } ) ;

    // Test case: should call enterViewport and fullyEnterViewport when the element enters the viewport.
    it( 'should call enterViewport and fullyEnterViewport when the element enters the viewport.', function ( done ) {
        // Create a watcher for an element initially below the viewport.
        var watcher = scrollMonitor.create( getViewportHeight() + 10 ) ;
        // Create two spies.
        var spy1 = sinon.spy() ;
        var spy2 = sinon.spy() ;

        // Add listeners.
        watcher.enterViewport( spy1 ) ;
        watcher.fullyEnterViewport( spy2 ) ;
        // Initially, spies should not be called.
        expect( spy1.called ).to.equal( false ) ;
        expect( spy2.called ).to.equal( false ) ;

        // Scroll the window down to bring the element into the viewport.
        window.scrollTo( 0, 100 ) ;
        // Wait for next animation frame.
        requestAnimationFrame( function ( ) {
            // Now, both spies should have been called.
            expect( spy1.called ).to.equal( true ) ;
            expect( spy2.called ).to.equal( true ) ;
            // Signal test completion.
            done() ;
        } ) ;
    } ) ;

    // Test case: should only call partiallyExitViewport when the element partially exits the viewport.
    it( 'should only call partiallyExitViewport when the element partially exits the viewport.', function ( done ) {
        // Create a watcher for an element that spans the viewport.
        var watcher = scrollMonitor.create( { top: 10, bottom: 200 } ) ;
        // Create two spies.
        var spy1 = sinon.spy() ;
        var spy2 = sinon.spy() ;

        // Add listeners.
        watcher.exitViewport( spy1 ) ;
        watcher.partiallyExitViewport( spy2 ) ;
        // Initially, spies should not be called.
        expect( spy1.called ).to.equal( false ) ;
        expect( spy2.called ).to.equal( false ) ;

        // Scroll down slightly, making the element partially exit from the top.
        window.scrollTo( 0, 100 ) ;
        // Wait for next animation frame.
        requestAnimationFrame( function ( ) {
            // Only partiallyExitViewport should be called, not full exit.
            expect( spy1.called ).to.equal( false ) ;
            expect( spy2.called ).to.equal( true ) ;
            // Signal test completion.
            done() ;
        } ) ;
    } ) ;

    // Test case: should only call enterViewport when the element halfway enters the viewport.
    it( 'should only call enterViewport when the element halfway enters the viewport.', function ( done ) {
        // Create a watcher for a large element initially below the viewport.
        var watcher = scrollMonitor.create( { top: getViewportHeight() + 10, bottom: ( getViewportHeight() * 2 ) + 100 } ) ;
        // Create two spies.
        var spy1 = sinon.spy() ;
        var spy2 = sinon.spy() ;

        // Add listeners.
        watcher.enterViewport( spy1 ) ;
        watcher.fullyEnterViewport( spy2 ) ;
        // Initially, spies should not be called.
        expect( spy1.called ).to.equal( false ) ;
        expect( spy2.called ).to.equal( false ) ;

        // Scroll down to bring only part of the element into view.
        window.scrollTo( 0, getViewportHeight() + 20 ) ;
        // Wait for next animation frame.
        requestAnimationFrame( function ( ) {
            // enterViewport should be called, but not fullyEnterViewport.
            expect( spy1.called ).to.equal( true ) ;
            expect( spy2.called ).to.equal( false ) ;
            // Signal test completion.
            done() ;
        } ) ;
    } ) ;

} ) ;