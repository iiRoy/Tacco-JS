var isCommonJS = typeof window == "undefined" ; /* This variable flags if the environment is CommonJS */

/**
 * Top level namespace for Jasmine, a lightweight JavaScript BDD/spec/testing framework.
 * This object serves as the root for all Jasmine functionalities.
 * @namespace
 */
var jasmine = { } ;

// If running in a CommonJS environment, export the jasmine object
if ( isCommonJS ) {
    exports.jasmine = jasmine ;
}

/**
 * @private
 * Internal method to indicate unimplemented functionality.
 * Throws an error if called.
 */
jasmine.unimplementedMethod_ = function ( ) {
    throw new Error ( "unimplemented method" ) ;
} ;


/**
 * Use <code>jasmine.undefined</code> instead of <code>undefined</code>.
 * This is a safeguard as the global `undefined` can be reassigned in older JS environments.
 *
 * @private
 * @constant
 */
jasmine.undefined = jasmine.___undefined___ ; // Assigns a truly undefined value

/**
 * Show diagnostic messages in the console if set to true.
 * This flag controls the verbosity of Jasmine's output.
 */
jasmine.VERBOSE = false ;

/**
 * Default interval in milliseconds for event loop yields.
 * (e.g. to allow network activity or to refresh the screen with the HTML-based runner).
 * Small values here may result in slow test running.
 * Zero means no updates until all tests have completed.
 *
 */
jasmine.DEFAULT_UPDATE_INTERVAL = 250 ;

/**
 * Default timeout interval in milliseconds for waitsFor() blocks.
 * Specs exceeding this timeout will fail.
 */
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000 ;

// Fetches the global object (window in browsers, global in Node.js)
jasmine.getGlobal = function ( ) {
    function getGlobal ( ) {
        return this ; // 'this' refers to the global object in non-strict mode
    }

    return getGlobal ( ) ;
} ;

/**
 * Allows for bound functions to be compared.  Internal use only.
 * This helper binds an original method to its context (base object).
 *
 * @ignore
 * @private
 * @param base {Object} The object to which the function is bound ('this' context).
 * @param name {Function} The name of the function to find and bind.
 */
jasmine.bindOriginal_ = function ( base , name ) {
    var original = base [ name ] ; // Get the original function reference

    if ( original.apply ) {
        // If it's a regular function, return a new function that applies it to the base context
        return function ( ) {
            return original.apply ( base , arguments ) ;
        } ;
    } else {
        // Handle environments where `apply` might not be directly on native functions (e.g., some IE versions)
        return jasmine.getGlobal ( ) [ name ] ;
    }
} ;

// Bind standard global functions to Jasmine's scope
jasmine.setTimeout    = jasmine.bindOriginal_ ( jasmine.getGlobal ( ) , 'setTimeout'    ) ;
jasmine.clearTimeout  = jasmine.bindOriginal_ ( jasmine.getGlobal ( ) , 'clearTimeout'  ) ;
jasmine.setInterval   = jasmine.bindOriginal_ ( jasmine.getGlobal ( ) , 'setInterval'   ) ;
jasmine.clearInterval = jasmine.bindOriginal_ ( jasmine.getGlobal ( ) , 'clearInterval' ) ;

/**
 * Constructor for a MessageResult, used for logging messages in specs.
 * @constructor
 * @param {Array} values An array of values to be logged.
 */
jasmine.MessageResult = function ( values ) {
    this.type   = 'log' ;       // Type of the result
    this.values = values ;      // The actual values to log
    this.trace  = new Error ( ) ; // Capture stack trace for debugging
    // TODO: Consider improving error tracing for MessageResult
} ;

/**
 * Converts the MessageResult into a human-readable string.
 * @returns {String} The concatenated string representation of the logged values.
 */
jasmine.MessageResult.prototype.toString = function ( ) {
    var text = "" ; // Initialize an empty string for concatenation

    for ( var i = 0 ; i < this.values.length ; i++ ) {
        if ( i > 0 ) {
            text += " " ; // Add a space separator if it's not the first value
        }

        if ( jasmine.isString_ ( this.values [ i ] ) ) {
            text += this.values [ i ] ; // Append string directly
        } else {
            text += jasmine.pp ( this.values [ i ] ) ; // Pretty-print non-string values
        }
    }
    return text ;
} ;

/**
 * Constructor for an ExpectationResult, representing the outcome of an expectation.
 * @constructor
 * @param {Object} params Parameters describing the expectation result.
 */
jasmine.ExpectationResult = function ( params ) {
    this.type        = 'expect' ;              // Result type
    this.matcherName = params.matcherName ;    // Name of the matcher used
    this.passed_     = params.passed ;         // Boolean indicating if the expectation passed
    this.expected    = params.expected ;       // The expected value
    this.actual      = params.actual ;         // The actual value
    this.message     = this.passed_ ? 'Passed.' : params.message ; // Result message

    var trace = ( params.trace || new Error ( this.message ) ) ; // Capture or use provided trace
    this.trace = this.passed_ ? '' : trace ; // Only store trace if the expectation failed
} ;

/**
 * Returns the message associated with this expectation result.
 * @returns {String} The expectation message.
 */
jasmine.ExpectationResult.prototype.toString = function ( ) {
    return this.message ;
} ;

/**
 * Checks if the expectation passed.
 * @returns {Boolean} True if the expectation passed, false otherwise.
 */
jasmine.ExpectationResult.prototype.passed = function ( ) {
    return this.passed_ ;
} ;

/**
 * Getter for the Jasmine environment. Ensures one gets created if it doesn't exist.
 * This is the central hub for managing specs and suites.
 * @returns {jasmine.Env} The current Jasmine environment instance.
 */
jasmine.getEnv = function ( ) {
    var env = jasmine.currentEnv_ = jasmine.currentEnv_ || new jasmine.Env ( ) ; // Lazy initialization
    return env ;
} ;

/**
 * @ignore
 * @private
 * Checks if a given value is an Array.
 * @param value {*} The value to check.
 * @returns {Boolean} True if the value is an Array, false otherwise.
 */
jasmine.isArray_ = function ( value ) {
    return jasmine.isA_ ( "Array" , value ) ;
} ;

/**
 * @ignore
 * @private
 * Checks if a given value is a String.
 * @param value {*} The value to check.
 * @returns {Boolean} True if the value is a String, false otherwise.
 */
jasmine.isString_ = function ( value ) {
    return jasmine.isA_ ( "String" , value ) ;
} ;

/**
 * @ignore
 * @private
 * Checks if a given value is a Number.
 * @param value {*} The value to check.
 * @returns {Boolean} True if the value is a Number, false otherwise.
 */
jasmine.isNumber_ = function ( value ) {
    return jasmine.isA_ ( "Number" , value ) ;
} ;

/**
 * @ignore
 * @private
 * Generic type checker using Object.prototype.toString.
 * @param {String} typeName The expected type name (e.g., "Array", "String").
 * @param value {*} The value to check.
 * @returns {Boolean} True if the value matches the type, false otherwise.
 */
jasmine.isA_ = function ( typeName , value ) {
    return Object.prototype.toString.apply ( value ) === '[object ' + typeName + ']' ;
} ;

/**
 * Pretty printer for expectations. Takes any object and turns it into a human-readable string.
 * This is used for displaying values in expectation failure messages.
 *
 * @param value {Object} An object to be outputted.
 * @returns {String} The pretty-printed string representation of the object.
 */
jasmine.pp = function ( value ) {
    var stringPrettyPrinter = new jasmine.StringPrettyPrinter ( ) ; // Create a new pretty printer instance
    stringPrettyPrinter.format ( value ) ; // Format the value
    return stringPrettyPrinter.string ; // Return the formatted string
} ;

/**
 * Returns true if the object is a DOM Node.
 * Used for specific DOM-related matchers.
 *
 * @param {Object} obj Object to check.
 * @returns {Boolean} True if the object is a DOM Node, false otherwise.
 */
jasmine.isDomNode = function ( obj ) {
    return obj.nodeType > 0 ; // Check if nodeType property exists and is positive
} ;

/**
 * Returns a matchable 'generic' object of the class type. For use in expectations of type when values don't matter.
 * This creates a special matcher that checks only the type of an object.
 *
 * @example
 * // don't care about which function is passed in, as long as it's a function
 * expect(mySpy).toHaveBeenCalledWith(jasmine.any(Function));
 *
 * @param {Class} clazz The constructor function (Class) to match against.
 * @returns matchable object of the type clazz
 */
jasmine.any = function ( clazz ) {
    return new jasmine.Matchers.Any ( clazz ) ;
} ;

/**
 * Returns a matchable subset of a hash/JSON object.
 * For use in expectations when you don't care about all of the attributes on the object.
 * This matcher checks if an object contains at least the specified properties with matching values.
 *
 * @example
 * // don't care about any other attributes than foo.
 * expect(mySpy).toHaveBeenCalledWith(jasmine.hashContaining({foo: "bar"}));
 *
 * @param sample {Object} The sample object (subset) to match.
 * @returns matchable object for the sample
 */
jasmine.objectContaining = function ( sample ) {
    return new jasmine.Matchers.ObjectContaining ( sample ) ;
} ;

/**
 * Jasmine Spies are test doubles that can act as stubs, spies, fakes, or when used in an expectation, mocks.
 * Spies should be created in test setup, before expectations. They can then be checked using the standard Jasmine
 * expectation syntax. Spies can be checked if they were called or not and what the calling parameters were.
 *
 * A Spy has the following fields: wasCalled, callCount, mostRecentCall, and argsForCall (see docs).
 * Spies are torn down at the end of every spec.
 *
 * Note: Do <b>not</b> call new jasmine.Spy() directly - a spy must be created using spyOn, jasmine.createSpy, or jasmine.createSpyObj.
 *
 * @example
 * // a stub
 * var myStub = jasmine.createSpy('myStub');  // can be used anywhere
 *
 * // spy example (default behavior: stops original execution)
 * var foo = {
 *   not: function(bool) { return !bool; }
 * }
 * spyOn(foo, 'not'); // actual foo.not will not be called, execution stops
 *
 * // spy example (call through to original implementation)
 * // foo.not spied upon, execution will continue to implementation
 * spyOn(foo, 'not').andCallThrough();
 *
 * // fake example
 * var foo = {
 *   not: function(bool) { return !bool; }
 * }
 * // foo.not(val) will return val
 * spyOn(foo, 'not').andCallFake(function(value) {return value;});
 *
 * // mock example
 * foo.not(7 == 7);
 * expect(foo.not).toHaveBeenCalled();
 * expect(foo.not).toHaveBeenCalledWith(true);
 *
 * @constructor
 * @see spyOn, jasmine.createSpy, jasmine.createSpyObj
 * @param {String} name An optional name for the spy, used for identification.
 */
jasmine.Spy = function ( name ) {
    /**
     * The name of the spy, if provided, otherwise 'unknown'.
     * @type {String}
     */
    this.identity = name || 'unknown' ;

    /**
     *  Flag to identify if this Object is a spy.
     * @type {Boolean}
     */
    this.isSpy = true ;

    /**
     * The actual function this spy stubs or wraps.
     * This 'plan' function is executed when the spy is called.
     * @type {Function}
     */
    this.plan = function ( ) { } ;

    /**
     * Tracking of the most recent call to the spy.
     * Contains `object` (the `this` context) and `args` (arguments array).
     * @example
     * var mySpy = jasmine.createSpy('foo');
     * mySpy(1, 2);
     * console.log(mySpy.mostRecentCall.args); // [1, 2]
     * @type {Object}
     */
    this.mostRecentCall = { } ;

    /**
     * Holds arguments for each call to the spy, indexed by call count.
     * Each element is an array of arguments for that specific call.
     * @example
     * var mySpy = jasmine.createSpy('foo');
     * mySpy(1, 2);
     * mySpy(7, 8);
     * console.log(mySpy.argsForCall[0]); // [1, 2]
     * console.log(mySpy.argsForCall[1]); // [7, 8]
     * @type {Array<Array>}
     */
    this.argsForCall = [ ] ;

    /**
     * Holds full call objects for each call to the spy, including `object` (this context) and `args`.
     * @type {Array<Object>}
     */
    this.calls = [ ] ;
} ;

/**
 * Tells a spy to call through to the actual implementation of the spied-upon function.
 * This allows the original method to execute while still tracking calls.
 *
 * @example
 * var foo = {
 *   bar: function() { console.log("original bar"); }
 * }
 * spyOn(foo, 'bar').andCallThrough();
 * foo.bar(); // Logs "original bar"
 * expect(foo.bar).toHaveBeenCalled();
 *
 * @returns {jasmine.Spy} The spy instance, for chaining.
 */
jasmine.Spy.prototype.andCallThrough = function ( ) {
    this.plan = this.originalValue ; // Set the plan to the original function
    return this ;
} ;

/**
 * For setting the return value of a spy.
 * When the spy is called, it will return this specified value.
 *
 * @example
 * // defining a spy from scratch: foo() returns 'baz'
 * var foo = jasmine.createSpy('spy on foo').andReturn('baz');
 * console.log(foo()); // 'baz'
 *
 * // defining a spy on an existing property: foo.bar() returns 'baz'
 * var obj = { bar: function() {} };
 * spyOn(obj, 'bar').andReturn('baz');
 * console.log(obj.bar()); // 'baz'
 *
 * @param {Object} value The value to return when the spy is called.
 * @returns {jasmine.Spy} The spy instance, for chaining.
 */
jasmine.Spy.prototype.andReturn = function ( value ) {
    this.plan = function ( ) {
        return value ; // Define a plan that always returns the specified value
    } ;
    return this ;
} ;

/**
 * For throwing an exception when a spy is called.
 * When the spy is called, it will throw the specified exception.
 *
 * @example
 * // defining a spy from scratch: foo() throws an exception w/ message 'ouch'
 * var foo = jasmine.createSpy('spy on foo').andThrow('ouch');
 * try { foo(); } catch (e) { console.log(e); } // 'ouch'
 *
 * // defining a spy on an existing property: foo.bar() throws an exception w/ message 'ouch'
 * var obj = { bar: function() {} };
 * spyOn(obj, 'bar').andThrow('ouch');
 *
 * @param {String} exceptionMsg The message or object to throw as an exception.
 * @returns {jasmine.Spy} The spy instance, for chaining.
 */
jasmine.Spy.prototype.andThrow = function ( exceptionMsg ) {
    this.plan = function ( ) {
        throw exceptionMsg ; // Define a plan that throws the exception
    } ;
    return this ;
} ;

/**
 * Calls an alternate implementation when a spy is called.
 * This allows defining custom behavior for a spy.
 *
 * @example
 * var baz = function(arg) {
 *   return "modified " + arg;
 * }
 * // defining a spy from scratch: foo() calls the function baz
 * var foo = jasmine.createSpy('spy on foo').andCallFake(baz);
 * console.log(foo("value")); // "modified value"
 *
 * // defining a spy on an existing property: foo.bar() calls an anonymous function
 * var obj = { bar: function() {} };
 * spyOn(obj, 'bar').andCallFake(function(value) { return 'faked ' + value; } );
 * console.log(obj.bar("test")); // "faked test"
 *
 * @param {Function} fakeFunc The function to call instead of the original or default spy behavior.
 * @returns {jasmine.Spy} The spy instance, for chaining.
 */
jasmine.Spy.prototype.andCallFake = function ( fakeFunc ) {
    this.plan = fakeFunc ; // Set the plan to the provided fake function
    return this ;
} ;

/**
 * Resets all of a spy's tracking variables so that it can be used again.
 * This clears call count, arguments, and most recent call information.
 *
 * @example
 * spyOn(foo, 'bar');
 * foo.bar();
 * expect(foo.bar.callCount).toEqual(1);
 * foo.bar.reset(); // Clear tracking
 * expect(foo.bar.callCount).toEqual(0);
 *
 */
jasmine.Spy.prototype.reset = function ( ) {
    this.wasCalled      = false ; // Reset call status
    this.callCount      = 0 ;     // Reset call count
    this.argsForCall    = [ ] ;   // Clear recorded arguments
    this.calls          = [ ] ;   // Clear recorded call objects
    this.mostRecentCall = { } ;   // Clear most recent call info
} ;

/**
 * Creates a new standalone Jasmine spy function.
 * This spy can be called independently and its calls tracked.
 *
 * @param {String} name An optional name for the spy.
 * @returns {Function} A new spy function.
 */
jasmine.createSpy = function ( name ) {

    // Define the actual function that will act as the spy
    var spyObj = function ( ) {
        spyObj.wasCalled = true ;           // Mark as called
        spyObj.callCount++ ;                // Increment call count
        var args = jasmine.util.argsToArray ( arguments ) ; // Convert arguments to an array
        spyObj.mostRecentCall.object = this ; // Store 'this' context of the call
        spyObj.mostRecentCall.args = args ; // Store arguments of the call
        spyObj.argsForCall.push ( args ) ;  // Add arguments to the list of all calls
        spyObj.calls.push ( { object : this , args : args } ) ; // Store full call object

        // Execute the spy's current plan (e.g., return value, call through, throw error)
        return spyObj.plan.apply ( this , arguments ) ;
    } ;

    // Create a base Jasmine Spy object to inherit properties from
    var spy = new jasmine.Spy ( name ) ;

    // Copy properties from the base spy object to the spy function
    for ( var prop in spy ) {
        // Ensure not to overwrite existing function properties like 'name', 'length'
        if ( spy.hasOwnProperty ( prop ) ) {
            spyObj [ prop ] = spy [ prop ] ;
        }
    }

    // Initialize the spy's tracking properties
    spyObj.reset ( ) ;

    return spyObj ; // Return the created spy function
} ;

/**
 * Determines whether an object is a Jasmine spy.
 * Checks for the `isSpy` property.
 *
 * @param {jasmine.Spy|Object} putativeSpy The object to check.
 * @returns {Boolean} True if the object is a spy, false otherwise.
 */
jasmine.isSpy = function ( putativeSpy ) {
    return putativeSpy && putativeSpy.isSpy ; // Check if it exists and has the isSpy flag
} ;

/**
 * Creates a more complicated spy: an Object that has every property a function that is a spy.
 * Used for stubbing something large in one call (e.g., an entire service).
 *
 * @param {String} baseName Name of the spy class or object.
 * @param {Array} methodNames Array of names of methods to make spies for.
 * @returns {Object} An object where each specified method is a Jasmine spy.
 * @throws {Error} If methodNames is not a non-empty array.
 */
jasmine.createSpyObj = function ( baseName , methodNames ) {
    // Validate input: methodNames must be a non-empty array
    if ( ! jasmine.isArray_ ( methodNames ) || methodNames.length === 0 ) {
        throw new Error ( 'createSpyObj requires a non-empty array of method names to create spies for' ) ;
    }

    var obj = { } ; // Initialize an empty object

    // Iterate through the provided method names
    for ( var i = 0 ; i < methodNames.length ; i++ ) {
        // Create a spy for each method and assign it to the object
        obj [ methodNames [ i ] ] = jasmine.createSpy ( baseName + '.' + methodNames [ i ] ) ;
    }
    return obj ; // Return the object with spied methods
} ;

/**
 * All parameters are pretty-printed and concatenated together, then written to the current spec's output.
 * This is a utility for logging messages directly within a spec.
 *
 * Be careful not to leave calls to <code>jasmine.log</code> in production code.
 *
 * @param {...*} arguments Any number of arguments to be logged.
 */
jasmine.log = function ( ) {
    var spec = jasmine.getEnv ( ).currentSpec ; // Get the current running spec
    spec.log.apply ( spec , arguments ) ; // Apply the arguments to the spec's log method
} ;

/**
 * Function that installs a spy on an existing object's method name.
 * Used within a Spec to create a spy.
 * This replaces the original method with a spy, allowing tracking and custom behavior.
 *
 * @example
 * // spy example
 * var foo = {
 *   not: function(bool) { return !bool; }
 * }
 * spyOn(foo, 'not'); // actual foo.not will not be called, execution stops
 *
 * @see jasmine.createSpy
 * @param {Object} obj The object containing the method to spy on.
 * @param {String} methodName The name of the method to spy on.
 * @returns {jasmine.Spy} A Jasmine spy that can be chained with all spy methods (e.g., andReturn, andCallFake).
 */
var spyOn = function ( obj , methodName ) {
    return jasmine.getEnv ( ).currentSpec.spyOn ( obj , methodName ) ;
} ;

// Export spyOn for CommonJS environments
if ( isCommonJS ) {
    exports.spyOn = spyOn ;
}

/**
 * Creates a Jasmine spec that will be added to the current suite.
 * This is the primary function for defining individual tests.
 *
 * // TODO: Investigate pending tests functionality.
 *
 * @example
 * it('should be true', function() {
 *   expect(true).toEqual(true);
 * });
 *
 * @param {String} desc Description of this specification.
 * @param {Function} func Defines the preconditions and expectations of the spec.
 * @returns {jasmine.Spec} The created spec object.
 */
var it = function ( desc , func ) {
    return jasmine.getEnv ( ).it ( desc , func ) ;
} ;

// Export it for CommonJS environments
if ( isCommonJS ) {
    exports.it = it ;
}

/**
 * Creates a <em>disabled</em> Jasmine spec.
 * A convenience method that allows existing specs to be disabled temporarily during development.
 * Disabled specs will be reported as pending and will not run their `func`.
 *
 * @param {String} desc Description of this specification.
 * @param {Function} func Defines the preconditions and expectations of the spec (will not be executed).
 * @returns {jasmine.Spec} The created disabled spec object.
 */
var xit = function ( desc , func ) {
    return jasmine.getEnv ( ).xit ( desc , func ) ;
} ;