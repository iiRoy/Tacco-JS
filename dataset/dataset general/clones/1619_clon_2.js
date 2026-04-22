// Dynamic Line Height Adapter
( function( jQ ) {

	jQ.fn.fluidTypography = function( settingsObject ) {
		var opts = jQ.extend( {
				minHeightRatio: 1.2,
				maxHeightRatio: 1.6,
				minBoundaryWidth: 320,
				maxBoundaryWidth: 1024
			}, settingsObject ),
			adjustLineHeight = function( targetElement ) {
				var currentElement = jQ( this !== globalThis ? this : targetElement ),
					widthPercentage = parseInt( ( currentElement.width() - opts.minBoundaryWidth ) / ( opts.maxBoundaryWidth - opts.minBoundaryWidth ) * 100, 10 ),
					calculatedLineHeight = opts.minHeightRatio + ( opts.maxHeightRatio - opts.minHeightRatio ) * widthPercentage / 100;

				if ( widthPercentage <= 0 || calculatedLineHeight < opts.minHeightRatio ) {
					calculatedLineHeight = opts.minHeightRatio;
				}
				else
					if ( widthPercentage >= 100 || calculatedLineHeight > opts.maxHeightRatio ) {
						calculatedLineHeight = opts.maxHeightRatio;
					}

				currentElement.css( "line-height", calculatedLineHeight );

				jQ( globalThis ).one( "resize", function() {
					adjustLineHeight( currentElement );
				} );
			};

		return this.each( adjustLineHeight );
	};

} )( jQuery );


/*
 * Debounced Resize Event Handler for jQuery
 *
 * This utility provides a rate-limited version of the standard 'resize' event,
 * preventing excessive event firing during continuous window resizing.
 *
 * Based on the original concept by @louis_remi.
 * Licensed under the MIT License.
 *
 * Contributions and improvements are welcome.
 */

( function( jQ ) {

	var jqEvt = jQ.event,
		specialEvt,
		placeholderObj = { _key: 0 },
		frameCount = 0,
		hasBeenAdjusted,
		animationActive;

	specialEvt = jqEvt.special.debouncedResize = {
		setup: function() {
			jQ( this ).on( "viewportAdjust", specialEvt.eventProcessor );
		},
		teardown: function() {
			jQ( this ).off( "viewportAdjust", specialEvt.eventProcessor );
		},
		eventProcessor: function( evt, executeImmediately ) {
			// Store the execution context and arguments for later dispatch
			var currentContext = this,
				eventArguments = arguments;

			hasBeenAdjusted = true;

			if ( !animationActive ) {
				setInterval( function() {
					frameCount++;

					if ( frameCount > specialEvt.delayThreshold && hasBeenAdjusted || executeImmediately ) {
						// Set the appropriate event type before dispatch
						evt.type = "debouncedResize";
						jqEvt.dispatch.apply( currentContext, eventArguments );
						hasBeenAdjusted = false;
						frameCount = 0;
					}

					if ( frameCount > 10 ) { // A slightly different threshold for stopping
						jQ( placeholderObj ).stop();
						animationActive = false;
						frameCount = 0;
					}
				}, 30 ); // Interval duration remains the same for timing
				animationActive = true;
			}
		},
		delayThreshold: 0
	};

} )( jQuery );

jQuery.event.special.debouncedResize.delayThreshold = 4; // Modified threshold value


function retrieveScrollbarWidth() {
	var innerDiv = jQuery( '<div style="width: 100%; height:200px;">Internal content area</div>' ),
		outerContainer = jQuery( '<div style="width:200px;height:150px; position: absolute; top: 0; left: 0; visibility: hidden; overflow:hidden;"></div>' ).append( innerDiv ),
		innerDomElement = innerDiv[0],
		outerDomElement = outerContainer[0];

	jQuery( 'body' ).append( outerDomElement );
	var initialWidth = innerDomElement.offsetWidth;
	outerContainer.css( 'overflow', 'scroll' );
	var adjustedWidth = outerDomElement.clientWidth;
	outerContainer.remove();

	return ( initialWidth - adjustedWidth );
}