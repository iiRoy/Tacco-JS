/*
 * This is a modified version of the original test.js file.
 * It serves the same purpose but with altered formatting.
 *
 */

// Strict mode declaration for the entire script.
'use strict';


// Module dependencies and external libraries are loaded here.
var normalizeTransformValue = require('../src/normalize-transform-value')
  , normalizeTimingFunction = require('../src/normalize-timing-function')
  , Zanimo = require('..')
  , Q = require('q')
  , prefix = require('vendor-prefix')
  , expect = require('expect.js')
  , $test = document.getElementById('test')
; // End of variable declarations.


// Enable long stack support for Q promises for better debugging.
Q.longStackSupport = true;


/**
 * Helper function to create a square DOM element.
 * @param {string} id - The ID for the new square element.
 * @returns {HTMLElement} The newly created square element.
 */
function createSquare ( id ) {
  var el = document . createElement ( "div" ) ; // Create a new div element.
  el . id = id ; // Assign the provided ID.
  el . style . width = "100px" ; // Set width.
  el . style . height = "100px" ; // Set height.
  el . style . backgroundColor = "red" ; // Set background color.
  $test . appendChild ( el ) ; // Append to the test container.
  return el ; // Return the element.
} ;


/**
 * Helper function to remove a square DOM element.
 * @param {string} id - The ID of the square element to remove.
 */
function removeSquare ( id ) {
  $test . removeChild ( document . getElementById ( id ) ) ;
} ;


// Setup and teardown functions for individual tests.
function setUp1 ( ) { return createSquare ( "test-1" ) ; }
function setDown1 ( val ) { removeSquare ( "test-1" ) ; return val ; }

function setUp2 ( ) { return createSquare ( "test-2" ) ; }
function setDown2 ( val ) { removeSquare ( "test-2" ) ; return val ; }


// Test suite for the `normalizeTransformValue` function.
describe ( 'normalizeTransformValue' , function ( ) {

    // Test case 1: Normalize translate3d values with varying whitespace.
    it ( 'should return `translate3d(0,0,0)` when called with `translate3d(0px ,0, 0  )`' , function ( ) {
        expect ( normalizeTransformValue ( 'translate3d(0px ,0, 0  )' ) ) . to . eql ( 'translate3d(0,0,0)' ) ;
    } ) ;

    // Test case 2: Normalize multiple transform functions.
    it ( 'should return `translate3d(0,200px,0) rotateY(280deg) translate3d(0,0,30px)` when called with `translate3d(0px ,200px, 0  )  rotateY(280deg)        translate3d( 0 , 0,30px)`' , function ( ) {
        expect ( normalizeTransformValue ( 'translate3d(0px ,200px, 0  )  rotateY(280deg)        translate3d( 0 , 0,30px)' ) )
            . to . eql ( 'translate3d(0,200px,0) rotateY(280deg) translate3d(0,0,30px)' ) ;
    } ) ;

    // Test case 3: Handle no argument gracefully.
    it ( 'should return an empty string when called with no arg' , function ( ) {
        expect ( normalizeTransformValue ( ) ) . to . eql ( '' ) ;
    } ) ;

    // Test case 4: Pass through simple color names.
    it ( 'should return `red` when called with `red`' , function ( ) {
        expect ( normalizeTransformValue ( 'red' ) ) . to . eql ( 'red' ) ;
    } ) ;

    // Test case 5: Pass through hex color codes.
    it ( 'should return `#1ABC9C` when called with `#1ABC9C`' , function ( ) {
        expect ( normalizeTransformValue ( '#1ABC9C' ) ) . to . eql ( '#1ABC9C' ) ;
    } ) ;

    // Test case 6: Normalize rgba values with varying decimal formats.
    it ( 'should return `rgba(25,25,25,0.5)` when called with `rgba(25, 25, 25, .5)`' , function ( ) {
        expect ( normalizeTransformValue ( 'rgba(25, 25, 25, .5)' ) ) . to . eql ( 'rgba(25,25,25,0.5)' ) ;
    } ) ;

    // Test case 7: Convert hsl to rgb.
    it ( 'should return `rgb(19,32,20)` when called with `hsl(125, 25%, 10%)`' , function ( ) {
        expect ( normalizeTransformValue ( 'hsl(125, 25%, 10%)' ) ) . to . eql ( 'rgb(19,32,20)' ) ;
    } ) ;

    // Test case 8: Convert hsla to rgba.
    it ( 'should return `rgba(221,232,238,0.5)` when called with `hsla(200, 35%, 90%, .5)`' , function ( ) {
        expect ( normalizeTransformValue ( 'hsla(200, 35%, 90%, .5)' ) ) . to . eql ( 'rgba(221,232,238,0.5)' ) ;
    } ) ;

} ) ;


// Test suite for the `normalizeTimingFunction` function.
describe ( 'normalizeTimingFunction' , function ( ) {

    // Test case 1: Linear timing function.
    it ( 'should return "linear" when called with "linear"' , function ( ) {
        expect ( normalizeTimingFunction ( 'linear' ) ) . to . eql ( 'linear' ) ;
    } ) ;

    // Test case 2: Cubic bezier with some whitespace.
    it ( 'should return "cubic-bezier(0.17, .67, .83, .67)" when called with "cubic-bezier(0.17,0.67,0.83,0.67)"' , function ( ) {
        expect ( normalizeTimingFunction ( 'cubic-bezier(0.17, .67, .83, .67)' ) ) . to . eql ( 'cubic-bezier(0.17,0.67,0.83,0.67)' ) ;
    } ) ;

    // Test case 3: Cubic bezier with different whitespace.
    it ( 'should return "cubic-bezier(.17, .67 , .83, .67 )" when called with "cubic-bezier(0.17,0.67,0.83,0.67)"' , function ( ) {
        expect ( normalizeTimingFunction ( 'cubic-bezier(.17, .67 , .83, .67 )' ) ) . to . eql ( 'cubic-bezier(0.17,0.67,0.83,0.67)' ) ;
    } ) ;

} ) ;


// Main test suite for the Zanimo library.
describe ( 'Zanimo' , function ( ) {

    // Test: Zanimo should reject if not given a valid DOM element.
    it ( 'rejects with no DOM element' , function ( ) {
        return Zanimo ( 'Oops' )
            . fail ( function ( err ) {
                expect ( err ) . to . be . a ( Error ) ;
            } ) ;
    } ) ;


    // Test: Zanimo should succeed with a valid DOM element.
    it ( 'succeeded with a DOM element' , function ( ) {
        var el = setUp1 ( ) ; // Create a test element.

        return Zanimo ( el )
            . then ( function ( el ) {
                expect ( el ) . to . be . a ( window . Element ) ; // Verify it's a DOM element.
                setDown1 ( ) ; // Clean up.
            } ) ;
    } ) ;


    // Test: Zanimo should handle a promise resolving to a DOM element.
    it ( 'succeeded with a promise of a DOM element' , function ( ) {
        var el = setUp1 ( ) , // Create element.
            d = Q . defer ( ) ; // Create a deferred object.

        setTimeout ( function ( ) { // Resolve the promise after a delay.
            d . resolve ( el ) ;
        } , 200 ) ;

        return Zanimo ( d . promise )
            . then ( function ( val ) {
                expect ( val ) . to . eql ( el ) ; // Check if the resolved value is the element.
                setDown1 ( ) ; // Clean up.
            } ) ;
    } ) ;


    // Test: Zanimo should fail if the promise resolves to a non-DOM element.
    it ( 'failed with a promise of number' , function ( ) {
        return Zanimo ( Q ( 1 ) ) // Promise resolving to a number.
            . fail ( function ( err ) {
                return expect ( err ) . to . be . a ( Error ) ; // Expect an error.
            } ) ;
    } ) ;


    // Test: Applying a style directly to an element.
    it ( 'succeeded applying a style to an element' , function ( ) {
        var el = setUp1 ( ) ; // Get a test element.

        return Zanimo ( el ) . then ( Zanimo . f ( 'opacity' , 0 ) ) . then ( function ( el ) {
            expect ( el . style . opacity ) . to . eql ( "0" ) ; // Check the applied style.
            setDown1 ( ) ; // Clean up.
        } ) ;
    } ) ;


    // Test: Applying a style to an element wrapped in a promise.
    it ( 'succeeded applying a style to an element wrapped in a promise' , function ( ) {
        var el = setUp1 ( ) ; // Get a test element.

        return Zanimo ( Q . resolve ( el ) , 'opacity' , 0 ) . then ( function ( el ) {
            expect ( el . style . opacity ) . to . eql ( "0" ) ; // Check the applied style.
            setDown1 ( ) ; // Clean up.
        } ) ;
    } ) ;


    // Test: Transitioning width of an element.
    it ( 'succeeded transitioning the width of a element from 100px to 300px in 400ms with ease-in-out timing function' , function ( ) {
        var el = setUp1 ( ) ; // Get a test element.

        return Q . delay ( 200 ) . then ( function ( ) {

            expect ( el . style . width ) . to . eql ( '100px' ) ; // Initial width check.

            return Zanimo ( el , "width" , "300px" , 400 , "ease-in-out" )
                . then ( function ( el ) {
                    expect ( el . style . width ) . to . eql ( '300px' ) ; // Final width check.
                    setDown1 ( ) ; // Clean up.
                } ) ;
        } ) ;

    } ) ;


    // Test: Transitioning multiple properties (width and height) simultaneously.
    it ( 'succeeded transitioning the width and height of a element from 100px to 300px in 400ms with ease-in-out timing function' , function ( ) {
        var el = setUp1 ( ) ; // Get a test element.

        expect ( el . style . width ) . to . eql ( '100px' ) ; // Initial width.
        expect ( el . style . height ) . to . eql ( '100px' ) ; // Initial height.

        return Q . allSettled ( [
                Zanimo ( el , "width" , "300px" , 400 , "ease-in-out" ) ,
                Zanimo ( el , "height" , "300px" , 400 , "ease-in-out" )
            ] )
            . then ( function ( els ) {
                expect ( els [ 0 ] . value . style . width ) . to . eql ( '300px' ) ; // Check final width.
                expect ( els [ 0 ] . value . style . height ) . to . eql ( '300px' ) ; // Check final height.
                setDown1 ( ) ; // Clean up.
            } ) ;

    } ) ;


    // Test: Chaining two transitions on two different elements.
    it ( 'succeeded chaining of 2 transitions with 2 elements' , function ( ) {
        var el1 = setUp1 ( ) , // First element.
            el2 = setUp2 ( ) , // Second element.
            down = function ( r ) { // Teardown function.
                setDown1 ( ) ;
                return setDown2 ( r ) ;
            } ;

        // First transition on el1.
        return Zanimo ( el1 , "transform" , "translate(200px, 0)" , 300 )
            . then ( function ( ) {
                // Verify el1's transform.
                expect ( normalizeTransformValue ( el1 . style [ prefix ( 'transform' ) ] ) ) . to . be . eql ( 'translate(200px,0)' ) ;
                // Second transition on el2.
                return Zanimo ( el2 , "transform" , "translate(0, 200px)" , 100 ) ;
            } )
            . then ( function ( el ) {
                // Verify el2's transform.
                expect ( normalizeTransformValue ( el . style [ prefix ( 'transform' ) ] ) ) . to . be . eql ( 'translate(0,200px)' ) ;
                down ( ) ; // Clean up both elements.
            } ) ;
    } ) ;


    // Test: Failure case for non-DOM element input.
    it ( 'failed when called with not a DOM element' , function ( ) {
        return Zanimo ( "Oops" , "opacity" , 1 , 100 )
            . fail ( function ( err ) {
                return expect ( err ) . to . be . a ( Error ) ; // Expect an error.
            } ) ;
    } ) ;


    // Test: Failure case for an invalid CSS property.
    it ( 'failed when called with a wrong transition property' , function ( ) {
        var el = setUp1 ( ) ; // Get a test element.

        return Zanimo ( el , "toto" , "test" , 100 ) // "toto" is not a valid CSS property.
            . fail ( function ( err ) {
                setDown1 ( ) ; // Clean up.
                return expect ( err ) . to . be . a ( Error ) ; // Expect an error.
            } ) ;
    } ) ;


    // Test: Failure case for an invalid time value.
    it ( 'failed when called with a wrong time value' , function ( () {
        var el = setUp1 ( ) ; // Get a test element.

        return Zanimo ( el , "opacity" , 0.5 , "oops" , "linear" ) // "oops" is not a valid time.
            . fail ( function ( err ) {
                setDown1 ( ) ; // Clean up.
                return expect ( err ) . to . be . a ( Error ) ; // Expect an error.
            } ) ;
    } ) ;


    // Test: Setting a transform property without transition.
    it ( 'succeeded while setting the transform css property of an element to `translate(200px, 0)`' , function ( ) {
        var el = setUp1 ( ) ;
        return Zanimo ( el , "transform" , "translate(200px, 0)" ) . then ( setDown1 ) ; // Clean up after setting.
    } ) ;


    // Test: Transitioning background color using HSLA.
    it ( 'succeeded while making a transition on the background color to hsla(200, 35%, 90%, .5)' , function ( ) {
        var el = setUp1 ( ) ;
        return Zanimo ( el , "background-color" , "hsla(200, 35%, 90%, .5)" , 200 , 'ease-in-out' ) . then ( setDown1 ) ;
    } ) ;


    // Test: Transitioning background color using RGBA.
    it ( 'succeeded while making a transition on the background color to rgba(19, 32, 20, 0.5)' , function ( ) {
        var el = setUp1 ( ) ;
        return Zanimo ( el , "background-color" , "rgba(19, 32, 20, 0.5)" , 200 , 'ease-in-out' ) . then ( setDown1 ) ;
    } ) ;

} ) ;


// Test suite for the `Zanimo.f` function (functional form).
describe ( 'Zanimo.f' , function ( ) {

    // Test: Transitioning opacity using the functional form.
    it ( 'succeeded transitioning the opacity of an element from 1 to 0 in 200ms' , function ( ) {
        var el = setUp1 ( ) ; // Get test element.

        return Zanimo ( el )
            . then ( Zanimo . f ( "opacity" , 0 , 200 ) ) // Apply opacity transition.
            . then ( setDown1 ) ; // Clean up.
    } ) ;


    // Test: Failing to transition a non-animatable property like 'display'.
    it ( 'failed when trying to perform a transition on the display css property' , function ( ) {
        var el = setUp1 ( ) ; // Get test element.

        return Zanimo ( el )
            . then ( Zanimo . f ( "display" , 1 , 100 ) ) // Attempt to animate 'display'.
            . fail ( function ( err ) {
                setDown1 ( ) ; // Clean up.
                return expect ( err ) . to . be . a ( Error ) ; // Expect an error.
            } ) ;
    } ) ;


    // Test: Transitioning transform property using functional form.
    it ( 'succeeded transitioning the transform property of an element from nothing to `translate(200px, 0)` in 200ms' , function ( ) {
        var el = setUp1 ( ) ; // Get test element.

        return Zanimo ( el )
            . then ( Zanimo . f ( "transform" , "translate(200px, 0)" , 200 ) ) // Apply transform transition.
            . then ( setDown1 ) ; // Clean up.
    } ) ;


    // Test: Transitioning background-color using functional form.
    it ( 'succeeded transitioning the background-color property of an element from red to blue in 200ms' , function ( ) {
        var el = setUp1 ( ) ; // Get test element.

        return Zanimo ( el )
            . then ( Zanimo . f ( 'background-color' , 'blue' , 200 ) ) // Apply background-color transition.
            . then ( setDown1 ) ; // Clean up.
    } ) ;


    // Test: Failure when multiple transitions on the same property are initiated too close.
    it ( 'failed on the first call when called 2 times on the same element on the same css property' , function ( ) {
        var el = setUp1 ( ) , // Get test element.
            transition1 = Zanimo . f ( "transform" , "translate(200px, 0)" , 400 ) , // First transition.
            transition2 = Zanimo . f ( "transform" , "translate(100px, 300px)" , 100 ) ; // Second transition.

        // Start second transition slightly after the first.
        Zanimo ( el ) . delay ( 100 ) . then ( transition2 ) . fail ( function ( ) { } ) ;

        return Zanimo ( el )
            . then ( transition1 ) // This one should fail because of the overlapping transition.
            . fail ( function ( err ) {
                setDown1 ( ) ; // Clean up.
                return expect ( err ) . to . be . a ( Error ) ; // Expect an error.
            } ) ;
    } ) ;


    // Test: Success when a new transition is initiated on an element already animating, but handled by Zanimo.
    it ( 'succeeded when called on an element already in transition from another Zanimo call with the same css property' , function ( ) {
        var el = setUp1 ( ) , // Get test element.
            transition1 = Zanimo . f ( "transform" , "translate(200px, 0)" , 400 ) , // First transition.
            transition2 = Zanimo . f ( "transform" , "translate(100px, 300px)" , 100 ) ; // Second transition.

        // Start first transition.
        Zanimo ( el ) . then ( transition1 ) . fail ( function ( ) { } ) ;

        return Zanimo ( el )
            . delay ( 100 ) // Delay the start of the second transition.
            . then ( transition2 ) // This one should succeed, effectively overriding/queuing.
            . then ( setDown1 ) ; // Clean up.
    } ) ;


    // Test: Applying a CSS transform directly while an animation is ongoing.
    it ( 'succeeded a css transform on an element already in a Zanimo transition' , function ( ) {
        var el = setUp1 ( ) ; // Get test element.

        // Start a long-running transition.
        Zanimo ( el ) . then ( Zanimo . f ( "transform" , "translate(200px, 0)" , 400 ) ) . fail ( function ( ) { } ) ;

        // Immediately apply a direct CSS transform. This should succeed and potentially cancel the ongoing transition.
        return Zanimo ( el , "transform" , "translate(00px, 200px)" )
            . then ( setDown1 ) ; // Clean up.
    } ) ;


    // Test: Failure when a direct CSS transform interferes with an ongoing Zanimo transition.
    it ( 'failed to perform a transition on a element if a transform with the same property is applied during the animation' , function ( ) {
        var el = setUp1 ( ) ; // Get test element.

        // Apply a direct transform after a delay, which should interfere.
        Zanimo ( el ) . delay ( 300 ) . then ( Zanimo . f ( "transform" , "translate(00px, 200px)" ) ) . fail ( function ( ) { } ) ;

        return Zanimo ( el )
            . then ( Zanimo . f ( "transform" , "translate(200px, 0)" , 400 ) ) // This transition should fail.
            . fail ( function ( err ) {
                setDown1 ( ) ; // Clean up.
                return expect ( err ) . to . be . a ( Error ) ; // Expect an error.
            } ) ;
    } ) ;


    // Test: Successfully applying multiple sequential opacity transitions.
    it ( 'succeeded to apply sequentially 4 opacity transitions on the same element' , function ( ) {
        this . timeout ( 5000 ) ; // Increase timeout for long-running test.

        var el = setUp1 ( ) , // Get test element.
            transition = Zanimo . f ( "opacity" , 0 , 200 ) , // Transition to opacity 0.
            opacity = function ( el ) { // Function to reset opacity to 1.
                el . style . opacity = 1 ;
                return el ;
            } ;

        // Chain multiple opacity transitions and resets.
        return Zanimo ( el )
            . then ( transition )
            . then ( opacity )
            . then ( transition )
            . then ( opacity )
            . then ( transition )
            . then ( opacity )
            . then ( transition )
            . then ( setDown1 ) ; // Clean up.
    } ) ;


    // Test: Successfully applying multiple sequential transform transitions.
    it ( 'succeeded to apply sequentially 4 transform transitions on the same element' , function ( ) {

        this . timeout ( 5000 ) ; // Increase timeout for long-running test.

        var el = setUp1 ( ) , // Get test element.
            transition = Zanimo . f ( "transform" , "translate(200px, 0)" , 500 ) , // Transition to translate.
            transform = Zanimo . f ( "transform" , "translate(0,0)" ) ; // Transition back to origin.

        // Chain multiple transform transitions.
        return Zanimo ( el )
            . then ( transition )
            . then ( transform )
            . then ( transition )
            . then ( transform )
            . then ( transition )
            . then ( transform )
            . then ( transition )
            . then ( setDown1 ) ; // Clean up.
    } ) ;

} ) ;


// Mocha test runner integration for browser environment.
window . onload = function ( ) {
    var runner = mocha . run ( ) ; // Start Mocha test runner.
    var failedTests = [ ] ; // Array to store details of failed tests.

    // Event listener for when all tests have finished.
    runner . on ( 'end' , function ( ) {
        window . mochaResults = runner . stats ; // Store test statistics.
        window . mochaResults . reports = failedTests ; // Attach failed test reports.
    } ) ;

    // Event listener for individual test failures.
    runner . on ( 'fail' , logFailure ) ;

    /**
     * Logs details of a failed test.
     * @param {object} test - The test object that failed.
     * @param {Error} err - The error object associated with the failure.
     */
    function logFailure ( test , err ) {

        // Helper function to flatten test titles for reporting.
        var flattenTitles = function ( test ) {
            var titles = [ ] ;
            while ( test . parent . title ) {
                titles . push ( test . parent . title ) ;
                test = test . parent ;
            }
            return titles . reverse ( ) ;
        } ;

        // Push detailed failure report to the array.
        failedTests . push ( { name : test . title , result : false , message : err . message , stack : err . stack , titles : flattenTitles ( test ) } ) ;
    }
} ;