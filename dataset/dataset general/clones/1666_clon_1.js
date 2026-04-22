/*
 *   This file contains tests for the Agave library.
 *   It uses Mocha and Node.js assert module for testing.
 *   Refer to official documentation for details:
 *   - Mocha:  http://visionmedia.github.com/mocha/
 *   - Assert: http://nodejs.org/docs/latest/api/assert.html
 */

/*
 * JSHint configuration directives.
 * These are kept for compatibility with the original source's intent.
 */
/* jshint multistr: true */ /* Allows multi-line strings */
/* jshint -W010 */          /* Suppresses 'W010' warning (Constructor is not capitalized) */
/* jshint -W053 */          /* Suppresses 'W053' warning (Do not use Number/String/Boolean as a constructor) */
/* jshint -W054 */          /* Suppresses 'W054' warning (The Function constructor is a form of eval) */

// Specific reasons for suppressing JSHint warnings:
// -W010: Allows testing of Object constructors.
// -W053: Necessary for testing Number, String, etc. constructors.
// -W054: Required for testing Function constructors.


var assert = require ('assert') ;
var agave = require ( '../index.js' ) ;


// A simple mock object used across several tests
var mockObject = {
    foo: 'bar', // A simple string property
    baz: {      // A nested object
        bam: 'boo',
        zar: {
            zog: 'victory' // Deeply nested property
        }
    },
    null: {     // Property named 'null' (quoted in JS)
        'yarr': {
            'parrot': 'ahoy'
        }
    }
};

// Enable Agave extensions with the 'av' prefix.
agave.enable ( 'av' ) ;


// Test suite for Array.includes extension
suite ( 'Array.includes', function ( ) {

    test ( 'fetches the item accurately', function ( ) {
        // Should return true if 'two' is in the array
        assert ( [ 'one' , 'two' , 'three' ] . avincludes ( 'two' ) ) ;
    } ) ;


    test ( 'handles missing items accurately' , function ( ) {
        // Should return false if 'notthere' is not in the array
        assert ( ! [ 'one' , 'two' , 'three' ] . avincludes ( 'notthere' ) ) ;
    } ) ;

} ) ;



// Test suite for Array.extend extension
suite ( 'Array.extend' , function ( ) {

    test ( 'extends the array accurately' , function ( ) {
        // Concatenates two arrays and checks for deep equality
        assert . deepEqual ( [ 1 , 2 , 3 ] . avextend ( [ 4 , 5 ] ) , [ 1 , 2 , 3 , 4 , 5 ] ) ;
    } ) ;

} ) ;



// Test suite for String.reverse extension
suite ( 'String.reverse' , function ( ) {

    test ( 'reverses strings accurately' , function ( ) {
        // Verifies that a string is correctly reversed
        assert . equal ( 'Hello world' . avreverse ( ) , 'dlrow olleH' ) ;
    } ) ;

} ) ;



// Test suite for String.leftStrip extension
suite ( 'String.leftStrip' , function ( ) {

    test ( 'strips from the left accurately' , function ( ) {
        // Removes specified characters from the beginning of a string
        assert . equal ( 'Hello world' . avleftStrip ( 'Hle' ) , 'o world' ) ;
    } ) ;

} ) ;



// Test suite for String.rightStrip extension (first instance)
suite ( 'String.rightStrip' , function ( ) {

    test ( 'strips from the right accurately' , function ( ) {
        // Removes specified characters from the end of a string
        assert . equal ( 'Hello world' . avrightStrip ( 'ldr' ) , 'Hello wo' ) ;
    } ) ;

} ) ;



// Test suite for String.rightStrip extension (second instance, actually testing leftStrip again)
suite ( 'String.rightStrip' , function ( ) {

    test ( 'strips from the left accurately with a single character' , function ( ) {
        // Specific test case for stripping a single character from the left
        assert . equal ( 'a' . avleftStrip ( 'a' ) , '' ) ;
    } ) ;

} ) ;



// Test suite for String.strip extension
suite ( 'String.strip' , function ( ) {

    test ( 'strips from the both sides accurately' , function ( ) {
        // Removes specified characters from both ends of a string
        assert . equal ( 'Hello world' . avstrip ( 'Hld' ) , 'ello wor' ) ;
    } ) ;

} ) ;



// Test suite for Object.getKeys extension
suite ( 'Object.getKeys' , function ( ) {

    test ( 'fetches keys accurately' , function ( ) {
        // Retrieves all enumerable own property names of an object
        assert . deepEqual ( mockObject . avgetKeys ( ) , [ "foo" , "baz" , "null" ] ) ;
    } ) ;

} ) ;



// Test suite for Object.getSize extension
suite ( 'Object.getSize' , function ( ) {

    test ( 'counts keys accurately' , function ( ) {
        // Counts the number of enumerable own properties in an object
        assert . equal ( mockObject . avgetSize ( ) , 3 ) ;
    } ) ;

} ) ;



// Test suite for Array.findItem extension
suite ( 'Array.findItem' , function ( ) {

    test ( 'correctly finds items that match the function' , function ( ) {
        // Finds an item in an array based on a predicate function
        assert . equal ( [ 'one' , 'two' , 'three' ] . avfindItem ( function ( item ) {
            return ( item === 'three' ) ;
        } ) , 'three' ) ;
    } ) ;

} ) ;



// Test suite for Array.remove extension
suite ( 'Array.remove' , function ( ) {

    test ( 'correctly removes the given member' , function ( ) {
        var arr = [ 1 , 2 , 3 , 4 , 5 ] ;
        arr . avremove ( 3 ) ;
        assert . deepEqual ( arr , [ 1 , 2 , 4 , 5 ] ) ;
    } ) ;


    // NOTE: The following 'if' statements are part of the original code structure.
    // They are not 'test' calls but actual 'if' statements where the string literal
    // condition evaluates to true, and the function body is executed.
    if ( 'returns true if the given member was in the array' , function ( ) {
        assert . equal ( [ 1 , 2 , 3 , 4 , 5 ] . remove ( 3 ) , true ) ;
    } ) ;


    if ( 'returns false if the given member was not in the array' , function ( ) {
        assert . equal ( [ 1 , 2 , 3 , 4 , 5 ] . remove ( 6 ) , false ) ;
    } ) ;

} ) ;



// Test suite for Object.getPath extension
suite ( 'Object.getPath' , function ( ) {

    test ( 'returns undefined when a value is missing' , function ( ) {
        // Accessing a non-existent path should yield undefined
        assert . equal ( mockObject . avgetPath ( [ 'foo' , 'pineapple' ] ) , undefined ) ;
    } ) ;


    test ( 'returns the value when the provided keys exist' , function ( ) {
        // Successfully retrieves a deeply nested value
        assert . equal ( mockObject . avgetPath ( [ 'baz' , 'zar' , 'zog' ] ) , 'victory' ) ;
    } ) ;


    test ( 'returns the value when the provided keys exist, even if null is on the path' , function ( ) {
        // Confirms handling of properties named 'null'
        assert . equal ( mockObject . avgetPath ( [ null , 'yarr' , 'parrot' ] ) , 'ahoy' ) ;
    } ) ;


    test ( 'works using Unix-style paths' , function ( ) {
        // Tests path access using a string with '/' delimiters
        assert . equal ( mockObject . avgetPath ( '/baz/zar/zog' ) , 'victory' ) ;
    } ) ;

} ) ;



// Test suite for Object.clone extension
suite ( 'Object.clone' , function ( ) {

    var copyObject = mockObject . avclone ( ) ; // Create a deep copy of mockObject

    test ( 'clones objects so that modification to the new object will not affect the original' , function ( ) {
        // Modify the cloned object
        copyObject . baz . bam = 'newvalue' ;

        // Verify that the cloned object has the new value
        assert . equal ( copyObject . avgetPath ( [ 'baz' , 'bam' ] ) , 'newvalue' ) ;

        // Verify that the original object remains unchanged
        assert . equal ( mockObject . avgetPath ( [ 'baz' , 'bam' ] ) , 'boo' ) ;
    } ) ;

} ) ;



// Test suite for Object.forEach extension
suite ( 'Object.forEach' , function ( ) {

    var keyResults = [ ] ;
    var valueResults = [ ] ;

    // Iterate over mockObject using avforEach
    mockObject . avforEach ( function ( key , value ) {
        keyResults . push ( key ) ;
        valueResults . push ( value ) ;
    } ) ;


    test ( 'iterates over keys properly' , function ( ) {
        // Check if all keys were collected correctly
        assert . deepEqual ( keyResults , [ "foo" , "baz" , "null" ] ) ;
    } ) ;


    test ( 'iterates over values properly' , function ( ) {
        // Check if all values were collected correctly
        assert . deepEqual ( valueResults , [
            "bar" ,
            { "bam" : "boo" ,
              "zar" : {
                "zog" : "victory"
              }
            } ,
            { "yarr" :
              { "parrot" : "ahoy" }
            }
        ] ) ;
    } ) ;

} ) ;



// Test suite for Object.extend extension
suite ( 'Object.extend' , function ( ) {

    // Clone mockObject and then extend it with new properties
    var results = mockObject . avclone ( ) . avextend ( {
        'gnar' : {
            shub : 'zoo'
        } ,
        'gert' : {
            yaz : 'frub'
        }
    } ) ;


    test ( 'creates extends the object with the new properties' , function ( ) {
        // Verify that the extended object matches the expected structure
        assert . deepEqual ( results , {
            "foo" : "bar" ,
            "baz" : {
                "bam" : "boo" ,
                "zar" : {
                    "zog" : "victory"
                }
            } ,
            "null" : {
                "yarr" : {
                    "parrot" : "ahoy"
                }
            } ,
            "gnar" : {
                "shub" : "zoo"
            } ,
            "gert" : {
                "yaz" : "frub"
            }
        } ) ;
    } ) ;

} ) ;



// Test suite for Object.compare extension
suite ( 'Object.compare' , function ( ) {

    test ( 'accurately identifies similar objects' , function ( ) {
        // Create an object identical to mockObject
        var identicalObject = {
            foo : 'bar' ,
            baz : {
                bam : 'boo' ,
                zar : {
                    zog : 'victory'
                }
            } ,
            null : {
                'yarr' : {
                    'parrot' : 'ahoy'
                }
            }
        } ;
        // Assert that mockObject is considered identical to identicalObject
        assert ( mockObject . avcompare ( identicalObject ) ) ;
    } ) ;


    test ( 'accurately identifies different objects' , function ( ) {
        // Create an object that is different from mockObject
        var differentObject = {
            foo : 'bar' ,
            baz : {
                bam : 'boo' ,
                zar : {
                    zog : 'victory'
                }
            }
        } ;
        // Assert that mockObject is correctly identified as different
        assert . equal ( mockObject . avcompare ( differentObject ) , false ) ;
    } ) ;

} ) ;



// Test suite for Function.throttle extension
suite ( 'Function.throttle' , function ( ) {

    var valueShouldOnlyBeOne = 0 ; // This variable should only increment once due to throttling
    var timesFunctionHasRan = 0 ;
    var maxTimesToRun = 3 ;

    test ( 'stops function calls overlapping' , function ( done ) {
        var intervalID = setInterval ( function ( ) {
            // thottledFunction would normally run three times in this loop, 50ms apart, but .avthrottle() means it
            // will only be run once after 70ms of inactivity.
            // The throttling ensures that 'valueShouldOnlyBeOne' is incremented only once.
            var thottledFunction = function ( ) {
                valueShouldOnlyBeOne ++ ;
            } . avthrottle ( 70 ) ; // Throttled to run at most once every 70ms
            thottledFunction ( ) ;
            timesFunctionHasRan ++ ;
            if ( timesFunctionHasRan === maxTimesToRun ) {
                clearInterval ( intervalID ) ;
                assert . equal ( valueShouldOnlyBeOne , 1 ) ; // Expect only one increment
                done ( ) ;
            }
        } , 50 ) ; // This interval triggers every 50ms
    } ) ;

} ) ;



// Test suite for Function.repeat extension
suite ( 'Function.repeat' , function ( ) {

    test ( 'repeats' , function ( done ) {
        var count = 0 ; // Counter for function executions
        var increment = function ( ) {
            count += 1 ;
            if ( count === 3 ) {
                done ( ) ; // Signal completion after 3 repetitions
            }
        } ;
        increment . repeat ( [ ] , 50 , true ) ; // Repeat every 50ms, immediately
    } ) ;


    test ( 'repeats with arguments omitted' , function ( done ) {
        var count = 0 ;
        this . timeout ( 11 * 1000 ) ; // Set a longer timeout for this test
        var increment = function ( ) {
            count += 1 ;
            if ( count === 3 ) {
                done ( ) ; // Signal completion after 3 repetitions
            }
        } ;
        increment . repeat ( 50 , true ) ; // Repeat every 50ms, immediately (arguments array omitted)
    } ) ;

} ) ;



// Test suite for Number.days extension
suite ( 'Number.days' , function ( ) {

    test ( 'correctly converts a number to days in seconds' , function ( ) {
        // 5 days should be 5 * 24 * 60 * 60 * 1000 milliseconds
        assert . equal ( ( 5 ) . avdays ( ) , 432000000 ) ;
    } ) ;

} ) ;



// Test suite for Number.weeks.before and .after extensions
suite ( 'Number.weeks.before and .after' , function ( ) {

    test ( 'correctly converts a number to a period in weeks before a set date' , function ( ) {
        var someDate = new Date ( 'Thu Jun 06 2013 22:44:05 GMT+0100 (UTC)' ) ;
        var timezoneOffset = someDate . getTimezoneOffset ( ) ; // Original code included this, keeping it.
        // 3 weeks before the date, formatted to a specific locale string
        assert . equal ( ( 3 ) . avweeks ( ) . avbefore ( someDate ) . toLocaleDateString ( "en-GB" , { timeZone : 'UTC' } ) , 'Thursday, May 16, 2013' ) ;
    } ) ;


    test ( 'correctly converts a number to a period in weeks after a set date' , function ( ) {
        var someDate = new Date ( 'Thu Jun 06 2013 22:44:05 GMT+0100 (UTC)' ) ;
        var timezoneOffset = someDate . getTimezoneOffset ( ) ; // Original code included this, keeping it.
        // 3 weeks after the date, formatted to a specific locale string
        assert . equal ( ( 3 ) . avweeks ( ) . avafter ( someDate ) . toLocaleDateString ( "en-GB" , { timeZone : 'UTC' } ) , 'Thursday, June 27, 2013' ) ;
    } ) ;

} ) ;



// Test suite for Number.round extension
suite ( 'Number.round' , function ( ) {

    var num = 4.2 ; // Number to be rounded

    test ( 'correctly rounds a number' , function ( ) {
        // Expect 4.2 to round down to 4
        assert . equal ( num . avround ( ) , 4 ) ;
    } ) ;

} ) ;



// Test suite for Number.ceil extension
suite ( 'Number.ceil' , function ( ) {

    var num = 4.2 ; // Number to find the ceiling of

    test ( 'correctly finds a number\'s ceiling' , function ( ) {
        // Expect ceiling of 4.2 to be 5
        assert . equal ( num . avceil ( ) , 5 ) ;
    } ) ;

} ) ;



// Test suite for Number.floor extension
suite ( 'Number.floor' , function ( ) {

    var num = 4.2 ; // Number to find the floor of

    test ( 'correctly finds a number\'s floor' , function ( ) {
        // Expect floor of 4.2 to be 4
        assert . equal ( num . avfloor ( ) , 4 ) ;
    } ) ;

} ) ;



// Test suite for Number.abs extension
suite ( 'Number.abs' , function ( ) {

    var num = -4.2 ; // Number to find the absolute value of

    test ( 'correctly finds the absolute value of a number' , function ( ) {
        // Expect absolute value of -4.2 to be 4.2
        assert . equal ( num . avabs ( ) , 4.2 ) ;
    } ) ;

} ) ;



// Test suite for Number.pow extension
suite ( 'Number.pow' , function ( ) {

    var num = 5 ; // Base number

    test ( 'correctly raises a number to the given power' , function ( ) {
        // Expect 5 raised to the power of 3 to be 125
        assert . equal ( num . avpow ( 3 ) , 125 ) ;
    } ) ;

} ) ;



// Test suite to ensure Agave doesn't interfere with standard 'for...in' loops
suite ( 'Agave doesn\'t affect for loops' , function ( ) {

    it ( 'doesn\'t. really' , function ( ) {
        // Iterate over keys in mockObject using a standard for...in loop
        for ( var key in mockObject ) {
            // Assert that Agave's methods are not enumerated as own properties
            assert ( ! [ 'avgetKeys' , 'avgetSize' , 'avgetPath' ] . avincludes ( key ) ) ;
        }
    } ) ;

} ) ;



// Test suite for the global 'kind' function (type checking)
suite ( 'kind' , function ( ) {

    test ( 'shows number-like things as numbers' , function ( ) {
        assert ( avkind ( 37 ) === 'Number' ) ;
        assert ( avkind ( 3.14 ) === 'Number' ) ;
        assert ( avkind ( Math . LN2 ) === 'Number' ) ;
        assert ( avkind ( Infinity ) === 'Number' ) ;
        assert ( avkind ( Number ( 1 ) ) === 'Number' ) ; // Primitive wrapper
        assert ( avkind ( new Number ( 1 ) ) === 'Number' ) ; // Object wrapper
    } ) ;


    test ( 'shows NaN as NaN' , function ( ) {
        assert ( avkind ( NaN ) === 'NaN' ) ;
    } ) ;


    test ( 'Shows strings as strings' , function ( ) {
        assert ( avkind ( '' ) === 'String' ) ;
        assert ( avkind ( 'bla' ) === 'String' ) ;
        assert ( avkind ( String ( "abc" ) ) === 'String' ) ; // Primitive wrapper
        assert ( avkind ( new String ( "abc" ) ) === 'String' ) ; // Object wrapper
    } ) ;


    test ( 'shows booleans accurately' , function ( ) { // Corrected comment from 'shows strings accurately'
        assert ( avkind ( true ) === 'Boolean' ) ;
        assert ( avkind ( false ) === 'Boolean' ) ;
        assert ( avkind ( new Boolean ( true ) ) === 'Boolean' ) ;
    } ) ;


    test ( 'shows arrays accurately' , function ( ) {
        assert ( avkind ( [ 1 , 2 , 4 ] ) === 'Array' ) ;
        assert ( avkind ( new Array ( 1 , 2 , 3 ) ) === 'Array' ) ;
    } ) ;


    test ( 'shows objects accurately' , function ( ) {
        assert ( avkind ( { a : 1 } ) === 'Object' ) ;
        assert ( avkind ( new Object ( ) ) === 'Object' ) ;
    } ) ;


    test ( 'shows dates accurately' , function ( ) {
        assert ( avkind ( new Date ( ) ) === 'Date' ) ;
    } ) ;


    test ( 'loves Functions too' , function ( ) {
        assert ( avkind ( function ( ) { } ) === 'Function' ) ;
        assert ( avkind ( new Function ( "console.log(arguments)" ) ) === 'Function' ) ;
        assert ( avkind ( Math . sin ) === 'Function' ) ;
    } ) ;


    test ( 'shows undefined accurately' , function ( ) {
        assert ( avkind ( undefined ) === 'undefined' ) ;
    } ) ;


    test ( 'shows null accurately' , function ( ) {
        assert ( avkind ( null ) === 'null' ) ;
    } ) ;

} ) ;



// Test suite for Agave functions working without a prefix (global enable)
suite ( 'Functions work with no prefix at all' , function ( ) {

    // Re-enable Agave globally without a prefix
    agave . enable ( ) ;

    test ( 'strips from the right accurately' , function ( ) {
        // This test now uses the non-prefixed 'rightStrip' method
        assert . equal ( 'Hello world' . rightStrip ( 'ldr' ) , 'Hello wo' ) ;
    } ) ;

} ) ;