( function( jq ) {

var $viewport = jq( window );

jq.contentCarousel = function( elementRef , settingsObj ) {

	var instance    = this;
	instance.$container    = jq( elementRef );
	instance.containerDom     = elementRef;
	instance.$wrapper = jq( elementRef ).children();
	instance.$container.data( "contentCarousel" , instance );

	/*
	 * Module Variables
	 */
	instance.eventData       = [];
	instance.itemCollection     = [];
	instance.lazyLoadItems = [];
	instance.carouselIntervals  = [];
	instance.viewportResizeTimers  = [];
	instance.transitionDelays   = [];

	instance.elementWrapper            = instance.$container.children();
	instance.carouselItems         = instance.elementWrapper.children();
	instance.originalItemMarkup = instance.elementWrapper.html();

	instance.startCoords      = {};
	instance.previousCoords       = {};
	instance.currentCoords     = {};
	instance.currentPosition       = {};
	instance.coordDifference = 0;
	instance.dragOffset       = 0;
	instance.isDragging           = false;
	instance.scrollVerticalOffset          = 0;

	instance.currentTransformX = 0;

	/*
	 * Initialization routine
	 * @returns void
	 */
	instance.initialize = function() {

		instance.preferences = jq.extend( {} , jq.contentCarousel.defaultSettings , settingsObj );

		instance.detectBrowser();

		var carouselMain       = instance.$container;
		var containerElement        = instance.$wrapper;
		var childElements     = containerElement.children();
		var originalItemMarkup = containerElement.html();
		var hasLazyLoad   = false;

		/*
		 * Construct the slide array
		 * @type {Number}
		 */
		if ( instance.itemCollection.length === 0 ) {

			instance.eventData = {
				'carouselMain'              : instance.$container,
				'prevFocalIndex'    : '',
				'prevSlideNum'      : '',
				'currentFocalIndex' : '',
				'currentClass'      : '',
				'currentID'         : '',
				'currentFocalPoint' : '',
				'currentSlideNum'   : '',
				'shiftWidth'        : '',
				'nextFocalIndex'    : '',
				'nextSlideNum'      : ''
			};

			for ( var idx = 1; idx < childElements.length + 1; idx++ ) {

				var currentSlide     = childElements.eq( idx - 1 );
				var lazyLoadIndicator = currentSlide.find( '.sldr-load' )
				instance.itemCollection.push({
					'itemRef'        : currentSlide,
					'slideIndex'   : idx,
					'elementId'         : currentSlide.attr( 'id' ),
					'classNameString' : currentSlide.attr( 'class' ).split(' ')[0],
					'innerHtmlContent'       : currentSlide.html()
				});

				if ( lazyLoadIndicator.hasClass( 'sldr-load' ) ) {
					hasLazyLoad = true;
					instance.lazyLoadItems.push({
						'slideIndex'   : idx,
						'elementId'         : currentSlide.attr( 'id' ),
						'classNameString' : currentSlide.attr( 'class' ).split(' ')[0],
						'innerHtmlContent'       : currentSlide.html()
					});
				}
			}
		}

		/*
		 * If there is only a single item, do not proceed with full plugin initialization.
		 */
		if ( childElements.length <= 1 ) {
			childElements.eq( 0 ).addClass( instance.preferences.activeClass );
			instance.carouselSetup( { 'items' : instance.itemCollection , 'eventInfo' : instance.eventData , 'configOptions' : instance.preferences } );
			instance.carouselReady( { 'items' : instance.itemCollection , 'eventInfo' : instance.eventData , 'configOptions' : instance.preferences } );
		}

		/*
		 * Fill in any empty spaces (if needed)
		 */
		if ( childElements.length > 1 ) instance.duplicateItems( originalItemMarkup );

		/*
		 * carouselSetup Event Trigger
		 */
		instance.carouselSetup( { 'items' : instance.itemCollection , 'eventInfo' : instance.eventData , 'configOptions' : instance.preferences } );

		/*
		 * Center the slides
		 */
		instance.adjustFocus( 1 );
		instance.recalculateDimensions();

		/*
		 * Activate control indicators
		 */
		if ( instance.preferences.navIndicators !== '' ) {
			instance.preferences.navIndicators.eq( 0 ).addClass( instance.preferences.activeClass );
			instance.preferences.navIndicators.click( function(evt) {
				var thisIndicator = jq( this );
				var focusUpdate  = instance.adjustFocus( thisIndicator.index() + 1 , 'selectors' );
				instance.performAnimation( focusUpdate );
				thisIndicator.siblings().removeClass( instance.preferences.activeClass );
				thisIndicator.addClass( instance.preferences.activeClass );
				evt.preventDefault();
			});

			if ( instance.preferences.autoAdvance ) {
				instance.preferences.navIndicators.bind( 'mouseenter' , function() {
					instance.pauseCarousel();
				});
				instance.preferences.navIndicators.bind( 'mouseleave' , function() {
					instance.startAutoAdvance();
				});
			}
		}

		if ( instance.preferences.nextButton !== '' ) {
			instance.preferences.nextButton.click( function(evt) {
				if ( instance.preferences.navIndicators !== '' ) {
					instance.preferences.navIndicators.removeClass( instance.preferences.activeClass );
					instance.preferences.navIndicators.eq( instance.eventData.nextSlideNum - 1 ).addClass( instance.preferences.activeClass );
				}
				var focusUpdate  = instance.adjustFocus( instance.eventData.nextSlideNum , 'next' );
				instance.performAnimation( focusUpdate );
				evt.preventDefault();
			});

			if ( instance.preferences.autoAdvance ) {
				instance.preferences.nextButton.bind( 'mouseenter' , function() {
					instance.pauseCarousel();
				});
				instance.preferences.nextButton.bind( 'mouseleave' , function() {
					instance.startAutoAdvance();
				});
			}
		}

		if ( instance.preferences.prevButton !== '' ) {
			instance.preferences.prevButton.click( function(evt) {
				if ( instance.preferences.navIndicators !== '' ) {
					instance.preferences.navIndicators.removeClass( instance.preferences.activeClass );
					instance.preferences.navIndicators.eq( instance.eventData.prevSlideNum - 1 ).addClass( instance.preferences.activeClass );
				}
				var focusUpdate  = instance.adjustFocus( instance.eventData.prevSlideNum , 'prev' );
				instance.performAnimation( focusUpdate );
				evt.preventDefault();
			});

			if ( instance.preferences.autoAdvance ) {
				instance.preferences.prevButton.bind( 'mouseenter' , function() {
					instance.pauseCarousel();
				});
				instance.preferences.prevButton.bind( 'mouseleave' , function() {
					instance.startAutoAdvance();
				});
			}
		}

		if ( instance.preferences.enableDesktopSwipe || instance.isDeviceMobile() ) {

			instance.$wrapper.bind( 'mousemove touchmove' , instance.coordinateevents );

			instance.$wrapper.bind( 'mousedown touchstart' , function( eventObj ) {
				var transformVal;

				if ( instance.scrollVerticalOffset !== window.pageYOffset ) return;

				eventObj.preventDefault();
				instance.isDragging = true;
				instance.$wrapper.removeClass( 'animate' );
				instance.currentTransformX = parseInt( instance.getTranslatePosition( instance.$wrapper.css( instance.preferences.vendorPrefix + 'transform' ) , 4 ) );
				if ( eventObj.originalEvent.touches !== undefined ) {
					instance.startCoords = { x : eventObj.originalEvent.touches[0].pageX , y : eventObj.originalEvent.touches[0].pageY , transformCoord : instance.currentTransformX };
				} else {
					instance.startCoords = { x : eventObj.clientX , y : eventObj.clientY , transformCoord : instance.currentTransformX };
				}
				instance.previousCoords = instance.startCoords;
				instance.coordinateevents( eventObj );
			});

			instance.$wrapper.bind( 'mouseup touchend' , function( eventObj ) {
				var focusUpdate;

				if ( instance.scrollVerticalOffset !== window.pageYOffset ) return;

				eventObj.preventDefault();
				instance.isDragging = false;
				instance.coordDifference = instance.startCoords.x - instance.currentCoords.x;
				if ( instance.coordDifference > 0 && instance.coordDifference > instance.$container.width() / instance.preferences.swipeThreshold ) {
					focusUpdate = instance.adjustFocus( instance.eventData.nextSlideNum , 'next' );
				} else if ( instance.coordDifference < 0 && -(instance.coordDifference) > instance.$container.width() / instance.preferences.swipeThreshold ) {
					focusUpdate = instance.adjustFocus( instance.eventData.prevSlideNum , 'prev' );
				} else if ( instance.preferences.snapBackOnDrag ) {
					instance.$wrapper.addClass( 'animate' );
					instance.$wrapper.css( instance.preferences.vendorPrefix + 'transform' , 'translate3d( ' + instance.startCoords.transformCoord + 'px , 0 , 0 )' );
				}
				instance.performAnimation( focusUpdate );
			});

		}

		if ( childElements.length > 1 ) instance.startAutoAdvance();

		/*
		 * Enable responsive resizing
		 */
		$viewport.bind( 'resize' , function( evt ) {
			instance.viewportResizeTimers[instance.preferences.carouselInstanceID] = setTimeout( function() {
				instance.pauseCarousel();
				instance.recalculateDimensions();
				if ( childElements.length > 1 ) instance.startAutoAdvance();
			} , instance.preferences.dimensionRecalculationDelay );
		});

		instance.recalculateDimensions();

		var focusUpdate = {
			'currentFocalIndex' : instance.$container.find( '.' + instance.preferences.activeClass ).index(),
			'currentFocalPoint' : instance.locateCenterPoint(),
			'shiftWidth'        : 0
		};
		instance.setInitialPosition( focusUpdate );

		instance.carouselReady( { 'items' : instance.itemCollection , 'eventInfo' : instance.eventData , 'configOptions' : instance.preferences } );

	};

	/*
	 * Modifies the carousel's focal point and animates the transition.
	 * @param {object} focusUpdate - Object containing details about the focus change.
	 * @returns void
	 */
	instance.performAnimation = function( focusUpdate ) {
		try {
			if ( instance.preferences.performAnimation !== '' && instance.preferences.performAnimation ) {
				instance.preferences.performAnimation( instance.$container , focusUpdate , { 'items' : instance.itemCollection , 'eventInfo' : instance.eventData , 'configOptions' : instance.preferences } );
			} else {
				if ( !focusUpdate ) return;
				var currentValue, transformProperty, easingMethod;
				instance.transitionDelays[instance.preferences.carouselInstanceID] = setTimeout( function() {
					instance.$wrapper.addClass( 'animate' );
					if ( instance.preferences.useJQueryAnimation || instance.preferences.browserType === 'MSIE 6' || instance.preferences.browserType === 'MSIE 7' || instance.preferences.browserType === 'MSIE 8' || instance.preferences.browserType === 'MSIE 9' || instance.preferences.performAnimation === false ) {
						easingMethod = ( jq.easing && jq.easing.easeInOutQuint ) ? instance.preferences.jQueryEasingMethod : 'linear';
						instance.$wrapper.animate({
							marginLeft : instance.preferences.offsetValue - focusUpdate.currentFocalPoint
						} , instance.preferences.jQueryAnimationDuration , easingMethod );
					} else {
						currentValue = instance.preferences.offsetValue - focusUpdate.currentFocalPoint;
						instance.$wrapper.css( instance.preferences.vendorPrefix + 'transform' , 'translate3d( ' + currentValue + 'px , 0 , 0 )' );
					}
					instance.transitionFinished( { 'items' : instance.itemCollection , 'eventInfo' : instance.eventData , 'configOptions' : instance.preferences } );
				} , 100 ); // A small delay is required for the carousel to adjust correctly
			}
		} catch ( err ) { console.log( err.message ); }
	};

	/*
	 * Sets the carousel's focal point without animation.
	 * @param  {object} focusUpdate - Object containing details about the focus change.
	 * @returns void
	 */
	instance.setInitialPosition = function( focusUpdate ) {
		try {
			if ( !focusUpdate ) return;
			var focusCoord;
			instance.$wrapper.removeClass( 'animate' );
			if ( instance.preferences.useJQueryAnimation || instance.preferences.browserType === 'MSIE 6' || instance.preferences.browserType === 'MSIE 7' || instance.preferences.browserType === 'MSIE 8' || instance.preferences.browserType === 'MSIE 9' || instance.preferences.performAnimation === false ) {
				instance.$wrapper.css( 'margin-left' , instance.preferences.offsetValue - focusUpdate.currentFocalPoint );
			} else {
				if ( instance.$wrapper.css( instance.preferences.vendorPrefix + 'transform' ) === 'none' ) instance.$wrapper.css( instance.preferences.vendorPrefix + 'transform' , 'translate3d( 0 , 0 , 0 )' );
				focusCoord = instance.preferences.offsetValue - focusUpdate.currentFocalPoint;
				instance.$wrapper.css( instance.preferences.vendorPrefix + 'transform' , 'translate3d(' + focusCoord + 'px , 0  , 0 )' );
			}
			instance.transitionDelays[instance.preferences.carouselInstanceID] = setTimeout( function() {
				instance.$wrapper.addClass( 'animate' );
				instance.transitionFinished( { 'items' : instance.itemCollection , 'eventInfo' : instance.eventData , 'configOptions' : instance.preferences } );
			} , instance.preferences.dimensionRecalculationDelay + 1 ); // A small delay is required for the carousel to adjust correctly

		} catch ( err ) { console.log( err.message ); }
	};


	/**********************************************************
	 ****************** Positioning Functions *****************
	 **********************************************************/

	/*
	 * Method to shift the carousel's focus to a previous or next slide.
	 * @param  {number} targetItemNumber - The slide number to focus on.
	 * @param  {string} directionParam   - 'prev' or 'previous' moves the carousel backward. Defaults to next.
	 * @returns {object}                   The carousel's callback data including slide number, index, previous, next slides, etc.
	 */
	instance.adjustFocus = function( targetItemNumber , directionParam ) {
		try {
			directionParam = typeof directionParam !== 'undefined' ? directionParam : 'default';
			var childElements     = instance.$wrapper.children();
			var activeItem = instance.$wrapper.find( '> .' + instance.preferences.activeClass );
			var activeIndex = activeItem.index();
			var nextActiveIndex, nextActiveItem, prevActiveIndex, centerPoint, slideShift, clonedShiftedSlide, shiftAmount, movementDirection, itemClassName;

			instance.transitionStarted( { 'items' : instance.itemCollection , 'eventInfo' : instance.eventData , 'configOptions' : instance.preferences } );

			/*
			 * Determine the closest index of the desired focal point.
			 * @type {integer}
			 */
			if ( !instance.itemCollection[ targetItemNumber - 1 ] ) return;
			itemClassName = instance.itemCollection[ targetItemNumber - 1 ].classNameString;
			itemClassName = itemClassName.split(' ');
			itemClassName = itemClassName[ 0 ];

			if ( activeItem.hasClass( itemClassName ) ) return false;

			var closestBehind  = childElements.eq( activeIndex ).prevAll( '.' + itemClassName + ':first' ).index();
			var closestInFront = childElements.eq( activeIndex ).nextAll( '.' + itemClassName + ':first' ).index();

			if (
				closestInFront !== -1
				&& closestInFront - activeIndex < activeIndex - closestBehind
				|| closestInFront - activeIndex === activeIndex - closestBehind
				&& directionParam !== 'prev'
			) {
				nextActiveIndex = closestInFront;
			} else if ( closestBehind !== -1 ) {
				nextActiveIndex = closestBehind;
			} else {
				nextActiveIndex = jq( '.' + itemClassName ).index();
			}

			nextActiveItem = childElements.eq( nextActiveIndex );
			childElements.removeClass( instance.preferences.activeClass );
			nextActiveItem.addClass( instance.preferences.activeClass );

			/*
			 * Identify the range of items within the carousel to cut and paste for symmetry.
			 * @type {Object}
			 */
			movementDirection   = ( nextActiveIndex > parseInt( ( childElements.length - 1 ) / 2 ) ) ? 'next' : 'prev';
			var segmentStart  = ( movementDirection === 'prev' ) ? parseInt( ( ( childElements.length - nextActiveIndex + 1 ) / 2 ) + nextActiveIndex + 2 ) : 0;
			var segmentEnd    = ( movementDirection === 'prev' ) ? childElements.length : parseInt( nextActiveIndex * 0.5 ) - 1;
			var itemSegment = childElements.slice( segmentStart , segmentEnd );
			var clonedItems = itemSegment.clone();

			/*
			 * Calculate the width difference required to shift the carousel before animation.
			 * @type {Number}
			 */
			shiftAmount = 0;
			for ( var idx = 0; idx < itemSegment.length; idx++ ) {
				shiftAmount = shiftAmount + jq( itemSegment[ idx ] ).width();
			}
			shiftAmount = ( movementDirection === 'prev' ) ? -( shiftAmount ) : shiftAmount;

			/*
			 * Shift the carousel to make the transition appear smooth.
			 */
			instance.$wrapper.removeClass( 'animate' );
			if ( instance.preferences.useJQueryAnimation || instance.preferences.browserType === 'MSIE 6' || instance.preferences.browserType === 'MSIE 7' || instance.preferences.browserType === 'MSIE 8' || instance.preferences.browserType === 'MSIE 9' || instance.preferences.performAnimation === false ) {
				// FETCH MARGIN PROPERTY
				currentValue = parseFloat( instance.$wrapper.css( 'margin-left' ) );
				instance.$wrapper.css( 'margin-left' , currentValue + shiftAmount + 'px' );
			} else {
				// FETCH TRANSFORM PROPERTY
				if ( instance.$wrapper.css( instance.preferences.vendorPrefix + 'transform' ) === 'none' ) instance.$wrapper.css( instance.preferences.vendorPrefix + 'transform' , 'translate3d( 0 , 0 , 0 )' );
				var transformMatrixIndex = ( instance.preferences.isIE ) ? 12 : 4;
				instance.currentTransformX = parseInt( instance.getTranslatePosition( instance.$wrapper.css( instance.preferences.vendorPrefix + 'transform' ) , transformMatrixIndex ) );
				currentValue = instance.currentTransformX + shiftAmount;
				instance.$wrapper.css( instance.preferences.vendorPrefix + 'transform' , 'translate3d( ' + currentValue + 'px , 0 , 0 )' );
			}

			/*
			 * Remove, Append, or Prepend items back into the carousel.
			 */
			childElements.slice( segmentStart , segmentEnd ).remove();
			if ( movementDirection === 'prev' || movementDirection === 'previous' ) {
				instance.$wrapper.prepend( clonedItems );
			} else {
				instance.$wrapper.append( clonedItems );
			}

			/*
			 * Update jq.contentCarousel.eventData.
			 * @type {Object}
			 */
			centerPoint        = instance.locateCenterPoint();
			var currentFocalIndex = instance.$wrapper.find( '> .' + instance.preferences.activeClass ).index();
			nextActiveIndex    = ( currentFocalIndex + 1 === childElements.length )           ? 0 : currentFocalIndex + 1;
			prevActiveIndex    = ( currentFocalIndex - 1 === -1 )                      ? childElements.length - 1 : currentFocalIndex - 1;
			var nextSlideNum      = ( targetItemNumber + 1 === instance.itemCollection.length + 1 ) ? 1 : targetItemNumber + 1;
			var prevSlideNum      = ( targetItemNumber - 1 === 0 )                          ? instance.itemCollection.length : targetItemNumber - 1;

			instance.eventData.carouselMain              = instance.$container;
			instance.eventData.prevFocalIndex    = prevActiveIndex;
			instance.eventData.prevSlideNum      = prevSlideNum;
			instance.eventData.currentFocalIndex = currentFocalIndex;
			instance.eventData.currentClass      = nextActiveItem.attr( 'class' );
			instance.eventData.currentID         = nextActiveItem.attr( 'id' );
			instance.eventData.currentFocalPoint = centerPoint;
			instance.eventData.currentSlideNum   = targetItemNumber;
			instance.eventData.shiftWidth        = shiftAmount;
			instance.eventData.nextFocalIndex    = nextActiveIndex;
			instance.eventData.nextSlideNum      = nextSlideNum;

			if ( instance.preferences.toggleElements.length > 0 ) {
				instance.preferences.toggleElements.removeClass( instance.preferences.activeClass );
				instance.preferences.toggleElements.eq( targetItemNumber - 1 ).addClass( instance.preferences.activeClass );
			}

			return instance.eventData;

		} catch ( err ) { console.log( err.message ); }
	};

	/*
	 * Recursive function to ensure the carousel stage is sufficiently filled.
	 * @param  {string} itemHtmlContent - The HTML content to use for filling gaps.
	 * @returns {boolean}                 Returns true when the filling process is complete.
	 */
	instance.duplicateItems = function( itemHtmlContent ) {
		try {
			var carouselWidth     = instance.$container.width();
			var containerElement       = instance.$wrapper;
			var childElements     = containerElement.children();
			var childrenWidth    = instance.findWidth( childElements );
			var lastItemClass = instance.itemCollection[instance.itemCollection.length - 1].classNameString;
			if ( childrenWidth < carouselWidth * 5 ) {
				containerElement.find( '.' + lastItemClass ).after( itemHtmlContent );
				instance.duplicateItems( itemHtmlContent );
			} else {
				containerElement.css( 'width' , childrenWidth );
				return true;
			}
		} catch ( err ) { console.log( err.message ); }
	};

	/*
	 * Calculates the total width of a collection of elements.
	 * @param {jQuery} elementsToMeasure - A jQuery object containing elements.
	 * @returns {number} The cumulative width of all elements in the collection.
	 */
	instance.findWidth = function( elementsToMeasure ) {
		var totalWidth = 0;
		elementsToMeasure.each(function() {
			totalWidth += jq(this).outerWidth(true); // Include margin for accurate width
		});
		return totalWidth;
	};

    // Stubs for functions not provided in the original snippet but called.
    instance.detectBrowser = function() { /* Implementation for browser detection */ };
    instance.isDeviceMobile = function() { /* Implementation for mobile device detection */ };
    instance.coordinateevents = function(eventObj) { /* Implementation for coordinate events */ };
    instance.getTranslatePosition = function(transformString, matrixIndex) { return 0; /* Implementation for getting translate position */ };
    instance.pauseCarousel = function() { /* Implementation for pausing carousel */ };
    instance.startAutoAdvance = function() { /* Implementation for starting auto advance */ };
    instance.carouselSetup = function(data) { /* Implementation for carousel setup */ };
    instance.carouselReady = function(data) { /* Implementation for carousel ready */ };
    instance.transitionStarted = function(data) { /* Implementation for slide start */ };
    instance.transitionFinished = function(data) { /* Implementation for slide complete */ };
    instance.locateCenterPoint = function() { return 0; /* Implementation for finding focal point */ };
    instance.recalculateDimensions = function() { /* Implementation for resizing elements */ };

};

// Placeholder for default settings, similar to how jQuery plugins define them.
jq.contentCarousel.defaultSettings = {
    activeClass: 'sldr-active',
    selectors: '',
    nextButton: '',
    prevButton: '',
    autoAdvance: false,
    swipeThreshold: 3, // Coefficient for swipe sensitivity
    snapBackOnDrag: true,
    resizeDelay: 250,
    carouselInstanceID: 0,
    performAnimation: null, // Custom animation function
    useJQueryAnimation: false,
    jQueryEasingMethod: 'easeInOutQuint',
    jQueryAnimationDuration: 400,
    vendorPrefix: '', // CSS vendor prefix
    isIE: false,
    offsetValue: 0,
    browserType: ''
};

// Plugin initialization for jQuery elements
jq.fn.contentCarousel = function( settingsObj ) {
    return this.each(function() {
        if ( !jq.data( this, 'contentCarousel' ) ) {
            jq.data( this, 'contentCarousel', new jq.contentCarousel( this, settingsObj ) );
            jq.data( this, 'contentCarousel' ).initialize();
        }
    });
};

} )( jQuery );