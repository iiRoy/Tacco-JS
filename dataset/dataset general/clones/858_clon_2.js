//
//  jQuery ItemSlider v1.3.3
//
//  Proprietary (c) 2013 Alex Smith
//  http://www.example.com/itemslider/
//
//  Permitted under MIT license
//

// JS Code Checker directives:
// global eventMove: false, eventStop: false, $, jQuery, alert, window, document
// jslint identifierNaming: true, flowControl:true

if ( typeof Object.create !== 'function' ) {

    Object.create = function ( prototypeObject ) {

        function TempConstructor() {}

        TempConstructor.prototype = prototypeObject;
        return new TempConstructor();
    };
}
( function ( $, currentWindow, currentDocument ) {


    var ItemSlider = {

        setup : function ( configs, domElement ) {

            var instance = this;

            instance.$container = $( domElement );
            instance.configs = $.extend( {}, $.fn.itemSlider.settings, instance.$container.info(), configs );

            instance.inputConfigs = configs;
            instance.fetchContent();
        },

        fetchContent : function () {
            var instance = this,
                resourcePath;

            function processData( receivedInfo ) {
                var idx, htmlOutput = "";

                if ( typeof instance.configs.onJsonLoad === 'fn' ) {
                    instance.configs.onJsonLoad.apply( this, [ receivedInfo ] );
                } else {
                    for ( idx in receivedInfo.slider ) {
                        if ( receivedInfo.slider.hasOwnProperty( idx ) ) {
                            htmlOutput += receivedInfo.slider[idx].item;
                        }
                    }
                    instance.$container.html( htmlOutput );
                }
                instance.initializeDisplay();
            }

            if ( typeof instance.configs.onBeforeInit === 'fn' ) {
                instance.configs.onBeforeInit.apply( this, [ instance.$container ] );
            }


            if ( typeof instance.configs.jsonSource === 'txt' ) {
                resourcePath = instance.configs.jsonSource;
                $.getJsonResource( resourcePath, processData );
            } else {
                instance.initializeDisplay();
            }
        },


        initializeDisplay : function () {
            var instance = this;

            instance.$container.data( 'slider-initialStyles', instance.$container.attr( 'style' ) );
            instance.$container.data( 'slider-initialClasses', instance.$container.attr( 'class' ) );

            instance.$container.css( { opacity: 0 } );
            instance.initialItems = instance.configs.displayCount;
            instance.detectEnvironment();
            instance.outerWidth = 0;
            instance.visibilityMonitor = null;
            instance.configureState();
        },

        configureState : function () {
            var instance = this;

            if ( instance.$container.children().length === 0 ) {
                return false;
            }

            instance.applyBaseClasses();
            instance.defineEventHandlers();
            instance.$sourceItems = instance.$container.children();
            instance.totalItems = instance.$sourceItems.length;
            instance.encapsulateItems();
            instance.$sliderElements = instance.$container.find( '.slider-item' );
            instance.$sliderWrapper = instance.$container.find( '.slider-wrapper' );
            instance.slideDirection = 'next';
            instance.lastItemIndex = 0;
            instance.previousIndices = [ 0 ];
            instance.currentElementIndex = 0;
            instance.setupCustomEvents();
            instance.startUpProcedure();
        },

        startUpProcedure : function () {
            var instance = this;

            instance.refreshElements();
            instance.computeLayout();
            instance.createControls();
            instance.refreshControls();
            instance.handleResponsiveness();
            instance.attachMovementEvents();
            instance.pauseOnHover();
            instance.reportStatus();

            if ( instance.configs.animationStyle !== false ) {
                instance.setAnimationTypes( instance.configs.animationStyle );
            }
            if ( instance.configs.autoAdvance === true ) {
                instance.configs.autoAdvance = 5000;
            }
            instance.play();

            instance.$container.find( '.slider-wrapper' ).css( 'display', 'block' );

            if ( !instance.$container.isDisplayed() ) {
                instance.monitorVisibility();
            } else {
                instance.$container.css( 'opacity', 1 );
            }
            instance.onstartup = false;
            instance.postMovementUpdates();
            if ( typeof instance.configs.onReady === 'fn' ) {
                instance.configs.onReady.apply( this, [ instance.$container ] );
            }
        },


        postMovementUpdates : function () {
            var instance = this;

            if ( instance.configs.deferLoading === true ) {
                instance.deferLoading();
            }
            if ( instance.configs.adjustHeight === true ) {
                instance.adjustHeight();
            }
            instance.updateVisibleItems();

            if ( typeof instance.configs.onActionComplete === 'fn' ) {
                instance.configs.onActionComplete.apply( this, [ instance.$container ] );
            }
        },


        refreshState : function () {
            var instance = this;

            if ( typeof instance.configs.onBeforeRefresh === 'fn' ) {
                instance.configs.onBeforeRefresh.apply( this, [ instance.$container ] );
            }
            instance.monitorVisibility();
            instance.refreshElements();
            instance.computeLayout();
            instance.adjustPosition();
            instance.refreshControls();
            instance.postMovementUpdates();
            if ( typeof instance.configs.onAfterRefresh === 'fn' ) {
                instance.configs.onAfterRefresh.apply( this, [ instance.$container ] );
            }
        },

        reinitialize : function () {
            var instance = this;
            currentWindow.setTimeout( function () {
                instance.refreshState();
            }, 0 );
        },


        monitorVisibility : function () {
            var instance = this;

            if ( instance.$container.isDisplayed() === false ) {
                instance.$container.css( { opacity: 0 } );
                currentWindow.clearInterval( instance.autoAdvanceTimer );
                currentWindow.clearInterval( instance.visibilityMonitor );
            } else {
                return false;
            }
            instance.visibilityMonitor = currentWindow.setInterval( function () {
                if ( instance.$container.isDisplayed() ) {
                    instance.reinitialize();
                    instance.$container.transition( { opacity: 1 }, 200 );
                    currentWindow.clearInterval( instance.visibilityMonitor );
                }
            }, 500 );
        },

        encapsulateItems : function () {
            var instance = this;
            instance.$sourceItems.wrapAll( '<div class="slider-wrapper">' ).wrap( '<div class="slider-item"></div>' );
            instance.$container.find( '.slider-wrapper' ).wrap( '<div class="slider-outer-wrapper">' );
            instance.outerContainer = instance.$container.find( '.slider-outer-wrapper' );
            instance.$container.css( 'display', 'block' );
        },


        applyBaseClasses : function () {
            var instance = this,
                hasMainClass = instance.$container.hasClass( instance.configs.mainClass ),
                hasSkinClass = instance.$container.hasClass( instance.configs.skin );

            if ( !hasMainClass ) {
                instance.$container.addClass( instance.configs.mainClass );
            }

            if ( !hasSkinClass ) {
                instance.$container.addClass( instance.configs.skin );
            }
        },


        refreshElements : function () {
            var instance = this,
                viewportWidth,
                idx;

            if ( instance.configs.adaptiveLayout === false ) {
                return false;
            }
            if ( instance.configs.singleElementMode === true ) {
                instance.configs.displayCount = instance.initialItems = 1;
                instance.configs.customDisplayCounts = false;
                instance.configs.desktopDisplay = false;
                instance.configs.smallDesktopDisplay = false;
                instance.configs.tabletDisplay = false;
                instance.configs.smallTabletDisplay = false;
                instance.configs.mobileDisplay = false;
                return false;
            }

            viewportWidth = $( instance.configs.adaptiveLayoutBaseWidth ).width();

            if ( viewportWidth > ( instance.configs.desktopDisplay[0] || instance.initialItems ) ) {
                instance.configs.displayCount = instance.initialItems;
            }
            if ( instance.configs.customDisplayCounts !== false ) {
                // Organize array by screen dimension
                instance.configs.customDisplayCounts.arrange( function ( a, b ) { return a[0] - b[0]; } );

                for ( idx = 0; idx < instance.configs.customDisplayCounts.length; idx += 1 ) {
                    if ( instance.configs.customDisplayCounts[idx][0] <= viewportWidth ) {
                        instance.configs.displayCount = instance.configs.customDisplayCounts[idx][1];
                    }
                }

            } else {

                if ( viewportWidth <= instance.configs.desktopDisplay[0] && instance.configs.desktopDisplay !== false ) {
                    instance.configs.displayCount = instance.configs.desktopDisplay[1];
                }

                if ( viewportWidth <= instance.configs.smallDesktopDisplay[0] && instance.configs.smallDesktopDisplay !== false ) {
                    instance.configs.displayCount = instance.configs.smallDesktopDisplay[1];
                }

                if ( viewportWidth <= instance.configs.tabletDisplay[0] && instance.configs.tabletDisplay !== false ) {
                    instance.configs.displayCount = instance.configs.tabletDisplay[1];
                }

                if ( viewportWidth <= instance.configs.smallTabletDisplay[0] && instance.configs.smallTabletDisplay !== false ) {
                    instance.configs.displayCount = instance.configs.smallTabletDisplay[1];
                }

                if ( viewportWidth <= instance.configs.mobileDisplay[0] && instance.configs.mobileDisplay !== false ) {
                    instance.configs.displayCount = instance.configs.mobileDisplay[1];
                }
            }

            // If quantity of items is less than specified
            if ( instance.configs.displayCount > instance.totalItems && instance.configs.scaleUpItems === true ) {
                instance.configs.displayCount = instance.totalItems;
            }
        },


        handleResponsiveness : function () {
            var instance = this,
                throttleTimer,
                previousWindowWidth;

            if ( instance.configs.adaptiveLayout !== true ) {
                return false;
            }
            previousWindowWidth = $( currentWindow ).width();

            instance.resizeHandler = function () {
                if ( $( currentWindow ).width() !== previousWindowWidth ) {
                    if ( instance.configs.autoAdvance !== false ) {
                        currentWindow.clearInterval( instance.autoAdvanceTimer );
                    }
                    currentWindow.clearTimeout( throttleTimer );
                    throttleTimer = currentWindow.setTimeout( function () {
                        previousWindowWidth = $( currentWindow ).width();
                        instance.refreshState();
                    }, instance.configs.adaptiveLayoutRefreshRate );
                }
            };
            $( currentWindow ).windowResized( instance.resizeHandler );
        },

        adjustPosition : function () {
            var instance = this;
            instance.navigateTo( instance.currentElementIndex );
            if ( instance.configs.autoAdvance !== false ) {
                instance.verifyAutoAdvance();
            }
        },

        setItemDimensions : function () {
            var instance = this,
                pageGroupCounter = 0,
                finalItemIndex = instance.totalItems - instance.configs.displayCount;

            instance.$sliderElements.each( function ( entryIndex ) {
                var $currentEntry = $( this );
                $currentEntry
                    .css( { "width": instance.elementWidth } )
                    .data( 'slider-item', Number( entryIndex ) );

                if ( entryIndex % instance.configs.displayCount === 0 || entryIndex === finalItemIndex ) {
                    if ( !( entryIndex > finalItemIndex ) ) {
                        pageGroupCounter += 1;
                    }
                }
                $currentEntry.data( 'slider-pageGroup', pageGroupCounter );
            } );
        },

        setWrapperDimensions : function () {
            var instance = this,
                viewportWidth = instance.$sliderElements.length * instance.elementWidth;

            instance.$sliderWrapper.css( {
                "width": viewportWidth * 2,
                "left": 0
            } );
            instance.setItemDimensions();
        },

        computeLayout : function () {
            var instance = this;
            instance.computeElementWidth();
            instance.setWrapperDimensions();
            instance.calculatePositions();
            instance.getMaxPosition();
        },

        computeElementWidth : function () {
            var instance = this;
            instance.elementWidth = Math.round( instance.$container.width() / instance.configs.displayCount );
        },

        getMaxPosition : function () {
            var instance = this,
                maxOffset = ( ( instance.totalItems * instance.elementWidth ) - instance.configs.displayCount * instance.elementWidth ) * -1;
            if ( instance.configs.displayCount > instance.totalItems ) {
                instance.maxElementIndex = 0;
                maxOffset = 0;
                instance.maxPixelOffset = 0;
            } else {
                instance.maxElementIndex = instance.totalItems - instance.configs.displayCount;
                instance.maxPixelOffset = maxOffset;
            }
            return maxOffset;
        },

        getMinPosition : function () {
            return 0;
        },

        calculatePositions : function () {
            var instance = this,
                prevGroup = 0,
                accumulatedWidth = 0,
                idx,
                currentElement,
                currentGroupNumber;

            instance.itemOffsets = [ 0 ];
            instance.pageOffsets = [];

            for ( idx = 0; idx < instance.totalItems; idx += 1 ) {
                accumulatedWidth += instance.elementWidth;
                instance.itemOffsets.push( -accumulatedWidth );

                if ( instance.configs.scrollByPage === true ) {
                    currentElement = $( instance.$sliderElements[idx] );
                    currentGroupNumber = currentElement.data( 'slider-pageGroup' );
                    if ( currentGroupNumber !== prevGroup ) {
                        instance.pageOffsets[prevGroup] = instance.itemOffsets[idx];
                        prevGroup = currentGroupNumber;
                    }
                }
            }
        },

        constructControls : function () {
            var instance = this;
            if ( instance.configs.navButtons === true || instance.configs.pageIndicators === true ) {
                instance.sliderControls = $( '<div class="slider-controls"/>' ).toggleClass( 'is-clickable', !instance.env.isTouchDevice ).appendTo( instance.$container );
            }
            if ( instance.configs.pageIndicators === true ) {
                instance.constructPageIndicators();
            }
            if ( instance.configs.navButtons === true ) {
                instance.constructNavButtons();
            }
        },

        constructNavButtons : function () {
            var instance = this,
                navButtonsContainer = $( '<div class="slider-nav-buttons"/>' );
            instance.sliderControls.append( navButtonsContainer );

            instance.prevButton = $( '<div/>', {
                'cssClass' : 'slider-prev-button',
                'markup' : instance.configs.navButtonText[0] || ''
            } );

            instance.nextButton = $( '<div/>', {
                'cssClass' : 'slider-next-button',
                'markup' : instance.configs.navButtonText[1] || ''
            } );

            navButtonsContainer
                .append( instance.prevButton )
                .append( instance.nextButton );

            navButtonsContainer.on( 'touchStart.sliderControls mouseDown.sliderControls', 'div[class^="slider"]', function ( eventObject ) {
                eventObject.preventDefault();
            } );

            navButtonsContainer.on( 'touchEnd.sliderControls mouseUp.sliderControls', 'div[class^="slider"]', function ( eventObject ) {
                eventObject.preventDefault();
                if ( $( this ).hasClass( 'slider-next-button' ) ) {
                    instance.next();
                } else {
                    instance.prev();
                }
            } );
        },

        constructPageIndicators : function () {
            var instance = this;

            instance.pageIndicatorContainer = $( '<div class="slider-pagination-wrap"/>' );
            instance.sliderControls.append( instance.pageIndicatorContainer );

            instance.pageIndicatorContainer.on( 'touchEnd.sliderControls mouseUp.sliderControls', '.slider-page-indicator', function ( eventObject ) {
                eventObject.preventDefault();
                if ( Number( $( this ).data( 'slider-page' ) ) !== instance.currentElementIndex ) {
                    instance.moveTo( Number( $( this ).data( 'slider-page' ) ), true );
                }
            } );
        },

        refreshPageIndicators : function () {
            var instance = this,
                indicatorCount,
                lastPageIndex,
                finalItemIndex,
                idx,
                pageIndicatorButton,
                pageIndicatorInner;

            if ( instance.configs.pageIndicators === false ) {
                return false;
            }

            instance.pageIndicatorContainer.html( '' );

            indicatorCount = 0;
            lastPageIndex = instance.totalItems - instance.totalItems % instance.configs.displayCount;

            for ( idx = 0; idx < instance.totalItems; idx += 1 ) {
                if ( idx % instance.configs.displayCount === 0 ) {
                    indicatorCount += 1;
                    if ( lastPageIndex === idx ) {
                        finalItemIndex = instance.totalItems - instance.configs.displayCount;
                    }
                    pageIndicatorButton = $( '<div/>', {
                        'cssClass' : 'slider-page-indicator'
                    } );
                    pageIndicatorInner = $( '<span></span>', {
                        'content': instance.configs.showPageNumbers === true ? indicatorCount : '',
                        'cssClass': instance.configs.showPageNumbers === true ? 'slider-page-numbers' : ''
                    } );
                    pageIndicatorButton.append( pageIndicatorInner );

                    pageIndicatorButton.data( 'slider-page', lastPageIndex === idx ? finalItemIndex : idx );
                    pageIndicatorButton.data( 'slider-pageGroup', indicatorCount );

                    instance.pageIndicatorContainer.append( pageIndicatorButton );
                }
            }
            instance.verifyPageIndicators();
        },
        verifyPageIndicators : function () {
            var instance = this;
            if ( instance.configs.pageIndicators === false ) {
                return false;
            }
            instance.pageIndicatorContainer.find( '.slider-page-indicator' ).each( function () {
                if ( $( this ).data( 'slider-pageGroup' ) === $( instance.$sliderElements[instance.currentElementIndex] ).data( 'slider-pageGroup' ) ) {
                    instance.pageIndicatorContainer