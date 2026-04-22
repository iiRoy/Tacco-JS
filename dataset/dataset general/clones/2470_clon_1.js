/**
 *
 *  amok - A JavaScript Mocking Framework
 *
 *  Original Copyright (c) 2008 Chris Brown
 *   - Contact: chrisincambo@gmail.com
 *   - Blog: http://chrisincambo.wordpress.com
 *
 *  Project Homepage: http://code.google.com/p/amok/
 *
 *  This software is distributed under the terms of the GNU Lesser General Public License (LGPL).
 *  You are free to redistribute and/or modify it under LGPL version 2.1 or any later version
 *  published by the Free Software Foundation.
 *
 *  This library is provided "AS IS", without any express or implied warranty.
 *  This includes, but is not limited to, the implied warranties of MERCHANTABILITY
 *  and FITNESS FOR A PARTICULAR PURPOSE. Refer to the GNU LGPL for complete details.
 *
 *  A copy of the GNU LGPL should have been provided with this distribution.
 *  If not, please write to:
 *  Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 */


/**
 *  Root namespace for the amok library.
 */
var      amok =      {};


/**
 *  This object defines the Domain Specific Language (DSL) for interacting with mock objects.
 *  It provides a fluent interface for setting up expectations on mock methods.
 *
 *  IMPORTANT CONSIDERATION: The DSL is mixed into mock objects.
 *  Therefore, within these DSL methods, 'this' refers to the mock object itself,
 *  not the 'amok.DSL' object's own scope. This is crucial for method chaining.
 */
amok.DSL = {


    should_receive : function( method_name_str ) {
        //  Adds a new method expectation to the current mock object instance.
        this.addMethod( new amok.Method( method_name_str, new amok.Expectation() ) );
        return this; //  Allow for method chaining.
    }
    ,

    with_args: function() {
        //  Retrieves the expectation for the currently "live" method.
        var expectation = this.getLiveMethod().getExpectation();
        //  Sets the expected arguments for the method call.
        expectation.setArguments( arguments );
        //  Updates the live method with the modified expectation.
        this.getLiveMethod().setExpectation( expectation );
        return this; //  Enables chaining further DSL calls.
    }
    ,

    times: function( integer_limit ) {
        //  Fetch the current expectation object from the live method.
        var expectation = this.getLiveMethod().getExpectation();
        //  Set the expected number of times this method should be called.
        expectation.setCallLimit( integer_limit );
        //  Apply the updated expectation back to the live method.
        this.getLiveMethod().setExpectation( expectation );
        return this; //  Maintain the fluent interface.
    }
    ,

    and_return: function() {
        //  Obtain the expectation linked to the most recently defined method.
        var expectation = this.getLiveMethod().getExpectation();
        //  Configure the values that the method should return.
        expectation.setReturnValues( arguments );
        //  Persist the updated expectation back to the live method.
        this.getLiveMethod().setExpectation( expectation );
        return this;        //  Return 'this' for chaining.
    }
    ,

    and_callback: function( callback_func, message_str ) {
        //  Retrieve the expectation object associated with the current method.
        var expectation = this.getLiveMethod().getExpectation();
        //  Assign a callback function and an optional message to the expectation.
        expectation.setCallback( callback_func, message_str );
        //  Update the live method's expectation with these new settings.
        this.getLiveMethod().setExpectation( expectation );
        return this;        //  Support continued method chaining.
    }
};


/**
 *  Global configuration flag: if true, methods starting with an underscore '_'
 *  will be treated as private and cannot be mocked.
 */
amok.UNDERSCORE_EQUALS_PRIVATE = true;


/**
 *  This allows replacing the default amok DSL with a custom implementation.
 *  By default, it uses 'amok.DSL'.
 */
amok.DOMAIN_SPECIFIC_LANGUAGE = amok.DSL;


/**
 *  Configuration setting: if set to true, amok will log errors to the Firebug console.
 *  Requires Firebug to be active and console.error to be available.
 */
amok.FIREBUG_ERRORS = true;


/**
 *  Configuration setting: if true, amok will throw JavaScript exceptions,
 *  which can halt execution.
 *
 *  NOTE: There's a known issue where Firebug might sometimes suppress
 *  browser-level exceptions, preventing them from being displayed.
 */
amok.BROWSER_ERRORS = true;


/**
 *  Static factory method to create a new mock object.
 *  @param {Object} mockee - The object or constructor to be mocked.
 *  @returns {amok.Mock} A new mock instance.
 */
amok.mock = function ( mockee_object ) {
    var mock_instance = new amok.Mock( mockee_object );
    return mock_instance;
};


/**
 *  The core Mock class. It intercepts calls to methods of the `mockee` object
 *  and applies expectations.
 *  @param {Object} mockee - The original object or constructor being mocked.
 */
amok.Mock = function ( mockee ) {

    //  Private variable to hold the reference to the original object.
    var _mockee = mockee;
    //  A dictionary to store all mocked methods and their expectations.
    var _methods = {};
    //  Keeps track of the last method added or configured, for DSL chaining.
    var _liveMethod = null;

    //  Mix in the defined Domain Specific Language (DSL) methods.
    //  This makes methods like 'should_receive', 'with_args', etc.,
    //  directly available on the mock object instance.
    var _dsl = amok.DOMAIN_SPECIFIC_LANGUAGE;
    for ( var property in _dsl ) {
        if ( !this[ property ] ) {
            this[ property ] = _dsl[ property ];
        }
    }


    /**
     *  Adds a method to the mock object, setting up its interception logic.
     *  @param {amok.Method} method - An instance of amok.Method representing the mocked method.
     */
    this.addMethod = function ( method ) {

        //  First, ensure that the method being mocked actually exists
        //  as a public method in the interface of the original object.
        if ( amok.Util.hasMethod( _mockee, method.getName() ) ) {
            amok.Util.error( "amok Method: " + method.getName() + "() is not a public method within the interface of the object being mocked" );
        }

        //  Replace the original method on the mock object with our interception function.
        //  This function will delegate to the amok.Method's callback logic.
        this[ method.getName() ] = function ( val_argument ) {
            return method.callback( arguments );
        };

        //  Store the amok.Method instance internally for later retrieval and configuration.
        _methods[ method.getName() ] = method;
        //  Set this method as the currently "live" method for DSL chaining.
        _liveMethod = method;
    };


    /**
     *  Retrieves the method that was most recently added or configured.
     *  This is primarily used by the DSL for chaining operations.
     *  @returns {amok.Method} The last amok.Method instance that was processed.
     */
    this.getLiveMethod = function () {
        return _liveMethod;
    };
};


/**
 *  Represents a single method being mocked, encapsulating its name,
 *  expectations, and call count.
 *  @class amok.Method
 *  @param {String} name - The name of the method being mocked.
 *  @param {Object} expectation - An instance of amok.Expectation defining call behavior.
 */
amok.Method = function ( name, expectation ) {

    var _name = name; //  The name of the method.
    var _expectation = expectation; //  The expectations for this method.
    var _calls = 0; //  Counter for how many times this method has been called.


    /**
     *  Retrieves the name of this mocked method.
     *  @returns {String} The method's name.
     */
    this.getName = function () {
        return _name;
    };


    /**
     *  Retrieves the expectation object associated with this method.
     *  @returns {amok.Expectation} The expectation instance.
     */
    this.getExpectation = function () {
        return _expectation;
    };


    /**
     *  Sets or updates the expectation object for this method.
     *  @param {amok.Expectation} expectation - The new expectation instance.
     */
    this.setExpectation = function ( expectation ) {
        _expectation = expectation;
    };


    /**
     *  The actual function that replaces the original method on the mock object.
     *  It handles call counting, argument checking, callback execution, and return values.
     *  @param {IArguments} args - The arguments passed to the mocked method.
     *  @returns {*} The return value defined by the expectation.
     */
    this.callback = function ( args ) {
        //  Increment the call counter for this method.
        _calls++;

        //  Check if the call limit has been exceeded.
        if ( _expectation.getCallLimit() !== null && _calls > _expectation.getCallLimit() ) {
            amok.Util.error( "amok Method: " + _name + "() - has exceeded its call limit of " + _expectation.getCallLimit() );
        }

        //  Iterate through expected arguments and compare them with actual arguments.
        for ( var i = 0; i < _expectation.getArguments().length; i++ ) {
            var arg = _expectation.getArguments()[ i ];
            var expectedArgBaseType = amok.Util.isBaseType( arg );
            //  _type is a custom property added to prototypes for type checking.
            var givenArgBaseType = args[ i ] ? args[ i ]._type : undefined;
            if ( givenArgBaseType === undefined ) {
                givenArgBaseType = "Object"; //  Default to "Object" if _type not present (e.g., plain objects).
            }


            //  Verify that an argument was actually passed if one was expected.
            if ( !args[ i ] ) {
                amok.Util.error( "amok Method: " + _name + "() has been called without an expected argument - argument " + ( i + 1 ) + " should have been " + arg );
            }

            //  If the expected argument is a base type (e.g., String, Number), perform a type check.
            if ( expectedArgBaseType ) {
                if ( givenArgBaseType == expectedArgBaseType ) {
                    continue; //  Type matches, proceed to next argument.
                } else {
                    //  Type mismatch detected.
                    amok.Util.error( "amok Method: " + _name + "() has been called with an argument that differs from that expected - actual value type: " + givenArgBaseType + " should be: " + expectedArgBaseType );
                }
            }

            //  If no type check was performed (or it passed), perform a deep equality check.
            if ( !amok.Util.equal( arg, args[ i ] ) ) {
                amok.Util.error( "amok Method: " + _name + "() has been called with an argument that differs from that expected - actual value: " + args[ i ] + " should be: " + arg );
            }
        }

        //  Execute the registered callback function, if one exists.
        if ( _expectation.getCallback() ) {
            //  The callback is stored as an object { callback: func, message: msg }
            _expectation.getCallback().callback( _expectation.getCallback().message );
        }

        //  Determine and return the appropriate value based on expectations.
        if ( _expectation.getReturnValues().length > 0 ) {
            //  If multiple return values are specified, use them sequentially.
            //  Otherwise, repeatedly return the last specified value.
            return _expectation.getReturnValues()[ _calls - 1 ] || _expectation.getReturnValues()[ _expectation.getReturnValues().length - 1 ];
        }
    };
};


/**
 *  Class for managing and storing method expectations (e.g., call limits,
 *  expected arguments, return values, callbacks).
 *  @class amok.Expectation
 */
amok.Expectation = function () {

    var _callLimit = null; //  The maximum number of times the method is expected to be called. Null means no limit.
    var _arguments = []; //  An array of expected arguments for the method call.
    var _returnValues = []; //  An array of values to be returned by the method.
    var _callback = null; //  A callback function to be executed when the method is called.


    /**
     *  Retrieves the call limit for this expectation.
     *  @returns {Number|null} The maximum call count or null if unbounded.
     */
    this.getCallLimit = function () {
        return _callLimit;
    };


    /**
     *  Sets the call limit for this expectation.
     *  @param {Number} callLimit - The new call limit.
     */
    this.setCallLimit = function ( callLimit ) {
        _callLimit = callLimit;
    };


    /**
     *  Retrieves the array of expected arguments.
     *  @returns {Array} An array containing the expected arguments.
     */
    this.getArguments = function () {
        return _arguments;
    };


    /**
     *  Sets the expected arguments for this method call.
     *  @param {IArguments} args - The arguments object or an array of expected arguments.
     */
    this.setArguments = function ( args ) {
        _arguments = args;
    };


    /**
     *  Retrieves the array of return values.
     *  @returns {Array} An array of values to be returned.
     */
    this.getReturnValues = function () {
        return _returnValues;
    };


    /**
     *  Sets the values that this method should return.
     *  @param {IArguments} args - The arguments object or an array of return values.
     */
    this.setReturnValues = function ( args ) {
        _returnValues = args;
    };


    /**
     *  Retrieves the callback object (containing function and message).
     *  @returns {Object|null} An object { callback: Function, message: String } or null.
     */
    this.getCallback = function () {
        return _callback;
    };


    /**
     *  Sets a callback function and an optional message to be executed when the method is called.
     *  @param {Function} callback_func - The function to call.
     *  @param {String} message_str - An optional message to pass to the callback.
     */
    this.setCallback = function ( callback_func, message_str ) {
        _callback = { callback: callback_func, message: message_str };
    };

};


/**
 *  Utility functions for amok, including error handling,
 *  equality checks, type checking, and method discovery.
 */
amok.Util = {

    /**
     *  Handles and reports errors generated by the amok framework.
     *  Error behavior is controlled by global flags (amok.FIREBUG_ERRORS, amok.BROWSER_ERRORS).
     *  @param {String} msg - The error message to display.
     */
    error: function ( msg ) {
        if ( amok.FIREBUG_ERRORS && console && console.error ) {
            console.error( 'Exception: ' + msg );
        }
        if ( amok.BROWSER_ERRORS ) {
            throw msg;
        }
    },

    /**
     *  Compares two items for deep equality.
     *  Objects and Arrays are compared by their contents, not by reference.
     *  Supports comparison of primitive types, arrays, and plain objects.
     *  @param {*} a - The first item to compare.
     *  @param {*} b - The second item to compare.
     *  @returns {Boolean} True if the items are deeply equal, false otherwise.
     */
    equal: function ( a, b ) {
        //  If their custom _type properties differ, they are not equal.
        if ( a && b && a._type != b._type ) {
            return false;
        }

        //  Special handling for Array comparison.
        if ( a && a._type == "Array" ) {
            //  Arrays must have the same length.
            if ( a.length != b.length ) {
                return false;
            }
            //  Recursively compare each element.
            for ( var i = 0; i < a.length; i++ ) {
                if ( !this.equal( a[ i ], b[ i ] ) ) {
                    return false;
                }
            }
            return true; //  All elements matched.
        }

        //  Special handling for Object comparison (plain objects).
        //  Note: this treats any 'object' (excluding arrays handled above)
        //  as a plain object for property comparison.
        if ( typeof a == "object" && a !== null && b !== null ) {
            //  Check if all properties in 'a' exist in 'b' and are equal.
            for ( var property in a ) {
                if ( a.hasOwnProperty( property ) ) { // Ensure it's not a prototype property.
                    if ( !b.hasOwnProperty( property ) || !this.equal( a[ property ], b[ property ] ) ) {
                        return false;
                    }
                }
            }
            //  Check if all properties in 'b' exist in 'a' and are equal.
            //  This handles cases where 'b' might have extra properties not in 'a'.
            for ( var property_b in b ) {
                if ( b.hasOwnProperty( property_b ) ) {
                    if ( !a.hasOwnProperty( property_b ) || !this.equal( a[ property_b ], b[ property_b ] ) ) {
                        return false;
                    }
                }
            }
            return true; //  All properties matched in both directions.
        }

        //  For primitive types or objects not covered above, use strict equality.
        return ( a === b );
    },


    /**
     *  Determines if an item is one of the JavaScript built-in base types
     *  (e.g., String, Number, Array).
     *  @param {*} item - The item to check.
     *  @returns {String|Boolean} The base type as a string (e.g., "String", "Number")
     *                           or false if it's not a recognized base type constructor.
     */
    isBaseType: function ( item ) {

        switch ( item ) {
            case String:
                return "String";
            case Number:
                return "Number";
            case Array:
                return "Array";
            case Date:
                return "Date";
            case Boolean:
                return "Boolean";
            case Object:
                return "Object";
            case Function:
                return "Function";
            case RegExp:
                return "RegExp";
            default:
                return false;
        }
    },


    /**
     *  Checks if a given object (mockee) has a specified method.
     *  This includes methods directly on the instance, on its prototype chain,
     *  and methods defined in the constructor function itself (if using a specific pattern).
     *  @param {Object} mockee - The object or constructor whose methods are being checked.
     *  @param {String} method_name - The name of the method to look for.
     *  @returns {Boolean} True if the method exists, false otherwise.
     */
    hasMethod: function ( mockee, method_name ) {
        //  Check for methods directly on the instance.
        for ( var property in mockee ) {
            if ( property === method_name && typeof mockee[ property ] === "function" ) {
                return true;
            }
        }

        //  Check for methods on the prototype chain if 'mockee' has a prototype.
        if ( typeof mockee.prototype == "object" ) {
            for ( var prototypeMethod in mockee.prototype ) {
                if ( prototypeMethod === method_name && typeof mockee.prototype[ prototypeMethod ] == "function" ) {
                    return true;
                }
            }
            //  Additionally, check methods defined within the constructor function itself.
            var constructorMethods = this.getConstructorMethods( mockee );
            for ( var i = 0; i < constructorMethods.length; i++ ) {
                if ( constructorMethods[ i ] === method_name ) {
                    return true;
                }
            }
        }
        return false; //  Method not found.
    },


    /**
     *  Parses a constructor function's string representation to extract
     *  method names defined using the 'this.methodName = function() { ... }' pattern.
     *  This allows discovering methods without needing to instantiate the object.
     *  @param {Function} classObject - The constructor function (e.g., MyClass).
     *  @returns {Array<String>} An array of method names found in the constructor.
     */
    getConstructorMethods: function ( classObject ) {

        var constructorString = classObject.prototype.constructor.toString();
        //  Regex to find patterns like 'this.methodName = function()'
        var pattern = /this\..+\s*\=\s*\(*\s*function\s*\(\)/g;
        var result;
        var methods = [];

        //  Iterate through all matches found by the regex.
        while ( ( result = pattern.exec( constructorString ) ) != null ) {

            //  Extract the substring leading up to the current match.
            var tmp = constructorString.substring( 0, result.index );

            //  Count opening and closing curly braces in 'tmp' to determine scope.
            var leftCurlyBracket = /\{/g;
            var rightCurlyBracket = /\}/g;

            var i = 0; //  Count of '{'
            while ( leftCurlyBracket.exec( tmp ) != null ) {
                i++;
            }

            var j = 0; //  Count of '}'
            while ( rightCurlyBracket.exec( tmp ) != null ) {
                j++;
            }

            //  If (open_braces - 1 == close_braces), it means the match is
            //  at the top level of the constructor function body.
            if ( i - 1 == j ) {
                //  Extract the method name from the matched string.
                //  e.g., "this.myMethod = function()" -> "myMethod"
                methods.push( result[ 0 ].substring( 5, result[ 0 ].indexOf( "=" ) ).replace( " ", "" ) );
            }
        }

        return methods;
    }
};


/**
 *  Extension of built-in prototypes to add a custom '_type' property.
 *  This property is used internally by amok for type checking in equality comparisons.
 *  While generally discouraged, this approach is adopted here, similar to practices
 *  seen in frameworks like jsspec.
 */
String.prototype._type = "String";
Number.prototype._type = "Number";
Date.prototype._type = "Date";
Array.prototype._type = "Array";
Boolean.prototype._type = "Boolean";
RegExp.prototype._type = "RegExp";