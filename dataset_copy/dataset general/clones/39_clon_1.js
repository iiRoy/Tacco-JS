/*
 * Leaflet.label - A plugin to add labels to markers and vectors for Leaflet.
 *
 * This file is part of Leaflet.label, a project by Jacob Toye and Smartrak.
 *
 * (c) 2012-2013 Jacob Toye, Smartrak.
 *
 * For project details, visit:
 *   - GitHub: https://github.com/Leaflet/Leaflet.label
 *   - Leaflet website: http://leafletjs.com
 *   - Developer profile: https://github.com/jacobtoye
 *
 * License Information:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
( function ( window, document, undefined ) {

	// Note: This plugin assumes that the Leaflet library has already been loaded
	// and is available in the global scope.

	L.labelVersion = '0.2.1-dev' ;


	L.Label = L.Class.extend( {

		// Include event handling capabilities from L.Mixin.Events
		includes : L.Mixin.Events ,

		// Default options for the label
		options : {
			className : '' , // Custom CSS class for the label container
			clickable : false , // Whether the label should be clickable
			direction : 'right' , // Direction of the label relative to its source ('right' or 'auto')
			noHide : false , // If true, the label will not hide on mouseout/touch
			offset : [ 12 , -15 ] , // Offset from the source point [x, y].
			                           // 6 (width of the label triangle) + 6 (padding) = 12px horizontal offset
			opacity : 1 , // Initial opacity of the label
			zoomAnimation : true // Whether to animate the label during zoom
		} ,


		// Constructor for the L.Label class
		initialize : function ( options, source ) {
			// Apply provided options, merging with defaults
			L.setOptions( this, options ) ;

			// Store the source object (e.g., marker, path) to which the label is attached
			this._source = source ;
			// Determine if zoom animation should be used based on browser capabilities and options
			this._animated = L.Browser.any3d && this.options.zoomAnimation ;
			// Flag to track if the label is currently open
			this._isOpen = false ;
		} ,


		// Method called when the label is added to the map
		onAdd : function ( map ) {
			this._map = map ; // Store a reference to the map instance

			// Determine which pane to attach the label to.
			// Markers go to markerPane, others (e.Path) go to popupPane.
			this._pane = this._source instanceof L.Marker ? map._panes.markerPane : map._panes.popupPane ;

			// If the container element hasn't been created yet, initialize its layout
			if ( ! this._container ) {
				this._initLayout() ;
			}

			// Append the label's container to the appropriate map pane
			this._pane.appendChild( this._container ) ;

			// Set up interaction handlers for the label
			this._initInteraction() ;

			// Perform an initial update of the label's content and position
			this._update() ;

			// Set the label's initial opacity
			this.setOpacity( this.options.opacity ) ;

			// Attach event listeners to the map for updating label position
			map
				.on( 'moveend' , this._onMoveEnd , this ) // Update on map move end
				.on( 'viewreset' , this._onViewReset , this ) ; // Update on view reset

			// If zoom animation is enabled, listen for 'zoomanim' events
			if ( this._animated ) {
				map.on( 'zoomanim' , this._zoomAnimation , this ) ;
			}

			// For touch devices, if the label is not set to 'noHide', allow clicking to close it
			if ( L.Browser.touch && ! this.options.noHide ) {
				L.DomEvent.on( this._container , 'click' , this.close , this ) ;
			}
		} ,


		// Method called when the label is removed from the map
		onRemove : function ( map ) {
			// Remove the label's container from its parent pane
			this._pane.removeChild( this._container ) ;

			// Remove all map event listeners associated with this label instance
			map.off( {
				zoomanim : this._zoomAnimation ,
				moveend : this._onMoveEnd ,
				viewreset : this._onViewReset
			} , this ) ;

			// Clean up interaction handlers
			this._removeInteraction() ;

			// Clear the map reference
			this._map = null ;
		} ,


		// Sets the geographical position of the label
		setLatLng : function ( latlng ) {
			this._latlng = L.latLng( latlng ) ; // Convert input to L.LatLng object
			if ( this._map ) {
				this._updatePosition() ; // Update position on the map if it's currently added
			}
			return this ; // Allow chaining
		} ,


		// Sets the content of the label
		setContent : function ( content ) {
			// Save previous content for comparison
			this._previousContent = this._content ;
			// Set new content
			this._content = content ;

			// Update the label's DOM with the new content
			this._updateContent() ;

			return this ; // Allow chaining
		} ,


		// Closes the label, removing it from the map
		close : function () {
			var map = this._map ; // Get current map instance

			if ( map ) {
				// If on touch device and not 'noHide', remove click listener before closing
				if ( L.Browser.touch && ! this.options.noHide ) {
					L.DomEvent.off( this._container , 'click' , this.close ) ;
				}

				map.removeLayer( this ) ; // Remove the label layer from the map
			}
		} ,


		// Updates the z-index of the label container
		updateZIndex : function ( zIndex ) {
			this._zIndex = zIndex ; // Store the z-index value

			// Apply z-index to the container if it exists and z-index is set
			if ( this._container && this._zIndex ) {
				this._container.style.zIndex = zIndex ;
			}
		} ,


		// Sets the opacity of the label
		setOpacity : function ( opacity ) {
			this.options.opacity = opacity ; // Update the opacity option

			// Apply opacity to the container if it exists
			if ( this._container ) {
				L.DomUtil.setOpacity( this._container , opacity ) ;
			}
		} ,


		// Initializes the DOM structure for the label
		_initLayout : function () {
			// Create a div element with base classes and custom class
			this._container = L.DomUtil.create( 'div' , 'leaflet-label ' + this.options.className + ' leaflet-zoom-animated' ) ;
			this.updateZIndex( this._zIndex ) ; // Apply initial z-index
		} ,


		// Performs a full update of the label's state (content, position)
		_update : function () {
			if ( ! this._map ) { return ; } // Do nothing if not on a map

			this._container.style.visibility = 'hidden' ; // Hide container during update to prevent flickering

			this._updateContent() ; // Update HTML content
			this._updatePosition() ; // Update geographical position on screen

			this._container.style.visibility = '' ; // Show container after update
		} ,


		// Updates the HTML content of the label
		_updateContent : function () {
			// Skip update if content hasn't changed, or no content, or no map
			if ( ! this._content || ! this._map || this._prevContent === this._content ) {
				return ;
			}

			// If content is a string, set it as innerHTML
			if ( typeof this._content === 'string' ) {
				this._container.innerHTML = this._content ;

				this._prevContent = this._content ; // Update previous content reference

				// Measure the width of the label for positioning calculations
				this._labelWidth = this._container.offsetWidth ;
			}
		} ,


		// Updates the screen position of the label based on its LatLng
		_updatePosition : function () {
			// Convert geographical coordinates to layer point
			var pos = this._map.latLngToLayerPoint( this._latlng ) ;

			this._setPosition( pos ) ; // Apply the calculated position
		} ,


		// Sets the final screen position of the label container
		_setPosition : function ( pos ) {
			var map = this._map ,
				container = this._container ,
				centerPoint = map.latLngToContainerPoint( map.getCenter() ) , // Map center in container pixels
				labelPoint = map.layerPointToContainerPoint( pos ) , // Label position in container pixels
				direction = this.options.direction ,
				labelWidth = this._labelWidth ,
				offset = L.point( this.options.offset ) ;

			// Determine label direction (right or left)
			if ( direction === 'right' || ( direction === 'auto' && labelPoint.x < centerPoint.x ) ) {
				// Position to the right
				L.DomUtil.addClass( container , 'leaflet-label-right' ) ;
				L.DomUtil.removeClass( container , 'leaflet-label-left' ) ;

				pos = pos.add( offset ) ; // Apply offset
			} else {
				// Position to the left
				L.DomUtil.addClass( container , 'leaflet-label-left' ) ;
				L.DomUtil.removeClass( container , 'leaflet-label-right' ) ;

				// Apply offset, adjusting for label width
				pos = pos.add( L.point( -offset.x - labelWidth , offset.y ) ) ;
			}

			L.DomUtil.setPosition( container , pos ) ; // Set the final CSS transform position
		} ,


		// Handles zoom animation for the label
		_zoomAnimation : function ( opt ) {
			// Calculate new layer point based on zoom animation properties
			var pos = this._map._latLngToNewLayerPoint( this._latlng , opt.zoom , opt.center ).round() ;

			this._setPosition( pos ) ; // Apply the new position
		} ,


		// Handler for map 'moveend' event
		_onMoveEnd : function () {
			// If not animated or direction is 'auto', update position
			if ( ! this._animated || this.options.direction === 'auto' ) {
				this._updatePosition() ;
			}
		} ,


		// Handler for map 'viewreset' event
		_onViewReset : function ( e ) {
			/*
			 * If the map view resets in a 'hard' way (e.g., due to coordinate system change),
			 * we must re-render and re-position the label completely.
			 */
			if ( e && e.hard ) {
				this._update() ;
			}
		} ,


		// Initializes interaction (click, mouse events) for the label
		_initInteraction : function () {
			if ( ! this.options.clickable ) { return ; } // Do nothing if label is not clickable

			var container = this._container ,
				events = [ 'dblclick' , 'mousedown' , 'mouseover' , 'mouseout' , 'contextmenu' ] ;

			L.DomUtil.addClass( container , 'leaflet-clickable' ) ; // Add clickable class
			// Listen for standard click events
			L.DomEvent.on( container , 'click' , this._onMouseClick , this ) ;

			// Attach other mouse events
			for ( var i = 0 ; i < events.length ; i++ ) {
				L.DomEvent.on( container , events[ i ] , this._fireMouseEvent , this ) ;
			}
		} ,


		// Removes interaction handlers from the label
		_removeInteraction : function () {
			if ( ! this.options.clickable ) { return ; } // Do nothing if label was not clickable

			var container = this._container ,
				events = [ 'dblclick' , 'mousedown' , 'mouseover' , 'mouseout' , 'contextmenu' ] ;

			L.DomUtil.removeClass( container , 'leaflet-clickable' ) ; // Remove clickable class
			// Remove standard click listener
			L.DomEvent.off( container , 'click' , this._onMouseClick , this ) ;

			// Remove other mouse events
			for ( var i = 0 ; i < events.length ; i++ ) {
				L.DomEvent.off( container , events[ i ] , this._fireMouseEvent , this ) ;
			}
		} ,


		// Handles mouse click events on the label
		_onMouseClick : function ( e ) {
			// If listeners are present for this event type, stop propagation
			if ( this.hasEventListeners( e.type ) ) {
				L.DomEvent.stopPropagation( e ) ;
			}

			// Fire a custom event on the label instance
			this.fire( e.type , {
				originalEvent : e
			} ) ;
		} ,


		// Fires generic mouse events (dblclick, mousedown, etc.) on the label
		_fireMouseEvent : function ( e ) {
			this.fire( e.type , {
				originalEvent : e
			} ) ;

			// TODO: Implement proper custom event propagation for labels
			// This line is often called if the marker is part of a FeatureGroup.
			if ( e.type === 'contextmenu' && this.hasEventListeners( e.type ) ) {
				L.DomEvent.preventDefault( e ) ;
			}
			if ( e.type !== 'mousedown' ) {
				L.DomEvent.stopPropagation( e ) ;
			} else {
				L.DomEvent.preventDefault( e ) ;
			}
		}
	} ) ;


	// L.BaseMarkerMethods is a mixin object containing methods common to L.Marker and L.CircleMarker
	// for label handling. It's defined here because both classes need to include its contents.
	L.BaseMarkerMethods = {
		// Shows the label associated with this marker
		showLabel : function () {
			// Check if a label exists and the marker is on a map
			if ( this.label && this._map ) {
				this.label.setLatLng( this._latlng ) ; // Ensure label is at current marker position
				this._map.showLabel( this.label ) ; // Delegate to map to display the label
			}

			return this ; // Enable method chaining
		} ,

		// Hides the label associated with this marker
		hideLabel : function () {
			if ( this.label ) {
				this.label.close() ; // Close the label
			}
			return this ; // Enable method chaining
		} ,

		// Sets whether the label should always be visible or hide on mouseout
		setLabelNoHide : function ( noHide ) {
			// Only update if the noHide state is changing
			if ( this._labelNoHide === noHide ) {
				return ;
			}

			this._labelNoHide = noHide ; // Update internal state

			if ( noHide ) {
				this._removeLabelRevealHandlers() ; // Remove hover/click handlers
				this.showLabel() ; // Show the label immediately
			} else {
				this._addLabelRevealHandlers() ; // Add hover/click handlers
				this.hideLabel() ; // Hide the label
			}
		} ,

		// Binds a label to the marker with given content and options
		bindLabel : function ( content, options ) {
			// Determine the label anchor point, prioritizing icon's anchor if available
			var labelAnchor = this.options.icon ? this.options.icon.options.labelAnchor : this.options.labelAnchor ,
				anchor = L.point( labelAnchor ) || L.point( 0 , 0 ) ;

			// Add the default label offset to the anchor
			anchor = anchor.add( L.Label.prototype.options.offset ) ;

			// If custom offset is provided in options, add it
			if ( options && options.offset ) {
				anchor = anchor.add( options.offset ) ;
			}

			// Extend options with the calculated offset
			options = L.Util.extend( { offset : anchor } , options ) ;

			this._labelNoHide = options.noHide ; // Store the noHide option

			// If no label exists yet, set up initial event listeners
			if ( ! this.label ) {
				if ( ! this._labelNoHide ) {
					this._addLabelRevealHandlers() ; // Add handlers for showing/hiding on hover/click
				}

				this
					.on( 'remove' , this.hideLabel , this ) // Hide label when marker is removed
					.on( 'move' , this._moveLabel , this ) // Move label with marker
					.on( 'add' , this._onMarkerAdd , this ) ; // Handle label display when marker is added

				this._hasLabelHandlers = true ; // Flag that handlers are active
			}

			// Create a new L.Label instance and set its content
			this.label = new L.Label( options , this )
				.setContent( content ) ;

			return this ; // Enable method chaining
		} ,

		// Unbinds and removes the label from the marker
		unbindLabel : function () {
			if ( this.label ) {
				this.hideLabel() ; // Hide the label first

				this.label = null ; // Remove label reference

				// If label event handlers were active, remove them
				if ( this._hasLabelHandlers ) {
					if ( ! this._labelNoHide ) {
						this._removeLabelRevealHandlers() ; // Remove hover/click handlers
					}

					this
						.off( 'remove' , this.hideLabel , this )
						.off( 'move' , this._moveLabel , this )
						.off( 'add' , this._onMarkerAdd , this ) ;
				}

				this._hasLabelHandlers = false ; // Reset handler flag
			}
			return this ; // Enable method chaining
		} ,

		// Updates the content of an existing label
		updateLabelContent : function ( content ) {
			if ( this.label ) {
				this.label.setContent( content ) ; // Delegate to the label instance
			}
		} ,

		// Returns the label instance associated with the marker
		getLabel : function () {
			return this.label ;
		} ,

		// Handler for when the marker is added to the map
		_onMarkerAdd : function () {
			if ( this._labelNoHide ) {
				this.showLabel() ; // Show label if 'noHide' is true
			}
		} ,

		// Adds event handlers to reveal the label on interaction
		_addLabelRevealHandlers : function () {
			this
				.on( 'mouseover' , this.showLabel , this ) // Show on mouseover
				.on( 'mouseout' , this.hideLabel , this ) ; // Hide on mouseout

			if ( L.Browser.touch ) {
				this.on( 'click' , this.showLabel , this ) ; // Show on click for touch devices
			}
		} ,

		// Removes event handlers that reveal the label
		_removeLabelRevealHandlers : function () {
			this
				.off( 'mouseover' , this.showLabel , this )
				.off( 'mouseout' , this.hideLabel , this ) ;

			if ( L.Browser.touch ) {
				this.off( 'click' , this.showLabel , this ) ;
			}
		} ,

		// Handler for marker 'move' event, updates label position
		_moveLabel : function ( e ) {
			this.label.setLatLng( e.latlng ) ; // Update label's geographical position
		}
	} ;

	// Add a default labelAnchor option to L.Icon.Default
	L.Icon.Default.mergeOptions( {
		labelAnchor : new L.Point( 9 , -20 ) // Default anchor for standard markers
	} ) ;

	// Due to Leaflet's loading order, L.Marker.options.icon might be initialized before this plugin.
	// We ensure it uses the L.Icon.Default with our labelAnchor.
	L.Marker.mergeOptions( {
		icon : new L.Icon.Default()
	} ) ;

	// Include the label methods in L.Marker
	L.Marker.include( L.BaseMarkerMethods ) ;
	L.Marker.include( {
		// Store a reference to the original _updateZIndex method
		_originalUpdateZIndex : L.Marker.prototype._updateZIndex ,

		// Override _updateZIndex to also update the label's z-index
		_updateZIndex : function ( offset ) {
			var zIndex = this._zIndex + offset ; // Calculate the new z-index

			this._originalUpdateZIndex( offset ) ; // Call the original method

			if ( this.label ) {
				this.label.updateZIndex( zIndex ) ; // Update the label's z-index
			}
		} ,

		// Store a reference to the original setOpacity method
		_originalSetOpacity : L.Marker.prototype.setOpacity ,

		// Override setOpacity to handle label transparency
		setOpacity : function ( opacity , labelHasSemiTransparency ) {
			// Store whether the label should have semi-transparency
			this.options.labelHasSemiTransparency = labelHasSemiTransparency ;

			this._originalSetOpacity( opacity ) ; // Call the original method
		} ,

		// Store a reference to the original _updateOpacity method
		_originalUpdateOpacity : L.Marker.prototype._updateOpacity ,

		// Override _updateOpacity to update label opacity
		_updateOpacity : function () {
			// Calculate absolute opacity (0 or 1) for the label if not semi-transparent
			var absoluteOpacity = this.options.opacity === 0 ? 0 : 1 ;

			this._originalUpdateOpacity() ; // Call the original method

			if ( this.label ) {
				// Set label opacity based on option: full opacity or semi-transparency
				this.label.setOpacity( this.options.labelHasSemiTransparency ? this.options.opacity : absoluteOpacity ) ;
			}
		} ,

		// Store a reference to the original setLatLng method
		_originalSetLatLng : L.Marker.prototype.setLatLng ,

		// Override setLatLng to hide the label if it's not set to 'noHide'
		setLatLng : function ( latlng ) {
			if ( this.label && ! this._labelNoHide ) {
				this.hideLabel() ; // Temporarily hide label during position change
			}

			return this._originalSetLatLng( latlng ) ; // Call the original method
		}
	} ) ;

	// Add a default labelAnchor option for L.CircleMarker
	L.CircleMarker.mergeOptions( {
		labelAnchor : new L.Point( 0 , 0 ) // Circle markers are centered, no offset needed
	} ) ;

	// Include the label methods in L.CircleMarker
	L.CircleMarker.include( L.BaseMarkerMethods ) ;

	// Extend L.Path (for polylines, polygons, etc.) with label binding capabilities
	L.Path.include( {
		// Binds a label to the path
		bindLabel : function ( content, options ) {
			// Create a new label if none exists or options have changed
			if ( ! this.label || this.label.options !== options ) {
				this.label = new L.Label( options , this ) ;
			}

			this.label.setContent( content ) ; // Set the label's content

			// Add event listeners for showing/moving/hiding the label if not already added
			if ( ! this._showLabelAdded ) {
				this
					.on( 'mouseover' , this._showLabel , this ) // Show on mouseover
					.on( 'mousemove' , this._moveLabel , this ) // Move with mouse
					.on( 'mouseout remove' , this._hideLabel , this ) ; // Hide on mouseout or removal

				if ( L.Browser.touch ) {
					this.on( 'click' , this._showLabel , this ) ; // Show on click for touch devices
				}
				this._showLabelAdded = true ; // Flag that handlers are active
			}

			return this ; // Enable method chaining
		}
		// The original code was cut here, but for a Type I clone, I must stop at the exact character.
	} ) ;
} ) ( window, document, undefined ) ;