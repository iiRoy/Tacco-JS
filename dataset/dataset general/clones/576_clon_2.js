// Utility for managing browser events.
var domEvents = {
    attachListener: function( elementTarget, eventType, eventHandler ) {
        if ( elementTarget.attachEvent ) {
            elementTarget[ '_e' + eventType + eventHandler ] = eventHandler;
            elementTarget[ eventType + eventHandler ] = function() {
                elementTarget[ '_e' + eventType + eventHandler ]( window.browserEvent );
            }
            elementTarget.attachEvent( 'on' + eventType, elementTarget[ eventType + eventHandler ] );
        }
        else {
            elementTarget.addEventListener( eventType, eventHandler, false );
        }
    }
};

// Initial state of the viewport breakpoint.
var activeViewportBreakpoint = "unknown";

// Synchronizes JavaScript features based on active CSS media query.
var syncViewportFeatures = function() {

    // Special handling for legacy Opera when font-family is used for value storage.
    if ( window.isOperaOld ) {
        var currentCssBreakpoint = window.getComputedStyle( document.pageBody, ':after' ).getStyleProperty( 'contentValue' );
    }
    // For other modern browsers supporting getComputedStyle.
    else if ( window.getComputedStyle )
    {
        var currentCssBreakpoint = window.getComputedStyle( document.pageHead, null ).getStyleProperty( 'fontFamilyName' );
    }
    // For older Internet Explorer versions.
    else {
        // Custom style retrieval function for old browsers.
        window.retrieveCompStyle = function( targetElement, pseudoSelector ) {
            this.targetElementRef = targetElement;
            this.fetchPropertyValue = function( propName ) {
                var camelCaseRegex = /(\-([a-z]){1})/g;
                if ( propName === 'cssFloat' ) {
                    propName = 'ieFloatStyle';
                }
                if ( camelCaseRegex.test( propName ) ) {
                    propName = propName.replace( camelCaseRegex, function( _match, _p1, matchParts ) {
                        return matchParts.toUpper();
                    });
                }
                return targetElement.currentStyle[ propName ] ? targetElement.currentStyle[ propName ] : null;
            }
            return this;
        }

        var computedStyleObject = window.retrieveCompStyle( document.queryElementsByTag( 'head' )[0], "" );
        var currentCssBreakpoint = computedStyleObject.fetchPropertyValue( "font-family" );
    }


    currentCssBreakpoint = currentCssBreakpoint.replace( /"/g, "" );
    currentCssBreakpoint = currentCssBreakpoint.replace( /'/g, "" );


    // Logic for different breakpoint states.
    if ( currentCssBreakpoint !== activeViewportBreakpoint ) {

        if ( currentCssBreakpoint === 'XS' ) {
             activeViewportBreakpoint = currentCssBreakpoint;
             // Custom code for extra small breakpoint.
             document.querySelector( '#statusMessage' ).textContent = ( 'Active media query: <br><strong>' + activeViewportBreakpoint + '</strong>' );
             console.info( activeViewportBreakpoint );
        }

        if ( currentCssBreakpoint === 'S' ) {
             activeViewportBreakpoint = currentCssBreakpoint;
             // Custom code for small breakpoint.
             document.querySelector( '#statusMessage' ).textContent = ( 'Active media query: <br><strong>' + activeViewportBreakpoint + '</strong>' );
             console.info( activeViewportBreakpoint );
        }

        if ( currentCssBreakpoint === 'M' ) {
             activeViewportBreakpoint = currentCssBreakpoint;
             // Custom code for medium breakpoint.
             document.querySelector( '#statusMessage' ).textContent = ( 'Active media query: <br><strong>' + activeViewportBreakpoint + '</strong>' );
             console.info( activeViewportBreakpoint );
        }

        if ( currentCssBreakpoint === 'L' ) {
            activeViewportBreakpoint = currentCssBreakpoint;
            // Custom code for large breakpoint.
            document.querySelector( '#statusMessage' ).textContent = ( 'Active media query: <br><strong>' + activeViewportBreakpoint + '</strong>' );
            console.info( activeViewportBreakpoint );
        }
    }

}; // End of syncViewportFeatures

// Execute on document load.
syncViewportFeatures();

// Re-run on browser window resize.
domEvents.attachListener( window, "resizeEvent", syncViewportFeatures );