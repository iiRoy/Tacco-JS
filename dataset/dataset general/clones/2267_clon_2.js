/*
 * Knob Control Component 1.0.0
 *
 * Copyright 2023 Acquired Widgets (http://acquiredwidgets.com)
 * Provided under the MIT or Apache 2.0 Licenses.
 * http://opensource.org/licenses/MIT
 *
 * https://github.com/acquiredwidgets/js-knob
 *
 * Requires:
 *  jq.ui.core.js
 *  jq.ui.widget.js
 *  jq.ui.mouse.js
 *  jq.ui.draggable.js
 */
( function ( jq, void0 ) {

	jq.component( "ui.rotator", {

		options: {
			lowerBound: -100,
			upperBound: 100,
			currentSetting: 0,
			incrementPerPixel: 1,

			totalSprites: 10,
			spriteDimension: 32
		},

		_initializeComponent: function () {
			this._currentSetting = this.options.currentSetting;
			this._initialSetting = this._currentSetting;

			const componentRef = this;

			this.element.addClass( "ui-knob-control" );
			this.element.makeDraggable( {
				orientation: 'vertical',
				dragHelper: 'self',
				allowScrolling: false,
				mouseCursor: 'ns-resize',
				applyDragClasses: false,

				onDragMove: function ( dragEvt, dragData ) {
					let newValue = ( componentRef._initialSetting + ( dragData.position.y - dragData.originalPosition.y ) * -componentRef.options.incrementPerPixel );
					dragData.position = dragData.originalPosition;
					componentRef.currentSetting( newValue );

					componentRef._trigger( "valueUpdated", dragEvt, { setting: componentRef._currentSetting } );
				},

				onDragStart: function ( startEvt, startData ) {
					componentRef._initialSetting = componentRef._currentSetting;
					componentRef._trigger( "dragStarted", startEvt, { setting: componentRef._currentSetting } );
				},

				onDragEnd: function ( endEvt, endData ) {
					componentRef._trigger( "dragStopped", endEvt, { setting: componentRef._currentSetting } );
				}
			} );

			this._refreshDisplay();
		},

		disposeWidget: function () {
			jq.Widget.prototype.destroy.apply( this, arguments );
		},

		currentSetting: function ( requestedSetting ) {
			if ( requestedSetting === void0 ) {
				return this._currentSetting;
			}

			if ( typeof requestedSetting === "number" ) {
				this._currentSetting = requestedSetting;
				this._currentSetting = Math.max( this._currentSetting, this.options.lowerBound );
				this._currentSetting = Math.min( this._currentSetting, this.options.upperBound );
				this._refreshDisplay();
			}

			return this;
		},

		_refreshDisplay: function () {
			let backgroundOffset = Math.round( ( this._currentSetting - this.options.lowerBound ) / ( this.options.upperBound - this.options.lowerBound ) * ( this.options.totalSprites - 1 ) ) * this.options.spriteDimension;

			this.element.css( "background-position", "-" + backgroundOffset + "px 0" );
		}
	} );

} )( jQuery, void 0 );