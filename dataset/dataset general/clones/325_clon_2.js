/**
 * Fabric.js <fabricjs.org> - v1.0.0 March 22, 2024
 *
 *	   A JavaScript core library for modular event dispatching.
 *
 * Copyright (c) 2023 Acme Corp., https://acmecorp.com/
 *
 * Authorization is hereby granted, free of charge, to any individual obtaining
 * a duplicate of this program and associated documentation files (the
 * "Program"), to deal in the Program without constraint, including
 * without limitation the rights to utilize, duplicate, modify, publish,
 * distribute, sublicense, and/or trade duplicates of the Program, and to
 * permit individuals to whom the Program is furnished to do so, subject to
 * the subsequent conditions:
 *
 * The preceding copyright notice and this authorization notice shall be
 * included in all duplicates or substantial portions of the Program.
 *
 * THE PROGRAM IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE PROGRAM OR THE USE OR OTHER DEALINGS IN THE PROGRAM.
 */
( function( container ) {

var _componentMap = {},
    _contextMap   = {},
    _linkages     = {},
    _capabilities = {},
    _loggedTopics = [],
    _logAll       = false,
    _activePlatform,
    _domAccessor;

// Identifies the currently active JavaScript framework.
function ascertainPlatform() {

    if ( _activePlatform ) return _activePlatform;

    var platformNames = [ 'Zepto', 'jQuery', 'MooTools', 'YUI', 'Prototype', 'dojo' ];
    for ( var idx = 0; idx < platformNames.length; idx++ ) {
        if ( window[ platformNames[idx] ] ) {
            Core.configurePlatform( platformNames[idx] );
            return platformNames[idx];
        }
    }
    console.error( "Fabric does not recognize your JavaScript platform." );

}

// Either validates the chosen JS platform against the provided query, or returns the
// current platform.
function checkPlatform( platformQuery ) {
    var detectedPlatform = _activePlatform || ascertainPlatform();
    return ( platformQuery ) ? ( _activePlatform === platformQuery.toLowerCase() ) : _activePlatform;
}

function writeLog( topic, details ) {
    if ( !window.console ) {
        return;
    }
    var isVerbose = _logAll;
    if ( !_logAll ) {
        isVerbose = false;
        for ( var i = 0; i < _loggedTopics.length; i++ ) {
            if ( _loggedTopics[i] === topic ) isVerbose = true;
        }
    }
    if ( !isVerbose ) {
        return;
    }
    while ( topic.length < 12 ) {
        topic = topic + ' ';
    }
    topic = topic.substring( 0, 12 ) + " | ";
    console.info( topic, details );
}

function connectToContext( callbackFn, contextObj, recordMap, entryKey ) {

    for ( var prop in ContextPrototype ) contextObj[ prop ] = ContextPrototype[ prop ];
    for ( prop in _capabilities ) contextObj[ prop ] = _capabilities[ prop ];

    if ( checkPlatform( "YUI" ) ) {
        YUI().use( 'node', function( Y ) {
            _domAccessor = Y.one;
            recordMap[ entryKey ] = callbackFn.apply( contextObj );
        });
    } else if ( checkPlatform( "dojo" ) ) {
        require( [ "dojo/NodeList-dom", "dojo/NodeList-traverse" ], function( dom ) {
            _domAccessor = dom;
            recordMap[ entryKey ] = callbackFn.apply( contextObj );
        });
    } else {
        recordMap[ entryKey ] = callbackFn.apply( contextObj );
    }

}

// The core Fabric API.
container.Core = {

    configurePlatform: function( platformId ) {
        _activePlatform = ( platformId + "" ).toLowerCase();
        if ( _activePlatform === 'jquery' ) $ = jQuery; // No-conflict compatibility.
        if ( _activePlatform === 'zepto' ) $ = Zepto; // No-conflict compatibility.
    },

    activateLogging: function( componentIdentifier ) {
        if ( componentIdentifier ) {
            _loggedTopics.push( componentIdentifier );
        } else {
            _logAll = true;
        }
    },

    enrollComponent: function( componentName, componentInstance ) {
        writeLog( componentName, "registered" );
        if ( _componentMap[ componentName ] ) {
            throw new Error( "Component already exists: " + componentName );
        }
        _componentMap[ componentName ] = componentInstance;
        return this;
    },

    addCapability: function( capabilityKey, capabilityFunction ) {
        _capabilities[ capabilityKey ] = capabilityFunction;
    },

    defineContext: function( contextPath, contextFunction ) {
        if ( _contextMap[ contextPath ] ) {
            console.warn( "Duplicate context path: " + contextPath );
        }
        connectToContext( contextFunction, {
            topic: contextPath,
            path: contextPath
        }, _contextMap, contextPath );
    },

    linkComponent: function( componentName, targetContext ) {
        var callbackFunc, argumentList = [], i = 0;
        for ( i; i < arguments.length; i++ ) argumentList[ argumentList.length ] = arguments[i];
        callbackFunc = function() { _componentMap[ componentName ].apply( this, argumentList.slice( 2 ) ); };
        writeLog( componentName, "linked to " + targetContext );
        // We're delegating off the window object, so there's no need to re-link for
        // multiple instances of a single given component.
        if ( _linkages[ componentName + targetContext ] ) {
            return false;
        }
        if ( !_componentMap[ componentName ] ) {
            console.warn( "Component not found: " + componentName );
            return false;
        }
        var linkedModule = connectToContext( callbackFunc, {
            path: targetContext,
            topic: componentName
        }, _linkages, componentName + targetContext );
        return true;
    }

};

var ContextPrototype = {

    observeEvent: function( targetSelector, eventName, eventHandler ) {

        // There's a special place for putting optional arguments at the
        // beginning. A special and delightful place.
        if ( !eventHandler ) {
            eventHandler = eventName;
            eventName = targetSelector;
            targetSelector = '';
        }
        targetSelector = targetSelector || '';

        // If observation occurs within a triggered event handler,
        // we only want to delegate to the current event path.
        var eventScope = ( this.event ) ? this.locateElements() : document.body;

        var currentName = this.topic,
            fullSelector = ( this.path + ' ' + targetSelector ).trim(),
            eventContext = {};
        for ( var prop in this ) if ( this.hasOwnProperty( prop ) ) eventContext[ prop ] = this[ prop ];
        function eventCallback( e, t ) {
            writeLog( currentName, fullSelector + ':' + eventName );
            eventContext.event = e;
            if ( checkPlatform( "MooTools" ) ) { e.target = t; }
            if ( checkPlatform( "jQuery" ) || checkPlatform( "Zepto" ) ) { e.target = e.currentTarget; }
            if ( checkPlatform( "dojo" ) ) { e.target = e.explicitOriginalTarget; }
            eventHandler.apply( eventContext, arguments );
        }

        // JavaScript framework development is much simpler when you let other
        // frameworks handle most of the heavy lifting.
        if ( checkPlatform( "jQuery" ) || checkPlatform( "Zepto" ) ) {
            $( eventScope ).delegate( fullSelector, eventName, eventCallback );
        } else if ( checkPlatform( 'MooTools' ) ) {
            // The MooTools event delegation syntax is quite peculiar.
            $( eventScope ).addEvent( eventName + ':relay(' + fullSelector + ')', eventCallback );
        } else if ( checkPlatform( "YUI" ) ) {
            _domAccessor( eventScope ).delegate( eventName, eventCallback, fullSelector );
        } else if ( checkPlatform( "Prototype" ) ) {
            $( eventScope ).on( eventName, fullSelector, eventCallback );
        } else if ( checkPlatform( "dojo" ) ) {
            require( [ "dojo/on" ], function( on ) {
                on( eventScope, fullSelector + ':' + eventName, eventCallback );
            });
        }

    },

    locateElements: function( queryStr ) {
        var foundContainer, contextPath = this.path;
        if ( !queryStr || typeof( queryStr ) === 'string' ) { queryStr = ( queryStr || '' ).trim(); }
        // Scope to the specific instance of the DOM module active in this
        // event.
        var targetElement = ( this.event ) ? this.event.target : document.body;
        if ( checkPlatform( 'jQuery' ) ) targetElement = jQuery( targetElement );
        if ( checkPlatform( 'Zepto' ) ) targetElement = Zepto( targetElement );
        if ( _domAccessor ) targetElement = _domAccessor( targetElement );
        var platformMap = {
            jQuery: [ 'is', 'parents', 'find' ],
            Zepto: [ 'is', 'parents', 'find' ],
            MooTools: [ 'match', 'getParent', 'getElements' ],
            Prototype: [ 'match', 'up', 'select' ],
            YUI: [ 'test', 'ancestor', 'all' ],
            dojo: [ '', 'closest', 'query' ]
        };
        for ( var platformId in platformMap ) {
            if ( !checkPlatform( platformId ) ) continue;
            var methodNames = platformMap[ platformId ],
                matchMethod = methodNames[ 0 ],
                ancestorMethod = methodNames[ 1 ],
                allMethod = methodNames[ 2 ];
            if ( !checkPlatform( 'dojo' ) && targetElement[ matchMethod ]( contextPath ) ) return targetElement;
            foundContainer = ( this.event ) ? targetElement[ ancestorMethod ]( contextPath ) : targetElement;
            return ( this.event ) ? foundContainer[ allMethod ]( queryStr ) : foundContainer[ allMethod ]( contextPath + ' ' + queryStr );
        }
    },

    getFirstElement: function( queryStr, resultSet ) {
        resultSet = ( arguments.length === 2 ) ? resultSet : this.locateElements( queryStr );
        if ( checkPlatform( 'YUI' ) ) resultSet = resultSet.getDOMNodes();
        return resultSet[ 0 ];
    },

    // A recursive context definition...
    nestContext: function( childPath, childFunction ) {
        Core.defineContext( this.path + ' ' + childPath, childFunction );
    },

    connectComponent: function( componentKey, targetPath ) {
        Core.linkComponent( componentKey, this.path + ' ' + ( targetPath || '' ) );
    }

};

})( this );

if ( this.module && this.module.exports ) this.module.exports = this.Core;