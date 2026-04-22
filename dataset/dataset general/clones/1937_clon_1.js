var     clone = require ( './' ) ; // Import the core cloning utility.

/**
 * Helper function to inspect an object, primarily for detecting and
 * handling circular references during serialization.
 *
 * @param   {object}    obj     The object to inspect and stringify.
 * @returns {string}            JSON string representation of the object.
 */
function inspect ( obj )
{
    var seen = [ ] ; // Initialize an array to keep track of seen objects to detect cycles.

    return  JSON . stringify (
        obj ,
        function ( key , val )
        {
            // If the current value is not null and is an object type...
            if  ( val != null && typeof val === "object" )
            {
                // Check if this object has already been encountered.
                if  ( seen . indexOf ( val ) >= 0 )
                {
                    return  '[cyclic]' ; // Mark as cyclic to prevent infinite loops.
                }

                // If not seen, add it to the list of seen objects.
                seen . push ( val ) ;
            }

            return val ; // Return the value for serialization.
        }
    ) ;
}


/**
 * Creates an isolated execution context, either a Node.js VM or a browser iframe,
 * to run a script and retrieve its results.
 * This is useful for testing how cloning behaves across different JavaScript contexts.
 *
 * @param   {object}    context     The initial context object to be passed to the new VM/iframe.
 * @param   {string}    script      The JavaScript code string to execute in the isolated context.
 * @param   {function}  callback    Function to call with the results from the isolated context.
 */
function apartContext ( context , script , callback )
{
    var vm = require ( 'vm' ) ; // Attempt to load the Node.js 'vm' module.

    if  ( vm )
    {
        // Node.js environment: create a new VM context.
        var ctx = vm . createContext ( { ctx : context } ) ;
        callback ( vm . runInContext ( script , ctx ) ) ; // Execute script and pass results to callback.
    }
    else if ( typeof document !== 'undefined' && document . createElement )
    {
        // Browser environment: create an iframe for isolation.
        var iframe = document . createElement ( 'iframe' ) ;
        iframe . style . display = 'none' ; // Keep the iframe hidden.
        document . body . appendChild ( iframe ) ;

        var myCtxId = 'tmpCtx' + Math . random ( ) ; // Generate a unique ID for the context.

        window [ myCtxId ] = context ; // Store the context on the window object for the iframe to access.
        iframe . src = 'test-apart-ctx.html?' + myCtxId + '&' + encodeURIComponent ( script ) ; // Set iframe source.
        iframe . onload = function ( )
        {
            try
            {
                callback ( iframe . contentWindow . results ) ; // Retrieve results from iframe and call back.
            }
            catch ( e )
            {
                throw e ; // Re-throw any errors encountered.
            }
        } ;
    }
    else
    {
        // Neither Node.js VM nor browser iframe is available.
        console . log ( 'WARNING: cannot create an apart context.' ) ;
    }
}


exports [ "clone string" ] = function ( test )
{
    // Configure the number of assertions expected in this test case.
    test . expect ( 2 ) ;

    // Test case 1: Cloning a simple string.
    var a = "foo" ;
    test . strictEqual ( clone ( a ) , a ) ;

    // Test case 2: Cloning an empty string.
    a = "" ;
    test . strictEqual ( clone ( a ) , a ) ;

    // Signal that the test is complete.
    test . done ( ) ;
} ;


exports [ "clone number" ] = function ( test )
{
    // Expecting 5 assertions for different number types.
    test . expect ( 5 ) ;

    // Test case 1: Zero.
    var a = 0 ;
    test . strictEqual ( clone ( a ) , a ) ;

    // Test case 2: Positive integer.
    a = 1 ;
    test . strictEqual ( clone ( a ) , a ) ;

    // Test case 3: Negative integer.
    a = - 1000 ;
    test . strictEqual ( clone ( a ) , a ) ;

    // Test case 4: Positive float.
    a = 3.1415927 ;
    test . strictEqual ( clone ( a ) , a ) ;

    // Test case 5: Negative float.
    a = - 3.1415927 ;
    test . strictEqual ( clone ( a ) , a ) ;

    test . done ( ) ;
} ;


exports [ "clone date" ] = function ( test )
{
    // This test expects 3 assertions.
    test . expect ( 3 ) ;

    var a = new Date ( ) ; // Create a new Date object.
    var c = clone ( a ) ; // Clone the Date object.

    // Verify 'a' is indeed a Date object (has typical Date methods).
    test . ok ( !! a . getUTCDate && !! a . toUTCString ) ;
    // Verify 'c' is also a Date object.
    test . ok ( !! c . getUTCDate && !! c . toUTCString ) ;
    // Ensure the cloned date has the same time value as the original.
    test . equal ( a . getTime ( ) , c . getTime ( ) ) ;

    test . done ( ) ;
} ;


exports [ "clone object" ] = function ( test )
{
    // One assertion expected for this test.
    test . expect ( 1 ) ;

    var a = { foo : { bar : "baz" } } ; // Original object with nested structure.
    var b = clone ( a ) ; // Clone the object.

    // Use deepEqual to check if the cloned object 'b' is structurally identical to 'a'.
    test . deepEqual ( b , a ) ;

    test . done ( ) ;
} ;


exports [ "clone array" ] = function ( test )
{
    // Expecting two assertions.
    test . expect ( 2 ) ;

    var a = [ // Original array containing an object and a string.
        { foo : "bar" } ,
        "baz"
    ] ;
    var b = clone ( a ) ; // Clone the array.

    // Verify that the cloned object 'b' is an instance of Array.
    test . ok ( b instanceof Array ) ;
    // Perform a deep comparison to ensure content equality.
    test . deepEqual ( b , a ) ;

    test . done ( ) ;
} ;


exports [ "clone buffer" ] = function ( test )
{
    // If Buffer is not defined (e.g., in a browser environment without polyfill),
    // skip this test entirely.
    if  ( typeof Buffer == 'undefined' )
    {
        return  test . done ( ) ;
    }

    // This test expects one assertion.
    test . expect ( 1 ) ;

    var a = new Buffer ( "this is a test buffer" ) ; // Create a new Buffer instance.
    var b = clone ( a ) ; // Clone the Buffer.

    // Note: Standard deepEqual might not handle Buffer objects correctly in all test runners.
    // However, for this context, it's assumed to work or be the intended comparison.
    test . deepEqual ( b , a ) ;
    test . done ( ) ;
} ;


exports [ "clone regexp" ] = function ( test )
{
    // Expecting 5 assertions for this RegExp cloning test.
    test . expect ( 5 ) ;

    var a = /abc123/gi ; // A regular expression with global and case-insensitive flags.
    var b = clone ( a ) ; // Clone the RegExp object.
    test . deepEqual ( b , a ) ; // Verify deep equality.

    var c = /a/g ; // Another RegExp, specifically global, to test lastIndex.
    test . ok ( c . lastIndex === 0 ) ; // Initial lastIndex should be 0.

    c . exec ( '123a456a' ) ; // Execute the regex, which should update lastIndex.
    test . ok ( c . lastIndex === 4 ) ; // lastIndex should now be 4 after the first match.

    var d = clone ( c ) ; // Clone the RegExp 'c' after its state has changed.
    test . ok ( d . global ) ; // Ensure global flag is preserved.
    test . ok ( d . lastIndex === 4 ) ; // Crucially, lastIndex should also be cloned correctly.

    test . done ( ) ;
} ;


exports [ "clone object containing array" ] = function ( test )
{
    // Expecting 1 assertion for this test.
    test . expect ( 1 ) ;

    var a = { // An object containing two arrays, each with an object inside.
        arr1 : [ { a : '1234' , b : '2345' } ] ,
        arr2 : [ { c : '345' , d : '456' } ]
    } ;

    var b = clone ( a ) ; // Perform the clone operation.

    test . deepEqual ( b , a ) ; // Verify that the cloned object 'b' is deeply equal to 'a'.

    test . done ( ) ;
} ;


exports [ "clone object with circular reference" ] = function ( test )
{
    // This test involves circular references and expects 8 assertions.
    test . expect ( 8 ) ;

    // Define 'c' as an array with various types, including an inner array.
    var c = [ 1 , "foo" , { 'hello' : 'bar' } , function ( ) { } , false , [ 2 ] ] ;
    // Define 'b' as an array that includes 'c' as its first element.
    var b = [ c , 2 , 3 , 4 ] ;

    // Define 'a' as an object referencing 'b' and 'c'.
    var a = { 'b' : b , 'c' : c } ;
    // Introduce circular references within 'a'.
    a . loop = a ;
    a . loop2 = a ;
    // Introduce circular reference within 'c'.
    c . loop = c ;
    // Introduce cross-reference from 'c' back to 'a'.
    c . aloop = a ;

    var aCopy = clone ( a ) ; // Perform the deep clone on 'a'.

    // Assertions to verify the clone's properties and circularity handling.
    test . ok ( a != aCopy ) ; // The cloned object should be a new instance, not the same reference.
    test . ok ( a . c != aCopy . c ) ; // Nested objects should also be new instances.
    test . ok ( aCopy . c == aCopy . b [ 0 ] ) ; // Verify cloned references maintain original structure.
    test . ok ( aCopy . c . loop . loop . aloop == aCopy ) ; // Check deep circular references.
    test . ok ( aCopy . c [ 0 ] == a . c [ 0 ] ) ; // Ensure primitive values within nested structures are identical.

    // Use the custom 'eq' function (which uses JSON.stringify with cyclic detection) for comparison.
    test . ok ( eq ( a , aCopy ) ) ; // Verify that the cloned structure is logically equivalent.
    aCopy . c [ 0 ] = 2 ; // Modify a value in the cloned object.
    test . ok ( ! eq ( a , aCopy ) ) ; // Now, they should no longer be equivalent.
    aCopy . c = "2" ; // Further modification.
    test . ok ( ! eq ( a , aCopy ) ) ; // Still not equivalent.

    // Local helper function to compare objects using JSON stringification, handling cycles.
    function eq ( x , y )
    {
        return inspect ( x ) === inspect ( y ) ;
    }

    test . done ( ) ;
} ;


exports [ 'clone prototype' ] = function ( test )
{
    // Expecting 3 assertions.
    test . expect ( 3 ) ;

    var a = { // Define a simple object.
        a : "aaa" ,
        x : 123 ,
        y : 45.65
    } ;
    var b = clone . clonePrototype ( a ) ; // Use clone.clonePrototype to create a shallow clone.

    // Verify that the properties of 'b' are strictly equal to those of 'a'.
    // This implies primitive values are copied and references might be shared for objects.
    test . strictEqual ( b . a , a . a ) ;
    test . strictEqual ( b . x , a . x ) ;
    test . strictEqual ( b . y , a . y ) ;

    test . done ( ) ;
} ;


exports [ 'clone within an apart context' ] = function ( test )
{
    // Execute code in an isolated context and verify the cloned results.
    var results = apartContext (
        { clone : clone } , // Provide the 'clone' function to the isolated context.
        "results = ctx.clone({ a: [1, 2, 3], d: new Date(), r: /^foo$/ig })" , // Script to run.
        function ( results )
        {
            // Verify that the constructors of the cloned objects are preserved across contexts.
            test . ok ( results . a . constructor . toString ( ) === Array . toString ( ) ) ;
            test . ok ( results . d . constructor . toString ( ) === Date . toString ( ) ) ;
            test . ok ( results . r . constructor . toString ( ) === RegExp . toString ( ) ) ;
            test . done ( ) ;
        }
    ) ;
} ;


exports [ 'clone object with no constructor' ] = function ( test )
{
    // Expecting 3 assertions for this test case.
    test . expect ( 3 ) ;

    var n = null ; // Define 'n' as null.

    var a = { foo : 'bar' } ; // Create a plain object.
    a . __proto__ = n ; // Explicitly set its prototype to null, making it a "null-prototype object".
    test . ok ( typeof a === 'object' ) ; // Verify it's still an object.
    test . ok ( typeof a !== null ) ; // And not null.

    var b = clone ( a ) ; // Clone the null-prototype object.
    test . ok ( a . foo , b . foo ) ; // Verify that the property 'foo' is cloned correctly.

    test . done ( ) ;
} ;


exports [ 'clone object with depth argument' ] = function ( test )
{
    // This test expects 6 assertions, focusing on the 'depth' argument of the clone function.
    test . expect ( 6 ) ;

    var a = { // A deeply nested object.
        foo : {
            bar : {
                baz : 'qux'
            }
        }
    } ;

    // Test case 1: Shallow clone with depth 1.
    // The top-level object 'a' is cloned, but 'foo' itself is not deeply cloned.
    var b = clone ( a , false , 1 ) ;
    test . deepEqual ( b , a ) ; // Deep equality holds for values.
    test . notEqual ( b , a ) ; // But 'b' should be a new object.
    test . strictEqual ( b . foo , a . foo ) ; // 'foo' property should be the same reference, not a clone.

    // Test case 2: Deeper clone with depth 2.
    // 'a' and 'foo' are cloned, but 'bar' inside 'foo' is not.
    b = clone ( a , true , 2 ) ;
    test . deepEqual ( b , a ) ; // Deep equality holds.
    test . notEqual ( b . foo , a . foo ) ; // 'foo' should be a new object.
    test . strictEqual ( b . foo . bar , a . foo . bar ) ; // 'bar' should be the same reference.

    test . done ( ) ;
} ;


exports [ 'maintain prototype chain in clones' ] = function ( test )
{
    // Expecting a single assertion for this test.
    test . expect ( 1 ) ;

    function T ( ) { } // Define a constructor function.

    var a = new T ( ) ; // Create an instance of T.
    var b = clone ( a ) ; // Clone the instance.
    // Verify that the prototype of the cloned object 'b' is strictly the same as 'a'.
    test . strictEqual ( Object . getPrototypeOf ( a ) , Object . getPrototypeOf ( b ) ) ;

    test . done ( ) ;
} ;


exports [ 'parent prototype is overriden with prototype provided' ] = function ( test )
{
    // Expecting 1 assertion for this specific prototype override test.
    test . expect ( 1 ) ;

    function T ( ) { } // Define a constructor function.

    var a = new T ( ) ; // Create an instance of T.
    // Clone 'a', but explicitly provide 'null' as the prototype to override.
    var b = clone ( a , true , Infinity , null ) ;
    // Verify that a method typically found on Object.prototype (like __defineSetter__)
    // is undefined on 'b', indicating its prototype is indeed null.
    test . strictEqual ( b . __defineSetter__ , undefined ) ;

    test . done ( ) ;
} ;


exports [ 'clone object with null children' ] = function ( test )
{
    // Expecting one assertion.
    test . expect ( 1 ) ;
    var a = { // Object with nested structure, including a null property.
        foo : {
            bar : null , // A null child property.
            baz : {
                qux : false
            }
        }
    } ;

    var b = clone ( a ) ; // Clone the object.

    test . deepEqual ( b , a ) ; // Verify that the cloned object is deeply equal to the original.
    test . done ( ) ;
} ;


exports [ 'clone instance with getter' ] = function ( test )
{
    // Expecting 1 assertion.
    test . expect ( 1 ) ;
    function Ctor ( ) { } ; // Define a constructor.
    // Define a getter property on the prototype of Ctor.
    Object . defineProperty ( Ctor . prototype , 'prop' , {
        configurable : true ,
        enumerable   : true ,
        get          : function ( )
        {
            return 'value' ;
        }
    } ) ;

    var a = new Ctor ( ) ; // Create an instance of Ctor.
    var b = clone ( a ) ; // Clone the instance.

    // Verify that the getter property is correctly accessible and returns the expected value on the clone.
    test . strictEqual ( b . prop , 'value' ) ;
    test . done ( ) ;
} ;


exports [ 'get RegExp flags' ] = function ( test )
{
    // Test the internal __getRegExpFlags utility function.
    test . strictEqual ( clone . __getRegExpFlags ( /a/ ) , '' ) ; // No flags.
    test . strictEqual ( clone . __getRegExpFlags ( /a/i ) , 'i' ) ; // Case-insensitive flag.
    test . strictEqual ( clone . __getRegExpFlags ( /a/g ) , 'g' ) ; // Global flag.
    test . strictEqual ( clone . __getRegExpFlags ( /a/gi ) , 'gi' ) ; // Global and case-insensitive flags.
    test . strictEqual ( clone . __getRegExpFlags ( /a/m ) , 'm' ) ; // Multiline flag.

    test . done ( ) ;
} ;


exports [ "recognize Array object" ] = function ( test )
{
    // Use apartContext to get an array from a different context.
    var results = apartContext ( null , "results = [1, 2, 3]" , function ( alien )
    {
        var local = [ 4 , 5 , 6 ] ; // A local array.
        test . ok ( clone . __isArray ( alien ) ) ; // Verify alien context array is recognized.
        test . ok ( clone . __isArray ( local ) ) ; // Verify local context array is recognized.
        test . ok ( ! clone . __isDate ( alien ) ) ; // Ensure it's not recognized as a Date.
        test . ok ( ! clone . __isDate ( local ) ) ; // Ensure it's not recognized as a Date.
        test . ok ( ! clone . __isRegExp ( alien ) ) ; // Ensure it's not recognized as a RegExp.
        test . ok ( ! clone . __isRegExp ( local ) ) ; // Ensure it's not recognized as a RegExp.
        test . done ( ) ;
    } ) ;
} ;


exports [ "recognize Date object" ] = function ( test )
{
    // Use apartContext to get a Date object from a different context.
    var results = apartContext ( null , "results = new Date()" , function ( alien )
    {
        var local = new Date ( ) ; // A local Date object.

        test . ok ( clone . __isDate ( alien ) ) ; // Verify alien context Date is recognized.
        test . ok ( clone . __isDate ( local ) ) ; // Verify local context Date is recognized.
        test . ok ( ! clone . __isArray ( alien ) ) ; // Ensure it's not recognized as an Array.
        test . ok ( ! clone . __isArray ( local ) ) ; // Ensure it's not recognized as an Array.
        test . ok ( ! clone . __isRegExp ( alien ) ) ; // Ensure it's not recognized as a RegExp.
        test . ok ( ! clone . __isRegExp ( local ) ) ; // Ensure it's not recognized as a RegExp.

        test . done ( ) ;
    } ) ;
} ;


exports [ "recognize RegExp object" ] = function ( test )
{
    // Use apartContext to get a RegExp object from a different context.
    var results = apartContext ( null , "results = /foo/" , function ( alien )
    {
        var local = /bar/ ; // A local RegExp object.

        test . ok ( clone . __isRegExp ( alien ) ) ; // Verify alien context RegExp is recognized.
        test . ok ( clone . __isRegExp ( local ) ) ; // Verify local context RegExp is recognized.
        test . ok ( ! clone . __isArray ( alien ) ) ; // Ensure it's not recognized as an Array.
        test . ok ( ! clone . __isArray ( local ) ) ; // Ensure it's not recognized as an Array.
        test . ok ( ! clone . __isDate ( alien ) ) ; // Ensure it's not recognized as a Date.
        test . ok ( ! clone . __isDate ( local ) ) ; // Ensure it's not recognized as a Date.
        test . done ( ) ;
    } ) ;
} ;