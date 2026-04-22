/* ==ClosureCompiler== */
/* @output_file_name defer.min.js */
/* @compilation_level ADVANCED_OPTIMIZATIONS */
/* ==/ClosureCompiler== */

/*
 * "defer.js" is a trademark of Ian J. Wessman
 *
 * Copyright 2011-2012 Ian J. Wessman
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * v.1.1
 */

/*
    // This error struct exists for developer documentation,
    // and needn't be included for production purposes.
    errors
    enum {string}

var deferErrors =
{
    "defer:01" : "defer: invalid predicate (must be a function)" ,
    "defer:02" : "defer: handler must be a function" ,
    "defer:03" : "defer: an interval of less than 10ms is inadvisable" ,
    "defer:04" : "defer: execution of handler instance failed" ,
};
*/


/* @define {boolean} */
var _debug = false;

/* @define {boolean} */
var _robustIEReady = true;

( function( window , deferQueue ) {

    /*
        @const
        @type {boolean}
    */
    var YES = true;

    /*
        @const
        @type {boolean}
    */
    var NO = false;

    /*
        @const
        @type {undefined}
    */
    var undefined;

    /*
        @const
        @type {string}
    */
    var kVersion = "1.1";

    /*
        @const
        @type {string}
    */
    var kErrorPrefix = "defer:";


    // Internal variables for closure scope

    /* @type {Object} */
    var _deferences = {}; // hash for active _deferInstances.

    /* @type {number} */
    var _deferenceCounter = 100; // for generating non-conflicting _deferInstance IDs

    /* @type {boolean} */
    var _isReady = NO; // is the DOM in a ready/usable state?

    /* @type {boolean} */
    var _isIE = ( !!window.document.detachEvent );

    // CONSTANTS USED THROUGHOUT THE MODULE

    /* @const @type {string} */
    var kDOMContentLoaded = "DOMContentLoaded";

    /* @const @type {string} */
    var kReadyStateChange = "readystatechange";

    /* @const @type {string} */
    var kOnReadyStateChange = "on" + kReadyStateChange;

    /* @const @type {string} */
    var kComplete = "complete";

    /* @const @type {string} */
    var kLoad = "load";

    /* @const @type {string} */
    var kType = "type";

    /* @const @type {string} */
    var kReady = "ready";

    /* @const @type {string} */
    var kP = "p";

    /* @const @type {string} */
    var kPredicate = "predicate";

    /* @const @type {string} */
    var kH = "h";

    /* @const @type {string} */
    var kHandler = "handler";

    /* @const @type {string} */
    var kO = "o";

    /* @const @type {string} */
    var kOptions = "options";

    /*#pragma mark utility functions */

    /*
        Checks if an item is undefined or null.
        @param {*} item
        @return {boolean}
    */
    var isNil = function isNil( item ) {
        return item === undefined || item === null;
    };


    /*
        Determines if the given argument is a function.
        @param {*} func
        @return {boolean}
    */
    function isFunction( func ) {
        // instanceof Function ???
        return !isNil( func ) && ( func instanceof Object ) && ( isNil( func.__proto__ ) ? !isNil( func.call ) : !isNil( func.__proto__.call ) );
    };


    /*
        Logs a message to the console if debugging is enabled.
        @param {string} message
        @param {*=} obj opt_argument
    */
    function log( message , obj ) {

        if ( _debug === YES ) {

            var console = window.console;

            if ( !isNil( console ) && isFunction( console.log ) ) {

                if ( isNil( obj ) ) {
                    console.log( message );
                }
                else {
                    console.log( message , obj );
                };

                // if( _debug === YES && !isNil(console["trace"] ) ) console["trace"]();
            };
        };
    };


    /*
        Iterates over properties of an object.
        @param {*} context
        @param {Object} dictionary
        @param {*} handler
    */
    function forIn( context , dictionary , handler ) {

        for ( var key in dictionary ) {

            if ( Object.prototype.hasOwnProperty.call( dictionary , key ) === YES ) {
                handler.call( context , key , dictionary[ key ] );
            };
        };
    };


    /*
        Adds an event listener to an object.
        @param {*} obj
        @param {string} type
        @param {*} listener
        @param {boolean} capture
        @return {boolean}
    */
    function addEventListener( obj , type , listener , capture ) {

        var useCapture = !!capture;

        if ( !isNil( obj.addEventListener ) ) {
            // WebKit, Moz, etc.
            obj.addEventListener( type , listener , useCapture );
        }
        else if ( _isIE ) {
            useCapture = NO;
            obj.attachEvent( type , listener );
        };

        return useCapture;
    };


    /*
        Removes an event listener from an object.
        @param {*} obj
        @param {string} type
        @param {*} listener
        @param {boolean} capture
        @return {boolean}
    */
    function removeEventListener( obj , type , listener , capture ) {

        var useCapture = !!capture;

        if ( !isNil( obj.removeEventListener ) ) {
            // WebKit, Moz, etc.
            obj.addEventListener( type , listener , useCapture );
        }
        else if ( _isIE ) {
            useCapture = NO;
            obj.detachEvent( type , listener );
        };

        return useCapture;
    };


    /*
        Appends a script element to the document body.
        @param {string} src
        @param {string} async
    */
    function appendScript( src , async ) {

        var script = document.createElement( "script" );

        if ( !!script ) {

            script.type = "text/javascript";
            script.src = src;

            if ( !isNil( async ) && ( async === "async" || async === "defer" ) ) {
                script[ async ] = async;
            };

            document.body.appendChild( script );
        }
        else {
            log( "Unable to append script" );
        };
    };

    /*#pragma mark objects & methods */

    /*
        Defers execution of a handler based on a predicate.
        @param {Object|string} predicate
        @param {Object} handler
        @param {Object} options
        @return {number} The defer instance id
    */
    function defer( predicate , handler , options ) {

        /* @type {_deferInstance} */
        var newDefer = new _deferInstance( predicate , handler , options );

        if ( newDefer.completed === YES ) {
            // if we're already good, no need to defer
            return 0;
        }
        else { // nope, defer.
            _deferences[ newDefer.id ] = newDefer;
            return newDefer.id;
        };
    };


    /*
        Cancels a specific defer instance.
        @protected
        @param {number} deferID
        @return {boolean}
    */
    function cancelInstance( deferID ) {

        log( "defer.cancel" );

        var success = NO;

        var instance = _deferences[ deferID ];

        if ( !isNil( instance ) ) {
            instance.completed = YES;
            success = YES;
        };

        return success;
    };


    /*
        Destroys a defer instance by removing it from the tracking hash.
        @protected
        @param {number} id
    */
    function destroyInstance( id ) {
        window.setTimeout( function destroyInstanceImmediately() { _deferences[ id ] = null; delete _deferences[ id ]; } , 0 );
    };


    /*
        A simple function that always returns true.
        @protected
        @return {boolean}
    */
    function returnTrue() {
        return true;
    };


    /*
        Safely calls a function, catching and optionally rethrowing errors.
        @protected
        @param {Object} func
        @param {Object} context
        @param {boolean} shouldThrowError
        @param {string} errorText
    */
    function safeCall( func , context , shouldThrowError , errorText ) {

        var result = NO;

        if ( isNil( context ) ) context = window;

        try {
            result = func.call( context );
        }
        catch ( e ) {
            if ( _debug === YES ) {
                log( e );
            };

            if ( shouldThrowError === YES ) {
                // log( func.toString() , e );
                var err = new Error( errorText );
                err.originalError = e;
                // log( func.toString() , e , func );
                // throw err;
                throw e;
            };
        };

        return result;
    };


    /*
        Constructor for a _deferInstance, managing deferred execution.
        @constructor
        @protected
        @param {Object|string} thePredicate
        @param {Object} theHandler
        @param {Object} theOptions
    */
    function _deferInstance( thePredicate , theHandler , theOptions ) {

        if ( thePredicate === kReady ) {
            thePredicate = returnTrue;
        }
        else if ( !isFunction( thePredicate ) ) {
            throw new Error( kErrorPrefix + "01" );
        };

        if ( !isFunction( theHandler ) ) throw new Error( kErrorPrefix + "02" );

        var self = this,
            timeoutValue = null,
            selfOptions = theOptions || {};

        /* protected */
        self.id = _deferenceCounter++;
        /* protected */
        self.predicate = thePredicate;
        /* protected */
        self.handler = theHandler;

        // OPTIONS
        /* protected */
        selfOptions.interval = theOptions[ "interval" ] || 50; // ms
        if ( selfOptions.interval < 10 ) log( kErrorPrefix + "03" );
        // log( "interval: " + self.options.interval );
        /* protected */
        selfOptions.timeout = theOptions[ "timeout" ] || 15000; // ms
        // log( "timeout: " + self.options.timeout );

        self.options = selfOptions;


        /* protected */
        self.testDOMReady = isNil( theOptions[ "testDOMReady" ] ) ? YES : !!theOptions[ "testDOMReady" ]; // defaults to YES
        /* protected */
        self.timeoutID = null;
        /* protected */
        self.timeoutMS = null;
        /* protected */
        self.completed = NO;
        /* protected */
        self.readyBlocked = NO;

        var firstTest;

        if ( self.testDOMReady === YES && _isReady === YES ) { // check DOM state first
            firstTest = self.test();
        };

        if ( firstTest === YES ) { // no need to defer
            log( "firstTest, not deferred" );
            self.resultHandler( firstTest );
        }
        else {
            self.setTimeout();
        };
        delete firstTest;

    };

    /*
        Tests the instance's predicate function.
        @protected
        @return {boolean}
    */
    _deferInstance.prototype.test = function _deferInstance_test() {
        return safeCall( this.predicate , null , NO , "" );
    };


    /*
        Handles the result of the predicate test.
        @protected
        @param {boolean} result
    */
    _deferInstance.prototype.resultHandler = function _deferInstance_resultHandler( result ) {

        var self = this;

        if ( result === YES ) {
            // clear settimeout (if any)
            self.clearTimeout();

            // execute handler
            try {
                safeCall( self.handler , self.options[ "handlerContext" ] , YES , kErrorPrefix + "04:" + self.id );
            }
            catch ( e ) {
                // bubble up
                throw e;
            };

            self.completed = YES;

            // remove self from deferences
            destroyInstance( self.id );
        }
        else {
            // clear old timeout
            self.clearTimeout();
            // wind up again
            self.timeoutID = self.setTimeout();
        };
    };

    /*
        Sets a timeout for the next predicate test.
        @protected
    */
    _deferInstance.prototype.setTimeout = function _deferInstance_setTimeout() {

        var self = this,
            timeout = self.options[ "timeout" ];

        if ( timeout != undefined && !isNaN( timeout ) ) {
            // log( "hastimeout" );
            if ( self.timeoutMS === null ) {
                // set this on first run
                self.timeoutMS = ( +new Date() ) + timeout;
            };

            if ( self.timeoutMS > ( +new Date() ) ) {

                if ( self.completed === NO ) {
                    // do it again
                    self.timeoutID = window.setTimeout( function _deferInstance_setTimeout_impl_set() { self.resultHandler( self.test() ); } , self.options.interval );

                    log( "setTimeout" );
                }
                else {
                    // Instance completed, no need to set another timeout.
                    log( "setTimeout: instance already completed." );
                }
            }
            else {
                // Timeout reached, instance will not be deferred further.
                log( "setTimeout: timeout reached for instance " + self.id );
                self.completed = YES; // Mark as completed due to timeout
                destroyInstance( self.id ); // Clean up
            }
        }
        else {
            log( "setTimeout: invalid timeout value." );
            // If timeout is invalid, proceed as if it was completed or handle error
            self.completed = YES;
            destroyInstance( self.id );
        }
    };


    /*
        Clears the current timeout.
        @protected
    */
    _deferInstance.prototype.clearTimeout = function _deferInstance_clearTimeout() {

        if ( this.timeoutID !== null ) {
            window.clearTimeout( this.timeoutID );
            this.timeoutID = null;
            log( "clearTimeout" );
        };
    };


    /*
        Initializes deferQueue on the window object.
        If it already exists, merge with it.
    */
    window.deferQueue = deferQueue || ( window.deferQueue = {} );

    window.deferQueue.cancel = cancelInstance;
    window.deferQueue.version = kVersion;
    window.deferQueue.log = log;

    window.defer = defer; // Assign defer function to the global scope

    /*
        This function handles the DOM ready state.
        @private
    */
    function domReadyHandler() {

        if ( _isReady === YES ) return; // Already ready, exit

        _isReady = YES; // Set the ready flag

        log( "DOM Ready!" );

        // Iterate through all active defer instances
        forIn( null , _deferences , function( key , instance ) {
            if ( instance.testDOMReady === YES && instance.readyBlocked === NO ) {
                // If instance needs DOM ready and hasn't been blocked, test its predicate
                log( "domReadyHandler: testing instance " + instance.id );
                instance.resultHandler( instance.test() );
            };
        } );

        // Remove event listeners once DOM is ready
        if ( document.removeEventListener ) {
            document.removeEventListener( kDOMContentLoaded , domReadyHandler , NO );
            window.removeEventListener( kLoad , domReadyHandler , NO );
        }
        else if ( document.detachEvent ) {
            document.detachEvent( kOnReadyStateChange , domReadyHandler );
            window.detachEvent( kLoad , domReadyHandler );
        };
    };


    /*
        Robust DOM Ready implementation.
    */
    if ( document.addEventListener ) {
        // Use W3C standard event model
        document.addEventListener( kDOMContentLoaded , domReadyHandler , NO );
        window.addEventListener( kLoad , domReadyHandler , NO ); // Fallback for resources
    }
    else if ( document.attachEvent ) {
        // Use IE event model
        document.attachEvent( kOnReadyStateChange , domReadyHandler );
        window.attachEvent( kLoad , domReadyHandler ); // Fallback for resources

        if ( _robustIEReady === YES ) {
            // This is the trick for IE, borrowed from jQuery and others.
            // It polls `document.documentElement.doScroll("left")`
            // which throws an error until the DOM is ready.
            var doScrollCheck = function() {
                try {
                    document.documentElement.doScroll( "left" );
                }
                catch ( e ) {
                    window.setTimeout( doScrollCheck , 1 );
                    return;
                };

                // If no error, DOM is ready.
                domReadyHandler();
            };
            doScrollCheck();
        };
    };


} )( window , window.deferQueue || ( window.deferQueue = {} ) );