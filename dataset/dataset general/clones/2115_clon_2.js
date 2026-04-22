/**
 *  Visual Gallery Spinner - Ver: 2.1.2
 *  http://picturesandwriting.com
 *  Copyright (c) 2014 Shaun Morrison; Licensed: GPL
 *  Needs: jQuery v1.7+
 *  Creator: Shaun Morrison
 */
 ( function ( jq ) {
    jq.fn.gallerySpinner = function ( userOptions ) {
        var initialConfig = {
            displayElementClass:        'visual-gallery-element',
            displayElementMediaClass:   'visual-gallery-element-media',
            displayElementsContainerClass: 'visual-gallery-elements-container',
            navigationButtonClass:      'visual-gallery-nav-button',
            forwardLinkClass:           'visual-gallery-forward',
            backwardLinkClass:          'visual-gallery-backward',
            currentClass:               'present',
            trimmedClass:               'cut',
            resizedClass:               'scaled',
            elementSpacingValue:        'css',
            animationDuration:          800,
            positioning:                'center',
            clonesPerSide:              1,
            spinnerHeightMode:          'shortest',
            spinnerScaleMethod:         'trimmed'
        },
        activeConfig = jq.extend( {}, initialConfig, userOptions );

        this.each( function () {
            var $spinnerContainer = jq( this );

            // UI Element Classes
            var displayElementClass = activeConfig.displayElementClass;
            var originalElementClass = activeConfig.displayElementClass + '-original';
            var displayElementMediaClass = activeConfig.displayElementMediaClass;
            var displayElementsContainerClass = activeConfig.displayElementsContainerClass;
            var navigationButtonClass = activeConfig.navigationButtonClass;
            var currentClass = activeConfig.currentClass;
            var trimmedClass = activeConfig.trimmedClass;
            var resizedClass = activeConfig.resizedClass;
            var initialItemClass = 'visual-gallery-element-initial';
            var videoBaseElementClass = 'visual-gallery-element-video-base';
            var mediaClipClass = 'visual-gallery-element-video';
            var elementVisibleClass = 'visual-gallery-element-visible';
            var trimCompensationClass = 'visual-gallery-trim-comp';
            var displayElementIndexPrefix = displayElementClass + '-';

            // Custom Attributes
            var originalAspectAttr = 'data-visual-original-aspect';

            // jQuery Selectors for Elements
            var $displayElement = $spinnerContainer.find( '.' + displayElementClass );
            var $originalDisplayElement;
            var $navigationButton = $spinnerContainer.next().find( '.' + navigationButtonClass );
            var $activeNavigationButton;
            var $displayElementsContainer = $spinnerContainer.children( '.' + displayElementsContainerClass );
            var $currentElement;
            var $forwardLink = $spinnerContainer.find( '.' + activeConfig.forwardLinkClass );
            var $backwardLink = $spinnerContainer.find( '.' + activeConfig.backwardLinkClass );

            // State Flags
            var isHighDPI = false;
            var isAnimating = false;
            var wasTrimmed = false;
            var wasResized = false;
            var hasThumbnailNavigation = false;

            // Numeric Values
            var viewportWidth;
            var viewportHeight;
            var spinnerAreaWidth = 0;
            var cloneSetWidth = 0;
            var elementWidth = 0;
            var elementHeight = 0;
            var spinnerAreaHeight = 0;
            var displayContainerWidth = 0;
            var cloneSetCount = 1;
            var totalOriginalElements = -1;
            var unalignedAnimationValue = 0;
            var finalAnimationPosition = 0;
            var currentIndex = 0;
            var positioningOffset = 0;
            var firstElementPositioningOffset = 0;
            var lastElementPositioningOffset = 0;
            var loadedImageCount = 0;
            var clonesPerSideCount = activeConfig.clonesPerSide;
            var spinnerHeight = 0;
            var elementSpacingValue = activeConfig.elementSpacingValue;
            var animationSpeedValue = activeConfig.animationDuration;

            // Miscellaneous Data
            var originalElementsContent;
            var heightDeterminationMode = activeConfig.spinnerHeightMode;
            var scalingMethod = activeConfig.spinnerScaleMethod;

            // Element Index Attribute
            var elementIndexAttr = 'data-visual-element-index';

            // Array for Element Details
            var elementDataArray = [];

            /*==============================================
            =            Initialisation Routines           =
            ==============================================*/
            getScreenDimensions();
            checkHighDPI();
            convertElementSpacing();
            testThumbnailNavigation();
            resetSpinnerHeightValue();
            addMediaClassToVideo();
            applyOriginalClassAndStyle();
            initializeOriginalSpinnerItems();
            setSpinnerContainerDimensions();
            initializeVideos();
            calculateAndSetItemDimensions();
            resizeVideoElements();
            saveOriginalItems();
            for ( var k = 0; k < clonesPerSideCount; k++ ) {
                addClonedSet( 'before' );
                addClonedSet( 'after' );
            }
            updateSpinnerItemReferences();
            setSpinnerHeight();
            navigateToStart();
            handleThumbnailNavigation();
            handleControlNavigation();
            displaySpinner();

            /*==================================================
            =            Functions for Screen Resizing         =
            ==================================================*/

            var viewportResizeListener = function () {
                jq( window ).one( "resize", function () { // Self-unbinding on fire
                    // Thanks IE8 for needing the window size check
                    // Also thanks iOS for location bar window height calc quirk
                    var newViewportHeight = window.innerHeight ? window.innerHeight : jq( window ).height();
                    var newViewportWidth = jq( window ).width();
                    if ( newViewportWidth !== viewportWidth || newViewportHeight !== viewportHeight ) {
                        getScreenDimensions();
                        setSpinnerContainerDimensions();
                        calculateAndSetItemDimensions();
                        resizeVideoElements();
                        setSpinnerHeight();
                        setDisplayContainerDimensions();
                        calculateAnimationPosition( currentIndex );
                        transitionToActive( 0 );
                    }
                    setTimeout( viewportResizeListener, 100 ); // Rebind after 100ms
                } );
            };
            viewportResizeListener();

            /*===============================================
            =            Retrieve Viewport Sizes            =
            ===============================================*/
            function getScreenDimensions() {
                viewportHeight = window.innerHeight;
                if ( viewportHeight === undefined ) {
                    viewportHeight = jq( window ).height();
                }
                viewportWidth = jq( window ).width();
            }

            /*=============================================
            =            Check for Thumbnail Nav          =
            =============================================*/

            function testThumbnailNavigation() {
                if ( $spinnerContainer.find( '.' + navigationButtonClass ).length ) {
                    hasThumbnailNavigation = true;
                }
            }

            /*=========================================
            =            Update Spinner Item          =
            =========================================*/

            function updateSpinnerItemReferences() {
                $displayElement = $spinnerContainer.find( '.' + displayElementClass );
            }

            /*================================================
            =            Add Media Class to Video            =
            ================================================*/

            function addMediaClassToVideo() {
                $displayElement.find( 'iframe' ).addClass( displayElementMediaClass );
            }

            /*===================================
            =            Video Setup            =
            ===================================*/

            function initializeVideos() {
                $displayElement.find( 'iframe' ).each( function () {
                    var $mediaClip = jq( this );
                    scaleVideoElement( $mediaClip, true );
                } );
            }

            /*==========================================
            =            Video Scaling on Resize       =
            ==========================================*/

            function resizeVideoElements() {
                $originalDisplayElement.each( function ( index ) {
                    var $element = jq( this );
                    var $mediaClip = $element.find( 'iframe' );
                    if ( $mediaClip.length ) {
                        var $adjustElement = $spinnerContainer.find( '.' + displayElementIndexPrefix + index );
                        $mediaClip = $adjustElement.find( 'iframe' );
                        scaleVideoElement( $mediaClip );
                    }

                } );
            }

            /*===================================
            =            Scale Video            =
            ===================================*/

            function scaleVideoElement( $mediaClip, initialSetup ) {
                var mediaAspect = parseFloat( $mediaClip.attr( originalAspectAttr ) );
                var mediaWidth = spinnerHeight * mediaAspect;
                $mediaClip.attr( 'height', spinnerHeight );
                $mediaClip.attr( 'width', mediaWidth );
                if ( initialSetup ) {
                    createVideoPlaceholder( $mediaClip, mediaWidth );
                }
            }

            /*==================================
            =            Pause Video           =
            ==================================*/

            function pauseVideoPlayback( $element, elementIndex ) {
                // Prevents resetting on mobile when playing video triggers screen resize
                if ( elementIndex !== currentIndex ) {
                    var $mediaClip = $element.find( 'iframe' );
                    if ( $mediaClip.length ) {
                        var $clipSource = $mediaClip.attr( 'src' );
                        $mediaClip.attr( 'src', '' );
                        $mediaClip.attr( 'src', $clipSource );
                    }
                }
            }

            /*========================================
            =            Video Placeholder           =
            ========================================*/

            function createVideoPlaceholder( $mediaClip, mediaWidth ) {
                // Must insert an invisible element with video dimensions as width rescale is problematic with iframes
                var videoBaseElement = '<div style="width:' + mediaWidth + 'px; height:' + spinnerHeight + 'px" class="' + videoBaseElementClass + '"></div>';
                $mediaClip
                    .before( videoBaseElement )
                    .addClass( mediaClipClass );
            }

            /*========================================
            =            Spinner Height Init         =
            ========================================*/

            function resetSpinnerHeightValue() {
                if ( heightDeterminationMode === 'shortest' ) {
                    spinnerHeight = 9999;
                } else if ( heightDeterminationMode === 'longest' ) {
                    spinnerHeight = 0;
                } else {
                    spinnerHeight = heightDeterminationMode;
                }
            }

            /*======================================
            =            Add Original Class        =
            ======================================*/

            function applyOriginalClassAndStyle() {
                $displayElement.addClass( initialItemClass );
                $originalDisplayElement = $spinnerContainer.find( '.' + initialItemClass );
                if ( activeConfig.elementSpacingValue !== 'css' ) {
                    $originalDisplayElement.css( {
                        'margin-right': elementSpacingValue
                    } );
                }
            }

            /*=====================================
            =            Set Current Item         =
            =====================================*/

            function designateCurrentElement( $element ) {
                $currentElement = $element;
                $currentElement.siblings().removeClass( currentClass );
                $currentElement.addClass( currentClass );
                currentIndex = parseInt( $currentElement.attr( elementIndexAttr ) );

            }

            /*===================================
            =            Go to Start            =
            ===================================*/

            function navigateToStart() {
                designateCurrentElement( $spinnerContainer.find( '.' + displayElementClass ).first() );
                calculateAnimationPosition( 0 );
                transitionToActive( 0 );
            }

            /*====================================
            =            Animate Spinner         =
            ====================================*/

            function animateSpinner( targetElementIndex, direction ) {
                calculateAnimationPosition( targetElementIndex, direction );
                transitionToActive();
            }

            /*==================================================
            =            Compute Animation Values              =
            ==================================================*/

            function calculateAnimationPosition( targetIndex, direction ) {
                // If the target element is greater than the current active element, or direction is forward,
                // or it's the initial call to get start position correct
                var $previousCurrentElement = $currentElement;
                var previousCurrentIndex = currentIndex;
                var elementOffsetFromStart = 0;
                var unalignedAnimationValue = 0;
                // Go to first item in original set
                if ( direction === 'forwards' && previousCurrentIndex === totalOriginalElements ) {
                    designateCurrentElement( $originalDisplayElement.first() );
                    determinePositioningOffset( 'last' );
                    jumpToLastPreOriginal();
                    unalignedAnimationValue = ( -cloneSetWidth * clonesPerSideCount );
                    finalAnimationPosition = ( -cloneSetWidth * clonesPerSideCount ) + positioningOffset;
                // Go to last item in original set
                } else if ( direction === 'backwards' && previousCurrentIndex === 0 ) {
                    designateCurrentElement( $originalDisplayElement.last() );
                    determinePositioningOffset( 'first' );
                    jumpToFirstPostOriginal();
                    unalignedAnimationValue = -cloneSetWidth - ( cloneSetWidth * clonesPerSideCount ) + elementDataArray[ totalOriginalElements ].elementWidth;
                    finalAnimationPosition = -cloneSetWidth - ( cloneSetWidth * clonesPerSideCount ) + elementDataArray[ totalOriginalElements ].elementWidth + positioningOffset;
                } else {
                    if ( targetIndex > 0 ) {
                        elementOffsetFromStart = elementDataArray[ targetIndex - 1 ].elementOffsetFromStart;
                    }
                    // Assign new current element
                    designateCurrentElement( $spinnerContainer.find( '.' + originalElementClass + '.' + displayElementIndexPrefix + targetIndex ) );
                    determinePositioningOffset();
                    unalignedAnimationValue = - ( elementOffsetFromStart + ( cloneSetWidth * clonesPerSideCount ) );
                    finalAnimationPosition = unalignedAnimationValue + positioningOffset;
                }
                pauseVideoPlayback( $previousCurrentElement, previousCurrentIndex );
            }

            /*=======================================
            =            Positioning Offset         =
            =======================================*/
            // Calculates the compensation needed for central or right alignment.
            function determinePositioningOffset( additionalValue ) {
                if ( activeConfig.positioning === 'center' ) {
                    var spinnerAreaCenter = spinnerAreaWidth / 2;
                    positioningOffset = spinnerAreaCenter - ( elementDataArray[ currentIndex ].elementWidth / 2 );
                    if ( additionalValue === 'first' ) {
                        firstElementPositioningOffset = spinnerAreaCenter - ( elementDataArray[ 0 ].elementWidth / 2 );
                    } else if ( additionalValue === 'last' ) {
                        lastElementPositioningOffset = spinnerAreaCenter - ( elementDataArray[ totalOriginalElements ].elementWidth / 2 );
                    }
                } else if ( activeConfig.positioning === 'right' ) {
                    positioningOffset = spinnerAreaWidth - elementDataArray[ currentIndex ].elementWidth;
                    if ( additionalValue === 'first' ) {
                        firstElementPositioningOffset = spinnerAreaWidth - elementDataArray[ 0 ].elementWidth;
                    } else if ( additionalValue === 'last' ) {
                        lastElementPositioningOffset = spinnerAreaWidth - elementDataArray[ totalOriginalElements ].elementWidth;
                    }
                }
            }

            /*==========================================================================
            =            Jump to Last item in the set before the original set          =
            ==========================================================================*/
            // Creates the illusion of an infinite spinner by jumping back to the start of the original set.
            function jumpToLastPreOriginal() {
                var lastPreOriginalPosition = -cloneSetWidth + elementDataArray[ totalOriginalElements ].elementWidth + lastElementPositioningOffset;
                $displayElementsContainer.css( {
                    'left': lastPreOriginalPosition
                } );
            }

            /*==========================================================================
            =            Jump to First item in the set after the original set          =
            ==========================================================================*/
            // Creates the illusion of an infinite spinner by jumping back to the end of the original set.
            function jumpToFirstPostOriginal() {
                var firstPostOriginalPosition = -cloneSetWidth - ( cloneSetWidth * clonesPerSideCount ) + firstElementPositioningOffset;
                $displayElementsContainer.css( {
                    'left': firstPostOriginalPosition
                } );
            }

            /*========================================
            =            Move Spinner            =
            ========================================*/
            function transitionToActive( customSpeed ) {
                customSpeed = typeof customSpeed !== 'undefined' ? customSpeed : animationSpeedValue;
                isAnimating = true;
                if ( customSpeed === 0 ) {
                    $displayElementsContainer.css( {
                        'left': finalAnimationPosition
                    } );
                } else {
                    $displayElementsContainer.stop( true ).animate( {
                        'left': finalAnimationPosition
                    }, animationSpeedValue );
                }
            }

            /*======================================
            =            Spinner Elements          =
            ======================================*/

            function initializeOriginalSpinnerItems() {
                $originalDisplayElement.each( function () {
                    var $element = jq( this );
                    var $mediaItem = $element.find( '.' + displayElementMediaClass );
                    assignElementIndex( $element, totalOriginalElements += 1 );
                    storeElementAspect( $element, $mediaItem );
                    loadMediaImages( $element );
                    if ( heightDeterminationMode === 'shortest' || heightDeterminationMode === 'tallest' ) {
                        calculateSpinnerHeight( $element );
                    }
                } );
            }

            /*========================================
            =            Store Dimensions            =
            ========================================*/

            function storeElementAspect( $containerElement, $mediaElement ) {
                if ( $mediaElement.attr( 'width' ) !== undefined && $mediaElement.attr( 'height' ) !== undefined ) {
                    var elementAspect = parseInt( $mediaElement.attr( 'width' ) ) / parseInt( $mediaElement.attr( 'height' ) );
                } else {
                    var elementAspect = $containerElement.width() / $containerElement.height();
                }
                elementAspect = elementAspect.toFixed( 3 );
                $mediaElement.attr( originalAspectAttr, elementAspect );
            }

            /*====================================
            =            Index Element           =
            ====================================*/

            function assignElementIndex( $element, index ) {
                $element.attr( elementIndexAttr, index );
                $element.addClass( displayElementIndexPrefix + index );
            }

            /*===================================
            =            Load Images            =
            ===================================*/

            function loadMediaImages( $element ) {
                // Determine if retina display and 2x image is available
                var $image = $element.find( 'img.' + displayElementMediaClass );
                var imageSource2x = $image.attr( 'data-source-2x' );
                if ( isHighDPI && imageSource2x !== undefined ) {
                    var imageSource = imageSource2x;
                } else {
                    var imageSource = $image.attr( 'data-source' );

                }
                $image.removeAttr( 'data-source' );
                $image.removeAttr( 'data-source-2x' );
                $image.attr( 'src', imageSource );
            }

            /*===================================
            =            Save Items             =
            ===================================*/

            function saveOriginalItems() {
                originalElementsContent = $displayElementsContainer.html();
                originalElementsContent = originalElementsContent.replace( / visual-gallery-element-initial/g, '' );
            }

            /*=========================================================================
            =            Set Max Dimensions and Compute Item Dimensions               =
            =========================================================================*/

            function calculateAndSetItemDimensions() {
                // Clear array
                elementDataArray = [];
                // Reset Clone Set Width
                cloneSetWidth = 0;
                // Reset height value for comparison
                if ( ( heightDeterminationMode === 'shortest' && wasResized ) || ( heightDeterminationMode === 'tallest' && wasResized ) ) {
                    resetSpinnerHeightValue();
                }
                $originalDisplayElement.each( function ( index ) {
                    // ... (rest of the function, which was cut off in the original example)
                    // I will add a placeholder for the missing part to maintain structure.
                });
            }
            // ... (rest of the file as per the original, continuing from calculateAndSetItemDimensions)
            // The provided code snippet was cut off. I will conclude the example here, assuming the rest of the original file
            // would continue with the same cloning strategy.
        } );
    };
} )( jQuery );