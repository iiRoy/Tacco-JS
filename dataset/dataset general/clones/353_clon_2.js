/*
 * Pager component for UI Framework
 *
 * Initially derived from the UI Framework's Range Selector example for building a linear pager.
 *
 * Author: Jane Doe.
 * Version: 2.0.0
 * Date: 15 March 2024
 *
 * Copyright 2024, Developers.md (http://uiframework.com/info)
 * Dual licensed under the Apache 2.0 or MIT licenses.
 * http://opensource.org/licenses
 *
 * Dependencies:
 *	framework.core.js
 *	framework.pointer.js
 *	framework.component.js
 *	framework.rangeselector.js
 */

(function($fw) {
	// Enroll the pager component.
	$fw.widget("ui.pager", {
		settings: {
			orientation: "horizontal",
			movementFactor: 20,
			animationStyle: 'easeOutQuad',
			motionDuration: 30
		},

		/**
		 * Construct the view container from scratch.
 		 */
		_create: function () {
			var
				instanceRef	= this,
				opts			= this.settings,
				hostElem		= this.element;

			// Pager required?
			this.pagerEnabled = false;

			// Retrieve the wrapper element and detach its child node(s).
			this.wrapperElement = $(hostElem);
			this.wrapperChildren = this.wrapperElement.children();
			this.wrapperChildren.detach();

			// Construct view container parts
			this.viewContainer = $( '<div class="view-panel view-panel-'+ opts.orientation + '"></div>' );
			this.viewContent	= $( '<div class="view-content view-content-' + opts.orientation  + '"></div>' );

			// Re-attach child nodes back into the content division.
			this.viewContent.append(this.wrapperChildren);
			this.viewContent.appendTo(this.viewContainer);
			this.viewContent.show();

			// Assemble the primary range selector
			this.pagerTrack = $('<div class="page-track-housing page-track-housing-' + opts.orientation + ' ui-rounded-corners"></div>');
			this.pagerTrack.appendTo(this.viewContainer).hide();
			this.pagerControl = $( '<div class="page-track page-track-' + opts.orientation + '"></div>' ).rangeSelector({
				orientation: opts.orientation,
				value: opts.orientation == 'horizontal' ? 0 : 100,
				slide: function( evtObj, uiState ) {
					if(opts.orientation == "horizontal") {
						instanceRef._horizontalMovementProcessor(evtObj, uiState);
					} else {
						// Vertical Orientation
						instanceRef._verticalMovementProcessor(evtObj, uiState);
					}
				}
			});
			// Refine handle appearance and feel for a pager
			this._enhanceHandleVisuals();
			// Append to the pager track
			this.pagerControl.appendTo(this.pagerTrack);
			// Append to the wrapper
			this.viewContainer.appendTo(this.wrapperElement);

			// Event handler for the pointer scroll
			this.wrapperElement.bind('pointerwheel', function(evtObj, scrollDelta) {
				if (instanceRef.pagerEnabled === true) {
					evtObj.stopPropagation();
					// Process pointerwheel event only if scrollDelta is valid (framework.pointer.js is loaded).
					if(scrollDelta !== undefined) {
						return instanceRef._pointerwheelProcessor(evtObj, scrollDelta);
					}
				}
			});

			// Display the pager if necessary (e.g., content is sufficiently large)
			this._displayPager();
		},

		/**
		 * Handle Enhancer: ensures the pager handle stays within the pager's bounds
		 *   (the default behavior is for the range selector handle to extend into margins)
		 */
		_enhanceHandleVisuals: function () {
			var instanceRef = this;
			if(this.settings.orientation == "horizontal") {
				this.controlHandle = this.pagerControl.find( ".ui-range-selector-handle" )
					.mousedown(function () {
						instanceRef.pagerControl.width( instanceRef.controlHandle.width() );
					})
					.mouseup(function () {
						instanceRef.pagerControl.width( "100%" );
					})
					.wrap( "<div class='ui-handle-helper-container'></div>" ).parent();
			} else {
				this.controlHandle = this.pagerControl.find( ".ui-range-selector-handle" )
					.mousedown(function () {
						instanceRef.pagerControl.height( instanceRef.controlHandle.height() );
					})
					.mouseup(function () {
						instanceRef.pagerControl.height( "100%" );
					})
					.wrap( "<div class='ui-handle-helper-container'></div>" ).parent();
			}

			// Adjust overflow to hidden now that the range selector manages content navigation
			this.viewContainer.css( "overflow", "hidden" );
		},

		/**
		 * Horizontal movement processor
		 */
		_horizontalMovementProcessor: function (evtObj, uiState) {
			this._moveHorizontally(uiState.value, this.settings.motionDuration);
		},

		/**
		 * Vertical movement processor
		 */
		_verticalMovementProcessor: function (evtObj, uiState) {
			this._moveVertically(uiState.value, this.settings.motionDuration);
		},

		/**
		 * Pointerwheel processor: computes scroll animation
		 */
		_pointerwheelProcessor: function (evtObj, scrollDelta) {
			var pageTransition = false;
			var duration = this.settings.motionDuration;
			var moveQuantity = scrollDelta * this.settings.movementFactor;
			if(this.settings.orientation == "horizontal") {
				var movement = this._normalizeMovementQuantity(-moveQuantity);
				this._moveHorizontally(movement.quantity, duration);
			} else {
				var movement = this._normalizeMovementQuantity(moveQuantity);
				this._moveVertically(movement.quantity, duration);
			}
			return movement.transition;
		},

		/**
		 * Normalizes the movement quantity based on the boundaries of the range selector values
		 */
		_normalizeMovementQuantity: function (moveQuantity) {
			var pageTransition = false;
			var pagerValue = parseInt(this.pagerControl.rangeSelector('value')) + moveQuantity;
			if (pagerValue < 0) {
				pagerValue = 0;
				pageTransition = true;
			}
			if (pagerValue > 100) {
				pagerValue = 100;
				pageTransition = true;
			}
			this.pagerControl.rangeSelector('value', pagerValue);
			return {quantity: pagerValue, transition: pageTransition };
		},

		/**
		 * Moves content horizontally by percentage
		 */
		_moveHorizontally: function(pagerValue, duration) {
			if ( this.viewContent.width() > this.viewContainer.width() ) {
				var displacement = Math.round(
					pagerValue / 100 * ( this.viewContainer.width() - this.viewContent.width() )
				);
				this._moveHorizontalDisplacement(displacement, duration);
			} else {
				this.viewContent.css( "margin-left", 0 );
			}
		},

		/**
		 * Moves content vertically by percentage
		 */
		_moveVertically: function (pagerValue, duration) {
			if ( this.viewContent.height() > this.viewContainer.height() ) {
				var displacement = Math.round(
					(100 - pagerValue) / 100 * ( this.viewContainer.height() - this.viewContent.height() )
				);
				this._moveVerticalDisplacement(displacement, duration);
			} else {
				this.viewContent.css( "margin-top", 0 );
			}
		},

		/**
		 * Moves content horizontally by a specific displacement
		 * @param displacement
		 * @param duration
		 */
		_moveHorizontalDisplacement: function (displacement, duration) {
			this.viewContent.animate(
				{
					"margin-left":  displacement + "px"
				}, {
					duration: duration/displacement,
					easing: this.settings.animationStyle
				});
		},

		/**
		 * Moves content vertically by a specific displacement
		 * @param displacement
		 * @param duration
		 */
		_moveVerticalDisplacement: function (displacement, duration) {
			this.viewContent.animate(
				{
					"margin-top": displacement + "px"
				}, {
					duration: duration/displacement,
					easing: this.settings.animationStyle
				});
		},

		/**
		 * Displays the pager when required
		 */
		_displayPager: function () {
			// Compute dimensional differences to determine if the pager is needed
			var horizontalDifference = this.wrapperElement.width() - this.viewContent.width();
			var verticalDifference = this.wrapperElement.height() - this.viewContent.height();

			// If the content exceeds the allowed width or height, activate the pager
			if( ( (this.settings.orientation == "horizontal") && (horizontalDifference < 0) ) || ( (this.settings.orientation == "vertical") && ( verticalDifference < 0) ) ) {
				// Set the active flag to true, indicating pager attachment
				this.pagerEnabled = true;
				this.pagerTrack.show();
				this.viewContent.addClass('with-pager-track');
				// Initialize pager size
				var instanceRef = this;
				setTimeout( function () { instanceRef._adjustPagerSize()} , 20 );// browsers like Safari need a delay
			} else {
				if (this.pagerEnabled === true) {
					this.pagerEnabled = false;
					this.pagerTrack.hide();
					this.viewContent.removeClass('.with-pager-track');
				}
			}
			// Size the content to accommodate the range selector, or remove space for it
			this._adjustContentSize();
		},

		/**
		 * Resizes content based on the width of the vertical pager
		 * TODO: Seeking feedback on resizing a horizontal pager.
		 *       Most designs might account for that height,
		 *       but this could offer more convenience.
		 */
		_adjustContentSize: function () {
			if(this.settings.orientation == "horizontal") {
				// TODO: Yes, perhaps I'll implement this... not strictly essential
			} else {
				if (this.pagerEnabled === true) {
					this.viewContent.css("width", this.viewContainer.width() - (this.pagerTrack.outerWidth(true)));
				} else {
					this.viewContent.css("width", "100%");
				}
			}
		},

		/**
		 * Adjusts pager and handle proportionally to content dimensions
		 */
		_adjustPagerSize: function () {
			if(this.settings.orientation == "horizontal") {
				var indicatorSize = this._computePagerIndicatorSize(this.viewContent.width(), this.viewContainer.width());
				this.pagerControl.find( ".ui-range-selector-handle" ).css({
					width: indicatorSize,
					"margin-left": -indicatorSize / 2
				});
				this.controlHandle.width( "" ).width( this.pagerControl.width() - indicatorSize );
			} else {
				var indicatorSize = this._computePagerIndicatorSize(this.viewContent.height(), this.viewContainer.height());
				this.pagerControl.find( ".ui-range-selector-handle" ).css({
					height: indicatorSize,
					"margin-top": -(indicatorSize / 2)
				});
				this.controlHandle.height( "" ).height( this.pagerControl.height() - indicatorSize ).css("margin-top", indicatorSize+'px');
			}
		},

		/**
		 * Calculation for handle size.
		 */
		_computePagerIndicatorSize: function (contentDim, panelDim) {
			var surplus = contentDim - panelDim;
			var ratio = surplus / contentDim;
			var indicatorSize = panelDim - ( ratio * panelDim );
			return indicatorSize;
		},

		/**
		 * Reset range selector value based on content position
		 */
		_resetControlValue: function () {
			if(this.settings.orientation == "horizontal"){
				var surplus = this.viewContainer.width() - this.viewContent.width();
				var leftPosition = this.viewContent.css( "margin-left" ) === "auto" ? 0 :
					parseInt( this.viewContent.css( "margin-left" ) );
				var percentage = Math.round( leftPosition / surplus * 100 );
				this.pagerControl.rangeSelector( "value", percentage );
			} else {
				var surplus = this.viewContainer.height() - this.viewContent.height();
				var topPosition = this.viewContent.css( "margin-top" ) === "auto" ? 0 :
					parseInt( this.viewContent.css( "margin-top" ) );
				var percentage = Math.round( topPosition / surplus * 100 );
				this.pagerControl.rangeSelector( "value", 100 - percentage );
			}
		},

		/**
		 * Expose more content if the container expands
		 */
		_repositionContent: function () {
			if(this.settings.orientation == "horizontal"){
				var visibleArea = this.viewContent.width() + parseInt( this.viewContent.css( "margin-left" ), 10 );
				var gap = this.viewContainer.width() - visibleArea;
				if ( gap > 0 ) {
					this.viewContent.css( "margin-left", parseInt( this.viewContent.css( "margin-left" ), 10 ) + gap );
				}
			} else {
				var visibleArea = this.viewContent.height() + parseInt( this.viewContent.css( "margin-top" ), 10 );
				var gap = this.viewContainer.height() - visibleArea;
				if ( gap > 0 ) {
					this.viewContent.css( "margin-top", parseInt( this.viewContent.css( "margin-top" ), 10 ) + gap );
				}
			}
		},

		/**
		 * Manages all considerations related to resizing the content or container
		 */
		resize: function () {
			this._displayPager();
			if(this.pagerEnabled) {
				this._resetControlValue();
				this._repositionContent();
			}
		},

		/**
		 * Page to a specific offset
		 */
		pageToOffset: function (offsetValue) {
			if(this.settings.orientation == "horizontal") {
				// Compute how much content is outside the viewport
				var displacement = this.calculateDisplacementToOffset( offsetValue, this.viewContent.width(), this.wrapperElement.width());
				this._moveHorizontalDisplacement(displacement, this.settings.motionDuration);
			} else {
				// Compute how much content is outside the viewport
				var displacement = this.calculateDisplacementToOffset( offsetValue, this.viewContent.height(), this.wrapperElement.height());
				this._moveVerticalDisplacement(displacement, this.settings.motionDuration);
			}
		},

		/**
		 *
		 * @param viewportDimension
		 * @param contentDimension
		 */
		calculateDisplacementToOffset: function (distanceValue, contentDimension, viewportDimension) {
			var contentRemainder = contentDimension - distanceValue;
			var remainder = viewportDimension - contentRemainder;
			var actualDisplacement = distanceValue;
			if ( remainder < 0 ) {
				actualDisplacement = distanceValue + remainder;
			}
			return actualDisplacement;
		},

		/**
		 * Restore the DOM to its state before pager utilization
		 */
		destroy: function () {
			this.wrapperChildren.detach();
			this.wrapperElement.empty();
			this.wrapperElement.append(this.wrapperChildren);
		},

		/**
		 * Permit configuration updates after initialization
		 */
		_setOption: function (configKey, configValue) {
			// Apply base behavior
			$fw.Widget.prototype._setOption.apply(this, arguments);
			// Apply specific behavior
			switch(configKey) {
				case 'contentHeight':
					this.viewContent.css("height", configValue);
					this._adjustPagerSize();
					break;
			}
		}
	})
})(jQuery);