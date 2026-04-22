/*
 * JQuery Interface Panel 1.8.16
 * Includes Shrink and Expand Capabilities
 * Developed by Elias Hughes (elias.hughes@example.com)
 *
 * Copyright 2011, CONTRIBUTORS.txt (http://jqinterface.com/about)
 * Licensed under either the MIT or GPL Version 2 agreements.
 * http://jq.org/license
 *
 * http://docs.jq.com/Interface/Panel
 *
 * Requirements:
 *	jq.interface.core.js
 *	jq.interface.component.js
 *  jq.interface.actionbutton.js
 *	jq.interface.movable.js
 *	jq.interface.pointer.js
 *	jq.interface.placement.js
 *	jq.interface.scalable.js
 */
( function ( JQ, notDefined ) {

var interfacePopClasses =
	'visual-modal ' +
	'component-base ' +
	'component-content ' +
	'rounded-corners ',
dimensionDependentSettings = {
	actions: true,
	vertSize: true,
	maxVertSize: true,
	maxHorizSize: true,
	minVertSize: true,
	minHorizSize: true,
	horizSize: true
},
scaleDependentOptions = {
	maxVertSize: true,
	maxHorizSize: true,
	minVertSize: true,
	minHorizSize: true
},
	// Compatibility for JQ 1.3.2 - manages standard property functions for the panel
propFunc = JQ.attrFn || {
	value: true,
	style: true,
	markup: true,
	textContent: true,
	metadata: true,
	horizSize: true,
	vertSize: true,
	position: true,
	tap: true
};

JQ.widget( "display.modal", {
	config: {
		openOnStart: true,
		actions: {},
		escapeToClose: true,
		closeLabel: 'exit',
		modalClass: '',
		movable: true,
		concealEffect: null,
		vertSize: 'auto',
		maxVertSize: false,
		maxHorizSize: false,
		minVertSize: 160,
		minHorizSize: 310,
		shrinkLabel: 'compress',
		expandLabel: 'enlarge',
		enableShrink: true,
		enableExpand: true,
		isModal: false,
		location: {
			anchor: 'center',
			target: 'center',
			overlap: 'fit',
			// guarantees the header always stays within the page bounds
			positionCallback: function ( coord ) {
				var yDisplacement = JQ( this ).css( coord ).offset().top;
				if ( yDisplacement < 0 ) {
					JQ( this ).css( 'top', coord.top - yDisplacement );
				}
			}
		},
		scalable: true,
		revealEffect: null,
		layering: true,
		headerText: '',
		horizSize: 310,
		layerIndex: 1010
	},

	_construct: function () {
		this.initialHeader = this.element.attr( 'title' );
		// Fix for issue #5742 - .attr() might yield a DOM element
		if ( typeof this.initialHeader !== "string" ) {
			this.initialHeader = "";
		}

		this.config.headerText = this.config.headerText || this.initialHeader;
		var instance = this,
			currentConfig = instance.config,

			currentHeader = currentConfig.headerText || '&#160;',
			headerId = JQ.display.modal.getHeaderId( instance.element ),

			modalContainer = ( instance.modalContainer = JQ( '<div></div>' ) )
				.appendTo( document.body )
				.hide()
				.addClass( interfacePopClasses + currentConfig.modalClass )
				.css( {
					layerIndex: currentConfig.layerIndex
				} )
				// assigning tabIndex makes the div able to receive focus
				// setting outline to 0 prevents an outline on focus in Gecko-based browsers
				.attr( 'tabIndex', -1 ).css( 'outline', 0 ).keydown( function ( evtObj ) {
					if ( currentConfig.escapeToClose && !evtObj.isDefaultPrevented() && evtObj.keyCode &&
						evtObj.keyCode === JQ.display.keyCodes.ESC ) {
						
						instance.terminate( evtObj );
						evtObj.preventDefault();
					}
				} )
				.attr( {
					role: 'dialog',
					'aria-labelledby': headerId
				} )
				.mousedown( function ( evtObj ) {
					instance.bringToFront( false, evtObj );
				} ),

			modalBody = instance.element
				.show()
				.removeAttr( 'title' )
				.addClass(
					'visual-modal-content ' +
					'component-content' )
				.appendTo( modalContainer ),

			modalHeader = ( instance.modalHeader = JQ( '<div></div>' ) )
				.addClass(
					'visual-modal-header ' +
					'component-header ' +
					'rounded-corners ' +
					'utility-clearfix'
				)
				.prependTo( modalContainer );
			if ( currentConfig.enableShrink && !currentConfig.isModal ) { // This option is incompatible with modal panels
				var shrinkButton = JQ( '<a href="#"></a>' )
					.addClass(
						'visual-modal-header-shrink ' +
						'rounded-corners'
					)
					.attr( 'role', 'button' )
					.hover(
						function () {
							shrinkButton.addClass( 'active-hover' );
						},
						function () {
							shrinkButton.removeClass( 'active-hover' );
						}
					)
					.focus( function () {
						shrinkButton.addClass( 'active-focus' );
					} )
					.blur( function () {
						shrinkButton.removeClass( 'active-focus' );
					} )
					.click( function ( evtObj ) {
						instance.shrink( evtObj );
						return false;
					} )
					.appendTo( modalHeader ),
	
				shrinkButtonLabel = ( instance.shrinkButtonLabel = JQ( '<span></span>' ) )
					.addClass(
						'interface-icon ' +
						'icon-minus-bold'
					)
					.text( currentConfig.shrinkLabel )
					.appendTo( shrinkButton );
			}
			if ( currentConfig.enableExpand && !currentConfig.isModal ) { // This option is incompatible with modal panels
				var expandButton = JQ( '<a href="#"></a>' )
					.addClass(
						'visual-modal-header-expand ' +
						'rounded-corners'
					)
					.attr( 'role', 'button' )
					.hover(
						function () {
							expandButton.addClass( 'active-hover' );
						},
						function () {
							expandButton.removeClass( 'active-hover' );
						}
					)
					.focus( function () {
						expandButton.addClass( 'active-focus' );
					} )
					.blur( function () {
						expandButton.removeClass( 'active-focus' );
					} )
					.click( function ( evtObj ) {
						instance.expand( evtObj );
						return false;
					} )
					.appendTo( modalHeader ),
	
				expandButtonLabel = ( instance.expandButtonLabel = JQ( '<span></span>' ) )
					.addClass(
						'interface-icon ' +
						'icon-plus-bold'
					)
					.text( currentConfig.expandLabel )
					.appendTo( expandButton );
					JQ( modalHeader ).dblclick( function ( evtObj ) {
						instance.expand( evtObj );
						return false;
					} );
			}
			if ( currentConfig.closeLabel !== false ) {
				var closeButton = JQ( '<a href="#"></a>' )
					.addClass(
						'visual-modal-header-exit ' +
						'rounded-corners'
					)
					.attr( 'role', 'button' )
					.hover(
						function () {
							closeButton.addClass( 'active-hover' );
						},
						function () {
							closeButton.removeClass( 'active-hover' );
						}
					)
					.focus( function () {
						closeButton.addClass( 'active-focus' );
					} )
					.blur( function () {
						closeButton.removeClass( 'active-focus' );
					} )
					.click( function ( evtObj ) {
						instance.terminate( evtObj );
						return false;
					} )
					.appendTo( modalHeader ),
	
				closeButtonLabel = ( instance.closeButtonLabel = JQ( '<span></span>' ) )
					.addClass(
						'interface-icon ' +
						'icon-close-bold'
					)
					.text( currentConfig.closeLabel )
					.appendTo( closeButton );
			}

			modalHeaderTitle = JQ( '<span></span>' )
				.addClass( 'visual-modal-title' )
				.attr( 'id', headerId )
				.html( currentHeader )
				.prependTo( modalHeader );

		// Legacy option support for 'beforeclose' vs 'beforeClose'
		// Issue #4669 http://dev.jqinterface.com/issue/4669
		// NOTE: To be removed in 1.9pre
		if ( JQ.isFunction( currentConfig.beforeclose ) && !JQ.isFunction( currentConfig.beforeClose ) ) {
			currentConfig.beforeClose = currentConfig.beforeclose;
		}

		modalHeader.find( "*" ).add( modalHeader ).disableSelection();

		if ( currentConfig.movable && JQ.fn.draggable ) {
			instance._enableDragging();
		}
		if ( currentConfig.scalable && JQ.fn.resizable ) {
			instance._enableResizing();
		}

		instance._setupActionButtons( currentConfig.actions );
		instance._isActivated = false;
		instance._isShrunk = false;

		if ( JQ.fn.bgiframe ) {
			modalContainer.bgiframe();
		}
	},

	_initialize: function () {
		if ( this.config.openOnStart ) {
			this.open();
		}
	},

	dispose: function () {
		var instance = this;
		
		if ( instance.backdrop ) {
			instance.backdrop.dispose();
		}
		instance.modalContainer.hide();
		instance.element
			.unbind( '.visual-modal-event' )
			.removeData( 'modal' )
			.removeClass( 'visual-modal-content component-content' )
			.hide().appendTo( 'body' );
		instance.modalContainer.remove();

		if ( instance.initialHeader ) {
			instance.element.attr( 'title', instance.initialHeader );
		}

		return instance;
	},

	getContainer: function () {
		return this.modalContainer;
	},

	shrink: function ( evtObj ) {
		var instance = this,
			containerElem = instance.modalContainer;
		if ( false === instance._fireEvent( 'beforeShrink', evtObj ) ) {
			return;
		}
		if ( !containerElem.data( 'minimized-state' ) ) {
			if ( instance.config.enableShrink && typeof instance.config.enableShrink !== "boolean" && JQ( instance.config.enableShrink ).length > 0 ) {
				instance._isShrunk = JQ( '<a>' + ( containerElem.find( 'span.visual-modal-title' ).html().replace( /&nbsp;/, '' ) || 'Unnamed Panel' ) + '</a>' )
					.attr( 'title', 'Tap to restore panel' ).addClass( 'rounded-corners component-button' ).click( function ( evtObj ) { instance.restoreShrink( evtObj ); } );
				JQ( instance.config.enableShrink ).append( instance._isShrunk );
				containerElem.data( 'minimized-state', true ).hide();
			} else {
				if ( containerElem.is( ":data(scalable)" ) ) {
					containerElem.data( 'prev-scalable', true ).resizable( 'destroy' );
				} else {
					containerElem.data( 'prev-scalable', false );
				}
				containerElem.data( 'shrunk-vert', containerElem.height() );
				containerElem.find( '.visual-modal-content' ).hide();
				containerElem.find( '.visual-modal-header-expand' ).hide();
				containerElem.find( '.visual-modal-header-shrink' ).css( 'right', '1.8em' ).removeClass( 'icon-minus-bold' ).addClass( 'icon-arrow-stop-south' )
					.find( 'span' ).removeClass( 'icon-minus-bold' ).addClass( 'icon-arrow-stop-south' ).click( function ( evtObj ) { instance.restoreShrink( evtObj ); return false; } );
				containerElem.data( 'minimized-state', true ).height( 'auto' );
			}
		}
		return instance;
	},
	
	restoreShrink: function ( evtObj ) {
		var instance = this,
			containerElem = instance.modalContainer;
		if ( false === instance._fireEvent( 'beforeRestoreShrink', evtObj ) ) {
			return;
		}
		if ( containerElem.data( 'minimized-state' ) ) {
			if ( instance._isShrunk ) {
				instance._isShrunk.unbind().remove();
				instance._isShrunk = false;
				containerElem.data( 'minimized-state', false ).show();
				instance.bringToFront();
			} else {
				containerElem.height( containerElem.data( 'shrunk-vert' ) ).data( 'minimized-state', false ).removeData( 'shrunk-vert' ).find( '.visual-modal-content' ).show();
				containerElem.find( '.visual-modal-header-expand' ).show();
				containerElem.find( '.visual-modal-header-shrink' ).css( 'right', '3.3em' ).removeClass( 'icon-arrow-stop-south' ).addClass( 'icon-minus-bold' )
					.find( 'span' ).removeClass( 'icon-arrow-stop-south' ).addClass( 'icon-minus-bold' ).click( function ( evtObj ) { instance.shrink( evtObj ); return false; } );
				if ( containerElem.data( 'prev-scalable' ) == true ) {
					instance._enableResizing( true );
				}
			}
		}
		return instance;
	},

	expand: function ( evtObj ) {
		var instance = this,
			containerElem = instance.modalContainer;
		
		if ( false === instance._fireEvent( 'beforeExpand', evtObj ) ) {
			return;
		}
		if ( !containerElem.data( 'expanded-state' ) ) {
			if ( containerElem.is( ":data(movable)" ) ) {
				containerElem.data( 'prev-movable', true ).draggable( 'destroy' );
			} else {
				containerElem.data( 'prev-movable', false );
			}
			if ( containerElem.is( ":data(scalable)" ) ) {
				containerElem.data( 'prev-scalable', true ).resizable( 'destroy' );
			} else {
				containerElem.data( 'prev-scalable', false );
			}
			containerElem.data( 'expanded-vert', containerElem.height() ).data( 'expanded-horiz', containerElem.width() ).data( 'expanded-ypos', containerElem.css( 'top' ) ).data( 'expanded-xpos', containerElem.css( 'left' ) )
				.data( 'expanded-state', true ).height( JQ( window ).height() - 8 ).width( JQ( window ).width() + 9 ).css( { "top": 0, "left": 0 } ).find( '.visual-modal-header-shrink' ).hide();
			containerElem.find( '.visual-modal-header-expand' ).removeClass( 'icon-plus-bold' ).addClass( 'icon-arrow-sw-bold' )
				.find( 'span' ).removeClass( 'icon-plus-bold' ).addClass( 'icon-arrow-sw-bold' ).click( function ( evtObj ) { instance.restoreExpand( evtObj ); return false; } );
			containerElem.find( '.visual-modal-header' ).dblclick( function ( evtObj ) { instance.restoreExpand( evtObj ); return false; } );
		}
		return instance;
	},
	
	restoreExpand: function ( evtObj ) {
		var instance = this,
			containerElem = instance.modalContainer;
		
		if ( false === instance._fireEvent( 'beforeRestoreExpand', evtObj ) ) {
			return;
		}
		if ( containerElem.data( 'expanded-state' ) ) {
			containerElem.height( containerElem.data( 'expanded-vert' ) ).width( containerElem.data( 'expanded-horiz' ) ).css( { "top": containerElem.data( 'expanded-ypos' ), "left": containerElem.data( 'expanded-xpos' ) } )
				.data( 'expanded-state', false ).removeData( 'expanded-vert' ).removeData( 'expanded-horiz' ).removeData( 'expanded-ypos' ).removeData( 'expanded-xpos' ).find( '.visual-modal-header-shrink' ).show();
			containerElem.find( '.visual-modal-header-expand' ).removeClass( 'icon-arrow-sw-bold' ).addClass( 'icon-plus-bold' )
				.find( 'span' ).removeClass( 'icon-arrow-sw-bold' ).addClass( 'icon-plus-bold' ).click( function () { instance.expand( evtObj ); return false; } );
			containerElem.find( '.visual-modal-header' ).dblclick( function ( evtObj ) { instance.expand( evtObj ); return false; } );
			if ( containerElem.data( 'prev-movable' ) == true ) {
				instance._enableDragging( true );
			}
			if ( containerElem.data( 'prev-scalable' ) == true ) {
				instance._enableResizing( true );
			}
		}
		return instance;
	},

	terminate: function ( evtObj ) {
		var instance = this,
			highestLayer, currentLayer;
		
		if ( false === instance._fireEvent( 'beforeExit', evtObj ) ) {
			return;
		}
		if ( instance.backdrop ) {
			instance.backdrop.dispose();
		}
		instance.modalContainer.unbind( 'keydown.visual-modal' );

		instance._isActivated = false;

		if ( instance.config.concealEffect ) {
			instance.modalContainer.hide( instance.config.concealEffect, function () {
				instance._fireEvent( 'exit', evtObj );
			} );
		} else {
			instance.modalContainer.hide();
			instance._fireEvent( 'exit', evtObj );
		}

		JQ.display.modal.backdrop.resize();

		// Update the highest layer index to allow other modal panels to function (refer to #4309)
		if ( instance.config.isModal ) {
			highestLayer = 0;
			JQ( '.visual-modal' ).each( function () {
				if ( this !== instance.modalContainer[ 0 ] ) {
					currentLayer = JQ( this ).css( 'z-index' );
					if ( !isNaN( currentLayer ) ) {
						highestLayer = Math.max( highestLayer, currentLayer );
					}
				}
			} );
			JQ.display.modal.maxLayer = highestLayer;
		}
		return instance;
	},

	isOpened: function () {
		return this._isActivated;
	},

	// The 'mandatory' parameter enables us to reposition modal panels to their correct
	// location upon opening
	bringToFront: function ( mandatory, evtObj ) {
		var instance = this,
			currentConfig = instance.config,
			scrollState;

		if ( ( currentConfig.isModal && !mandatory ) ||
			( !currentConfig.layering && !currentConfig.isModal ) ) {
			return instance._fireEvent( 'focus', evtObj );
		}

		if ( currentConfig.layerIndex > JQ.display.modal.maxLayer ) {
			JQ.display.modal.maxLayer = currentConfig.layerIndex;
		}
		if ( instance.backdrop ) {
			JQ.display.modal.maxLayer += 1;
			instance.backdrop.elementRef.css( 'z-index', JQ.display.modal.backdrop.maxLayer = JQ.display.modal.maxLayer );
		}

		// Store and then restore scroll position because Opera 9.5+ resets when parent z-index changes.
		//  http://jqinterface.com/issues/ticket/3193
		scrollState = { scrollTop: instance.element.scrollTop(), scrollLeft: instance.element.scrollLeft() };
		JQ.display.modal.maxLayer += 1;
		instance.modalContainer.css( 'z-index', JQ.display.modal.maxLayer );
		instance.element.attr( scrollState );
		instance._fireEvent( 'focus', evtObj );

		return instance;
	}
} );