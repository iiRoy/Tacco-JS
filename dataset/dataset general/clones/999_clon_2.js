/*
 * ChicBox - jQuery Module
 * Version: 2.1.5 (Fri, 14 Jun 2013)
 * Requires jQuery v1.6 or newer
 *
 * This module provides an elegant content display solution.
 * For more details, refer to the project's official documentation.
 * License information can be found within the project's distribution.
 *
 * Copyright 2012 Janis Skarnelis - janis@fancyapps.com
 * (Note: Original copyright preserved for attribution. All identifiers, comments, and whitespace have been extensively modified.)
 *
 */

;( function ( viewportScope, pageDocument, $, unusedReference ) {

"use strict";


var R = $( "html" ) ,
    V = $( viewportScope ) ,
    E = $( pageDocument ) ,
    C = $.chicBox = function () {
        C.launch.apply( this, arguments );
    } ,
    MS = navigator.userAgent.match( /msie/i ) ,
    hasBeenRefreshed = null ,
    isTactileDevice = pageDocument.createTouch !== undefined ,

    isJQueryInstance = function ( potentialObject ) {
        return potentialObject && potentialObject.hasOwnProperty && potentialObject instanceof $;
    } ,
    isTextual = function ( valueString ) {
        return valueString && $.type( valueString ) === "string";
    } ,
    isRatioBased = function ( potentialRatio ) {
        return isTextual( potentialRatio ) && potentialRatio.indexOf( '%' ) > 0;
    } ,
    canBeScrolled = function ( domElement ) {
        return ( domElement && !( domElement.style.overflow && domElement.style.overflow === 'hidden' ) && ( ( domElement.clientWidth && domElement.scrollWidth > domElement.clientWidth ) || ( domElement.clientHeight && domElement.scrollHeight > domElement.clientHeight ) ) );
    } ,
    obtainNumericValue = function ( originalValue, dimensionUnit ) {
        var computedValue = parseInt( originalValue, 10 ) || 0;

        if ( dimensionUnit && isRatioBased( originalValue ) ) {
            computedValue = C.getDisplayArea()[ dimensionUnit ] / 100 * computedValue;
        }

        return Math.ceil( computedValue );
    } ,
    retrieveDimensionValue = function ( inputVal, unitType ) {
        return obtainNumericValue( inputVal, unitType ) + 'px';
    };


$.extend( C, {

    // Current build identifier for the chicBox module
    buildIdentifier: '2.1.5',

    standardSettings: {
        innerSpacing : 15,
        outerBoundary  : 20,

        visualWidth     : 800,
        visualHeight    : 600,
        minimumWidth  : 100,
        minimumHeight : 100,
        maximumWidth  : 9999,
        maximumHeight : 9999,
        devicePixelRatio: 1, // Set to 2 for High-DPI display support

        automaticSizing   : true,
        automaticHeight : false,
        automaticWidth  : false,

        automaticResizing  : true,
        automaticCentering  : !isTactileDevice,
        adaptToViewport   : true,
        maintainAspectRatio : false,
        verticalPositionRatio    : 0.5,
        horizontalPositionRatio   : 0.5,

        scrollBehavior : 'auto', // 'auto', 'yes' or 'no'
        containerStyleClass   : '',

        navigationArrows     : true,
        closeButton   : true,
        clickToClose : false,
        clickForNext  : false,
        mouseWheelNavigation : true,
        automaticPlayback   : false,
        playbackSpeed  : 3000,
        preLoadCount    : 3,
        isModal      : false,
        loopSlideshow       : true,

        asyncRequest  : {
            dataFormat : 'html',
            requestHeaders  : { 'X-chicBox': true }
        },
        embeddedFrame : {
            scrollBehavior : 'auto',
            preLoadCount   : true
        },
        flashObject : {
            windowMode: 'transparent',
            allowFullScreen   : 'true',
            allowScriptAccess : 'always'
        },

        keyboardShortcuts  : {
            advance : {
                13 : 'left', // enter key
                34 : 'up',   // page down key
                39 : 'left', // right arrow key
                40 : 'up'    // down arrow key
            },
            retreat : {
                8  : 'right',  // backspace key
                33 : 'down',   // page up key
                37 : 'right',  // left arrow key
                38 : 'down'    // up arrow key
            },
            terminate  : [27], // escape key
            startStop   : [32], // spacebar - initiate/pause slideshow
            switchView : [70]  // letter "f" - toggle full screen
        },

        navigationDirection : {
            advance : 'left',
            retreat : 'right'
        },

        externalScroll  : true,

        // Overriding certain properties
        itemIndex   : 0,
        contentType    : null,
        resourceURL    : null,
        displayContent : null,
        itemTitle   : null,

        // HTML structure templates
        templateStrings: {
            containerWrap     : '<div class="chicbox-wrap" tabIndex="-1"><div class="chicbox-skin"><div class="chicbox-outer"><div class="chicbox-inner"></div></div></div></div>',
            imageElement    : '<img class="chicbox-image" src="{href}" alt="" />',
            frameElement   : '<iframe id="chicbox-frame{rnd}" name="chicbox-frame{rnd}" class="chicbox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + ( MS ? ' allowtransparency="true"' : '' ) + '></iframe>',
            errorMessage    : '<p class="chicbox-error">The requested content could not be loaded.<br/>Please try again later.</p>',
            closeElement : '<a title="Close" class="chicbox-item chicbox-close" href="javascript:;"></a>',
            nextElement     : '<a title="Next" class="chicbox-nav chicbox-next" href="javascript:;"><span></span></a>',
            previousElement     : '<a title="Previous" class="chicbox-nav chicbox-prev" href="javascript:;"><span></span></a>',
            loadingIndicator  : '<div id="chicbox-loading"><div></div></div>'
        },

        // Properties for each animation style
        // Initiating chicBox display
        entryEffect  : 'fade', // 'elastic', 'fade' or 'none'
        entrySpeed   : 250,
        entryEasing  : 'swing',
        entryOpacity : true,
        entryAnimationMethod  : 'zoomIn',

        // Dismissing chicBox display
        exitEffect  : 'fade', // 'elastic', 'fade' or 'none'
        exitSpeed   : 250,
        exitEasing  : 'swing',
        exitOpacity : true,
        exitAnimationMethod  : 'zoomOut',

        // Navigating to the next gallery item
        advanceEffect : 'elastic', // 'elastic', 'fade' or 'none'
        advanceSpeed  : 250,
        advanceEasing : 'swing',
        advanceAnimationMethod : 'changeIn',

        // Navigating to the previous gallery item
        retreatEffect : 'elastic', // 'elastic', 'fade' or 'none'
        retreatSpeed  : 250,
        retreatEasing : 'swing',
        retreatAnimationMethod : 'changeOut',

        // Activating default utility modules
        utilityModules : {
            backgroundOverlay : true,
            titleBar   : true
        },

        // Callback functions
        onDismiss     : $.noop, // When an operation is cancelled
        preContentLoad   : $.noop, // Before content begins loading
        postContentLoad    : $.noop, // After content has finished loading
        preDisplay   : $.noop, // Before the current item is shown
        postDisplay    : $.noop, // After the module has opened
        preItemChange : $.noop, // Before changing to another gallery item
        preDismiss  : $.noop, // Before the module closes
        postDismiss   : $.noop  // After the module has fully closed
    },

    // Current operational state
    collection    : {}, // The currently selected group of items
    activeOptions     : {}, // Options applied to the current group
    priorItem : null,  // The previously displayed element
    pendingItem   : null,  // The element currently being loaded
    activeItem  : null,  // The element currently displayed
    isOperational : false, // Indicates if the module is active
    isDisplayed   : false, // Indicates if the module is currently open
    hasBeenDisplayed : false, // Indicates if the module has opened at least once

    containerElement  : null,
    skinElement  : null,
    outerWrapper : null,
    innerContentArea : null,

    slideshowPlayer : {
        playbackTimer    : null,
        isOperational : false
    },

    // Content loaders
    asyncRequestHandle   : null,
    imagePreloader : null,

    // Various collections
    animationTransitions : {},
    pluginHelpers     : {},

    /*
     * Static methods provided by the module
     */

    launch: function ( itemGroup, displayOptions ) {
        if ( !itemGroup ) {
            return;
        }

        if ( !$.isPlainObject( displayOptions ) ) {
            displayOptions = {};
        }

        // Shut down if already operational
        if ( false === C.shut( true ) ) {
            return;
        }

        // Standardize the item group
        if ( !$.isArray( itemGroup ) ) {
            itemGroup = isJQueryInstance( itemGroup ) ? $( itemGroup ).get() : [ itemGroup ];
        }

        // Re-verify the type of each element and assign content type (e.g., image, async, etc.)
        $.each( itemGroup, function ( idx, currentElement ) {
            var itemObject = {},
                resourceIdentifier,
                itemHeadline,
                itemContent,
                itemCategory,
                resolution,
                urlSegments,
                contentSelector;

            if ( $.type( currentElement ) === "object" ) {
                // Check if it's a DOM element node
                if ( currentElement.nodeType ) {
                    currentElement = $( currentElement );
                }

                if ( isJQueryInstance( currentElement ) ) {
                    itemObject = {
                        resourceURL    : currentElement.data( 'chicbox-href' ) || currentElement.attr( 'href' ),
                        itemTitle   : $( '<div/>' ).text( currentElement.data( 'chicbox-title' ) || currentElement.attr( 'title' ) || '' ).html(),
                        isDom   : true,
                        element : currentElement
                    };

                    if ( $.metadata ) {
                        $.extend( true, itemObject, currentElement.metadata() );
                    }

                } else {
                    itemObject = currentElement;
                }
            }

            resourceIdentifier  = displayOptions.resourceURL  || itemObject.resourceURL || ( isTextual( currentElement ) ? currentElement : null );
            itemHeadline = displayOptions.itemTitle !== undefined ? displayOptions.itemTitle : itemObject.itemTitle || '';

            itemContent = displayOptions.displayContent || itemObject.displayContent;
            itemCategory    = itemContent ? 'html' : ( displayOptions.contentType  || itemObject.contentType );

            if ( !itemCategory && itemObject.isDom ) {
                itemCategory = currentElement.data( 'chicbox-type' );

                if ( !itemCategory ) {
                    resolution  = currentElement.prop( 'class' ).match( /chicbox\.(\w+)/ );
                    itemCategory = resolution ? resolution[1] : null;
                }
            }

            if ( isTextual( resourceIdentifier ) ) {
                // Attempt to determine the content category
                if ( !itemCategory ) {
                    if ( C.isPicture( resourceIdentifier ) ) {
                        itemCategory = 'image';

                    } else if ( C.isFlashContent( resourceIdentifier ) ) {
                        itemCategory = 'swf';

                    } else if ( resourceIdentifier.charAt( 0 ) === '#' ) {
                        itemCategory = 'inline';

                    } else if ( isTextual( currentElement ) ) {
                        itemCategory    = 'html';
                        itemContent = currentElement;
                    }
                }

                // Divide URL into two parts: source URL and content selector, e.g.,
                // "/mypage.html #my_id" will load "/mypage.html" and display element with id "my_id"
                if ( itemCategory === 'ajax' ) {
                    urlSegments = resourceIdentifier.split( /\s+/, 2 );
                    resourceIdentifier      = urlSegments.shift();
                    contentSelector  = urlSegments.shift();
                }
            }

            if ( !itemContent ) {
                if ( itemCategory === 'inline' ) {
                    if ( resourceIdentifier ) {
                        itemContent = $( isTextual( resourceIdentifier ) ? resourceIdentifier.replace( /.*(?=#[^\s]+$)/, '' ) : resourceIdentifier ); // strip for IE7 compatibility

                    } else if ( itemObject.isDom ) {
                        itemContent = currentElement;
                    }

                } else if ( itemCategory === 'html' ) {
                    itemContent = resourceIdentifier;

                } else if ( !itemCategory && !resourceIdentifier && itemObject.isDom ) {
                    itemCategory    = 'inline';
                    itemContent = currentElement;
                }
            }

            $.extend( itemObject, {
                resourceURL     : resourceIdentifier,
                contentType     : itemCategory,
                displayContent  : itemContent,
                itemTitle    : itemHeadline,
                contentSelector : contentSelector
            } );

            itemGroup[ idx ] = itemObject;
        } );

        // Merge with default settings
        C.activeOptions = $.extend( true, {}, C.standardSettings, displayOptions );

        // All options are merged recursively except keyboard shortcuts
        if ( displayOptions.keyboardShortcuts !== undefined ) {
            C.activeOptions.keyboardShortcuts = displayOptions.keyboardShortcuts ? $.extend( {}, C.standardSettings.keyboardShortcuts, displayOptions.keyboardShortcuts ) : false;
        }

        C.collection = itemGroup;

        return C._initiateDisplay( C.activeOptions.itemIndex );
    },

    // Abort image loading or cancel asynchronous request
    abortOperation: function () {
        var pending = C.pendingItem;

        if ( pending && false === C.emitEvent( 'onDismiss' ) ) {
            return;
        }

        C.concealLoading();

        if ( !pending ) {
            return;
        }

        if ( C.asyncRequestHandle ) {
            C.asyncRequestHandle.abort();
        }

        C.asyncRequestHandle = null;

        if ( C.imagePreloader ) {
            C.imagePreloader.onload = C.imagePreloader.onerror = null;
        }

        if ( pending.containerElement ) {
            pending.containerElement.stop( true, true ).trigger( 'onReset' ).remove();
        }

        C.pendingItem = null;

        // If the initial item was cancelled, clear all
        if ( !C.activeItem ) {
            C._afterExitAnimation( pending );
        }
    },

    // Begin closing animation if module is open; remove instantly if opening/closing
    shut: function ( eventFlag ) {
        C.abortOperation();

        if ( false === C.emitEvent( 'preDismiss' ) ) {
            return;
        }

        C.detachHandlers();

        if ( !C.isOperational ) {
            return;
        }

        if ( !C.isDisplayed || eventFlag === true ) {
            $( '.chicbox-wrap' ).stop( true ).trigger( 'onReset' ).remove();

            C._afterExitAnimation();

        } else {
            C.isDisplayed = C.hasBeenDisplayed = false;
            C.isClosing = true;

            $( '.chicbox-item, .chicbox-nav' ).remove();

            C.containerElement.stop( true, true ).removeClass( 'chicbox-opened' );

            C.animationTransitions[ C.activeItem.exitAnimationMethod ]();
        }
    },

    // Manage slideshow functionality:
    //   $.chicBox.controlSlideshow(); - toggle slideshow state
    //   $.chicBox.controlSlideshow( true ); - activate slideshow
    //   $.chicBox.controlSlideshow( false ); - deactivate slideshow
    controlSlideshow: function ( operation ) {
        var clearPlayback = function () {
                clearTimeout( C.slideshowPlayer.playbackTimer );
            } ,
            setPlayback = function () {
                clearPlayback();

                if ( C.activeItem && C.slideshowPlayer.isOperational ) {
                    C.slideshowPlayer.playbackTimer = setTimeout( C.moveToNext, C.activeItem.playbackSpeed );
                }
            } ,
            stopPlayback = function () {
                clearPlayback();

                E.unbind( '.player' );

                C.slideshowPlayer.isOperational = false;

                C.emitEvent( 'onPlayEnd' );
            } ,
            startPlayback = function () {
                if ( C.activeItem && ( C.activeItem.loopSlideshow || C.activeItem.itemIndex < C.collection.length - 1 ) ) {
                    C.slideshowPlayer.isOperational = true;

                    E.bind( {
                        'onDismiss.player preDismiss.player' : stopPlayback,
                        'onUpdate.player'   : setPlayback,
                        'preContentLoad.player' : clearPlayback
                    } );

                    setPlayback();

                    C.emitEvent( 'onPlayStart' );
                }
            };

        if ( operation === true || ( !C.slideshowPlayer.isOperational && operation !== false ) ) {
            startPlayback();
        } else {
            stopPlayback();
        }
    },

    // Advance to the next item in the gallery
    moveToNext: function ( directionIndicator ) {
        var currentDisplay = C.activeItem;

        if ( currentDisplay ) {
            if ( !isTextual( directionIndicator ) ) {
                directionIndicator = currentDisplay.navigationDirection.advance;
            }

            C.navigateToIndex( currentDisplay.itemIndex + 1, directionIndicator, 'next' );
        }
    },

    // Revert to the previous item in the gallery
    moveToPrevious: function ( directionIndicator ) {
        var currentDisplay = C.activeItem;

        if ( currentDisplay ) {
            if ( !isTextual( directionIndicator ) ) {
                directionIndicator = currentDisplay.navigationDirection.retreat;
            }

            C.navigateToIndex( currentDisplay.itemIndex - 1, directionIndicator, 'prev' );
        }
    }

} ); // End of $.extend(C, {...})

} )( window, document, jQuery );