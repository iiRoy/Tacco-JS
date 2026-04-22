(function (globalWindow, documentRef, undefinedGlobal) {
/*
 * Leaflet.label, a plugin that adds labels to markers and vectors for Leaflet powered maps.
 * (c) 2012-2013, Jacob Toye, Smartrak
 *
 * This modified version is a Type III clone.
 * It features extensive renaming, structural modifications, and altered logic
 * while retaining core functionality.
 *
 * Original project: https://github.com/Leaflet/Leaflet.label
 * Original Leaflet site: http://leafletjs.com
 * Original author: https://github.com/jacobtoye
 *
 * License: MIT License (as per original project)
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// This implementation assumes that the Leaflet core library is already available.

L.overlayTextVersion = '1.0.0-rc1'; // Updated version for the clone

/**
 * Utility to manage DOM class names.
 * @param {HTMLElement} element - The DOM element.
 * @param {string} className - The class name to manage.
 * @param {boolean} add - True to add, false to remove.
 */
const _manageDomClass = (element, className, add) => {
    if (!element || !className) return;
    if (add) {
        L.DomUtil.addClass(element, className);
    } else {
        L.DomUtil.removeClass(element, className);
    }
};

L.FloatingTextOverlay = L.Class.extend({

	mixins: [L.Mixin.Events], // Renamed 'includes' to 'mixins'

	config: { // Renamed 'options' to 'config'
		displayClass: '',
		isInteractive: false,
		placementDirection: 'right', // 'right', 'left', 'auto'
		alwaysVisible: false,
		positionOffset: [12, -15], // Base offset: 6 (triangle width) + 6 (padding)
		transparencyLevel: 1,
		animateOnZoom: true
	},

	initInstance: function (opts, originObject) { // Renamed 'initialize' to 'initInstance', 'options' to 'opts', 'source' to 'originObject'
		L.setOptions(this, opts); // Uses L.setOptions to apply config

		this._originObject = originObject;
		this._animCapable = L.Browser.any3d && this.config.animateOnZoom;
		this._isVisible = false; // Renamed '_isOpen' to '_isVisible'
	},

	addToMap: function (activeMap) { // Renamed 'onAdd' to 'addToMap', 'map' to 'activeMap'
		if (!activeMap) {
            console.warn("Attempted to add overlay to a null map.");
            return;
        }

        if (this._currentMap === activeMap) {
            // Already added to this map, prevent re-addition issues
            return;
        }

		this._currentMap = activeMap; // Renamed '_map' to '_currentMap'

		// Determine the rendering pane based on the origin object type
		this._renderPane = (this._originObject instanceof L.Marker) ? activeMap._panes.markerPane : activeMap._panes.popupPane; // Renamed '_pane' to '_renderPane'

		if (!this._elementDiv) { // Renamed '_container' to '_elementDiv'
			this._prepareDomStructure(); // Renamed '_initLayout' to '_prepareDomStructure'
		}

		this._renderPane.appendChild(this._elementDiv);

		this._setupInteractions(); // Renamed '_initInteraction' to '_setupInteractions'

		this._refreshState(); // Renamed '_update' to '_refreshState'

		this.setTransparency(this.config.transparencyLevel); // Renamed 'setOpacity' to 'setTransparency', 'options.opacity' to 'config.transparencyLevel'

		activeMap.on({ // Chained event binding
			'moveend': this._onMapMovementEnd, // Renamed '_onMoveEnd' to '_onMapMovementEnd'
			'viewreset': this._onMapReset // Renamed '_onViewReset' to '_onMapReset'
		}, this);

		if (this._animCapable) {
			activeMap.on('zoomanim', this._handleZoomMotion, this); // Renamed '_zoomAnimation' to '_handleZoomMotion'
		}

		// Touch device specific interaction for closing
		if (L.Browser.touch && !this.config.alwaysVisible) {
			L.DomEvent.on(this._elementDiv, 'click', this.dismiss, this); // Renamed 'close' to 'dismiss'
		}
	},

	removeFromMap: function (activeMap) { // Renamed 'onRemove' to 'removeFromMap', 'map' to 'activeMap'
		if (!this._elementDiv || !this._renderPane) {
            // Nothing to remove or already removed
            return;
        }

        this._renderPane.removeChild(this._elementDiv);

		activeMap.off({ // Off-chaining for multiple events
			zoomanim: this._handleZoomMotion,
			moveend: this._onMapMovementEnd,
			viewreset: this._onMapReset
		}, this);

		this._clearInteractions(); // Renamed '_removeInteraction' to '_clearInteractions'

		this._currentMap = null; // Clear map reference
	},

	updatePosition: function (geoCoordinate) { // Renamed 'setLatLng' to 'updatePosition', 'latlng' to 'geoCoordinate'
		this._geoCoord = L.latLng(geoCoordinate); // Renamed '_latlng' to '_geoCoord'
		if (this._currentMap) {
			this._recalculatePlacement(); // Renamed '_updatePosition' to '_recalculatePlacement'
		}
		return this;
	},

	updateDisplay: function (newContent) { // Renamed 'setContent' to 'updateDisplay', 'content' to 'newContent'
		// Store the current content before updating for comparison
		this._priorContent = this._displayContent; // Renamed '_previousContent' to '_priorContent'
		this._displayContent = newContent; // Renamed '_content' to '_displayContent'

		this._refreshTextDisplay(); // Renamed '_updateContent' to '_refreshTextDisplay'

		return this;
	},

	dismiss: function () { // Renamed 'close' to 'dismiss'
		const currentMap = this._currentMap;

		if (currentMap) {
			if (L.Browser.touch && !this.config.alwaysVisible && this._elementDiv) {
				L.DomEvent.off(this._elementDiv, 'click', this.dismiss);
			}

			currentMap.removeLayer(this);
		}
	},

	adjustRenderDepth: function (renderDepthValue) { // Renamed 'updateZIndex' to 'adjustRenderDepth', 'zIndex' to 'renderDepthValue'
		this._renderDepth = renderDepthValue; // Renamed '_zIndex' to '_renderDepth'

		if (this._elementDiv && renderDepthValue !== undefinedGlobal && renderDepthValue !== null) { // Added null/undefined check
			this._elementDiv.style.zIndex = renderDepthValue;
		}
	},

	setTransparency: function (level) { // Renamed 'setOpacity' to 'setTransparency', 'opacity' to 'level'
		// Ensure transparency level is within valid range [0, 1]
		this.config.transparencyLevel = Math.max(0, Math.min(1, level));

		if (this._elementDiv) {
			L.DomUtil.setOpacity(this._elementDiv, this.config.transparencyLevel);
		}
	},

	_prepareDomStructure: function () { // Renamed '_initLayout' to '_prepareDomStructure'
		const baseClass = 'leaflet-overlay-text'; // New base class name
		const dynamicClasses = `${baseClass} ${this.config.displayClass} leaflet-zoom-animated`; // Renamed 'leaflet-label' to 'leaflet-overlay-text', 'options.className' to 'config.displayClass'
		this._elementDiv = L.DomUtil.create('div', dynamicClasses);
		this.adjustRenderDepth(this._renderDepth); // Ensure z-index is applied during creation
	},

	_refreshState: function () { // Renamed '_update' to '_refreshState'
		if (!this._currentMap || !this._elementDiv) {
            // Guard clause for missing map or element
            console.warn("Attempted to refresh overlay state without a map or DOM element.");
            return;
        }

		this._elementDiv.style.visibility = 'hidden'; // Temporarily hide during update

		this._refreshTextDisplay();
		this._recalculatePlacement();

		this._elementDiv.style.visibility = ''; // Restore visibility
	},

	_refreshTextDisplay: function () { // Renamed '_updateContent' to '_refreshTextDisplay'
		if (!this._displayContent || !this._currentMap || this._lastRenderedContent === this._displayContent) { // Renamed '_prevContent' to '_lastRenderedContent'
			return; // No content, no map, or content hasn't changed
		}

		// Ensure content is a string before attempting to set innerHTML
		if (typeof this._displayContent === 'string' || typeof this._displayContent === 'number') {
            const contentToRender = String(this._displayContent).trim(); // Trim whitespace

			this._elementDiv.innerHTML = contentToRender;

			this._lastRenderedContent = this._displayContent; // Update last rendered content

			this._contentPixelWidth = this._elementDiv.offsetWidth; // Renamed '_labelWidth' to '_contentPixelWidth'
		} else {
            console.warn("Overlay content is not a string or number, ignoring update.");
        }
	},

	_recalculatePlacement: function () { // Renamed '_updatePosition' to '_recalculatePlacement'
		if (!this._currentMap || !this._geoCoord) return; // Guard clause

		const screenPoint = this._currentMap.latLngToLayerPoint(this._geoCoord);

		this._applyPosition(screenPoint); // Renamed '_setPosition' to '_applyPosition'
	},

	_applyPosition: function (screenCoordinates) { // Renamed '_setPosition' to '_applyPosition', 'pos' to 'screenCoordinates'
		const currentMap = this._currentMap;
		const overlayDiv = this._elementDiv;
		const mapCenterPoint = currentMap.latLngToContainerPoint(currentMap.getCenter());
		const overlayScreenPoint = currentMap.layerPointToContainerPoint(screenCoordinates);
		const placement = this.config.placementDirection;
		const contentWidth = this._contentPixelWidth;
		const offsetVector = L.point(this.config.positionOffset);

		let finalPosition = screenCoordinates;
		let isRightPlacement = false;

		// Determine placement dynamically if 'auto'
		if (placement === 'right' || (placement === 'auto' && overlayScreenPoint.x < mapCenterPoint.x)) {
			isRightPlacement = true;
		}

		const rightClass = 'leaflet-overlay-text-right';
		const leftClass = 'leaflet-overlay-text-left';

		if (isRightPlacement) {
			_manageDomClass(overlayDiv, rightClass, true);
			_manageDomClass(overlayDiv, leftClass, false);
			finalPosition = finalPosition.add(offsetVector);
		} else { // Position to the left
			_manageDomClass(overlayDiv, leftClass, true);
			_manageDomClass(overlayDiv, rightClass, false);

			// Calculate left offset: negative x-offset minus content width
			const offsetX = -offsetVector.x - contentWidth;
			finalPosition = finalPosition.add(L.point(offsetX, offsetVector.y));
		}

		L.DomUtil.setPosition(overlayDiv, finalPosition);
	},

	_handleZoomMotion: function (zoomEvent) { // Renamed '_zoomAnimation' to '_handleZoomMotion', 'opt' to 'zoomEvent'
		if (!this._currentMap || !this._geoCoord) return;

		const newPoint = this._currentMap._latLngToNewLayerPoint(this._geoCoord, zoomEvent.zoom, zoomEvent.center).round();

		this._applyPosition(newPoint);
	},

	_onMapMovementEnd: function () { // Renamed '_onMoveEnd' to '_onMapMovementEnd'
		// If animation is off or direction is auto, we need to update position explicitly
		if (!this._animCapable || this.config.placementDirection === 'auto') {
			this._recalculatePlacement();
		}
	},

	_onMapReset: function (eventPayload) { // Renamed '_onViewReset' to '_onMapReset', 'e' to 'eventPayload'
		/* If map resets hard (e.g., projection change), we must fully update the overlay */
		if (eventPayload && eventPayload.hard) {
			this._refreshState();
		}
	},

	_setupInteractions: function () { // Renamed '_initInteraction' to '_setupInteractions'
		if (!this.config.isInteractive || !this._elementDiv) {
            // Nothing to set up or element not ready
            return;
        }

		const elementToInteract = this._elementDiv;
		const interactionEvents = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

		_manageDomClass(elementToInteract, 'leaflet-clickable', true); // Add clickable class

		L.DomEvent.on(elementToInteract, 'click', this._onInteractionClick, this); // Renamed '_onMouseClick' to '_onInteractionClick'

		for (let i = 0; i < interactionEvents.length; i++) {
			L.DomEvent.on(elementToInteract, interactionEvents[i], this._emitDomEvent, this); // Renamed '_fireMouseEvent' to '_emitDomEvent'
		}
	},

	_clearInteractions: function () { // Renamed '_removeInteraction' to '_clearInteractions'
		if (!this.config.isInteractive || !this._elementDiv) {
            // Nothing to clear or element not ready
            return;
        }

		const elementToClear = this._elementDiv;
		const interactionEvents = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

		_manageDomClass(elementToClear, 'leaflet-clickable', false); // Remove clickable class

		L.DomEvent.off(elementToClear, 'click', this._onInteractionClick, this);

		for (let i = 0; i < interactionEvents.length; i++) {
			L.DomEvent.off(elementToClear, interactionEvents[i], this._emitDomEvent, this);
		}
	},

	_onInteractionClick: function (domEvent) { // Renamed '_onMouseClick' to '_onInteractionClick', 'e' to 'domEvent'
		if (this.hasEventListeners(domEvent.type)) {
			L.DomEvent.stopPropagation(domEvent);
		}

		this.fire(domEvent.type, {
			originalEvent: domEvent
		});
	},

	_emitDomEvent: function (domEvent) { // Renamed '_fireMouseEvent' to '_emitDomEvent', 'e' to 'domEvent'
		// Ensure the event originated from this overlay's element
		if (domEvent.target !== this._elementDiv && !this._elementDiv.contains(domEvent.target)) {
            return; // Ignore events not directly on the overlay or its children
        }

        this.fire(domEvent.type, {
			originalEvent: domEvent,
            target: this // Add target for clarity
		});

		// Custom event propagation handling specific to contextmenu and mousedown
		if (domEvent.type === 'contextmenu' && this.hasEventListeners(domEvent.type)) {
			L.DomEvent.preventDefault(domEvent);
		}

        // For all events except mousedown, stop propagation to prevent interference with map events
		if (domEvent.type !== 'mousedown') {
			L.DomEvent.stopPropagation(domEvent);
		} else {
			L.DomEvent.preventDefault(domEvent); // Prevent default browser drag for mousedown
		}
	}
});


// This object serves as a mixin for L.Marker and L.CircleMarker to add text overlay capabilities.
L.MarkerOverlayUtilities = { // Renamed 'L.BaseMarkerMethods' to 'L.MarkerOverlayUtilities'

	displayOverlay: function () { // Renamed 'showLabel' to 'displayOverlay'
		if (this.linkedOverlay && this._currentMap) { // Renamed 'label' to 'linkedOverlay', '_map' to '_currentMap'
			this.linkedOverlay.updatePosition(this._latlng); // Renamed 'setLatLng' to 'updatePosition'
			this._currentMap.showLabel(this.linkedOverlay); // Assuming _currentMap.showLabel still exists
		}

		return this;
	},

	concealOverlay: function () { // Renamed 'hideLabel' to 'concealOverlay'
		if (this.linkedOverlay) {
			this.linkedOverlay.dismiss(); // Renamed 'close' to 'dismiss'
		}
		return this;
	},

	setPersistentVisibility: function (isPersistent) { // Renamed 'setLabelNoHide' to 'setPersistentVisibility', 'noHide' to 'isPersistent'
		if (this._overlayAlwaysVisible === isPersistent) { // Renamed '_labelNoHide' to '_overlayAlwaysVisible'
			return this; // No change needed
		}

		this._overlayAlwaysVisible = isPersistent;

		if (isPersistent) {
			this._uninstallShowHideListeners(); // Renamed '_removeLabelRevealHandlers' to '_uninstallShowHideListeners'
			this.displayOverlay();
		} else {
			this._installShowHideListeners(); // Renamed '_addLabelRevealHandlers' to '_installShowHideListeners'
			this.concealOverlay();
		}
        return this;
	},

	attachOverlay: function (overlayContent, customOptions) { // Renamed 'bindLabel' to 'attachOverlay', 'content' to 'overlayContent', 'options' to 'customOptions'
        if (!overlayContent) {
            console.warn("Attempted to bind an empty overlay. Operation aborted.");
            return this;
        }

		let anchorPoint = this.options.icon ? this.options.icon.options.overlayAnchorOffset : this.options.overlayAnchorOffset; // Renamed 'labelAnchor' to 'overlayAnchorOffset'
		let finalAnchor = L.point(anchorPoint || [0, 0]); // Use array literal for point creation

		// Add base offset from the FloatingTextOverlay default config
		finalAnchor = finalAnchor.add(L.FloatingTextOverlay.prototype.config.positionOffset);

		if (customOptions && customOptions.positionOffset) { // Renamed 'options.offset' to 'customOptions.positionOffset'
			finalAnchor = finalAnchor.add(customOptions.positionOffset);
		}

        // Create a new options object to avoid modifying the original customOptions directly
		const combinedOptions = L.Util.extend({}, customOptions, {positionOffset: finalAnchor}); // Renamed 'offset' to 'positionOffset'

		this._overlayAlwaysVisible = combinedOptions.alwaysVisible; // Renamed 'noHide' to 'alwaysVisible'

		if (!this.linkedOverlay) { // If no overlay is currently bound
			if (!this._overlayAlwaysVisible) {
				this._installShowHideListeners();
			}

            // Bind core lifecycle events for the overlay
			this.on('remove', this.concealOverlay, this)
				.on('move', this._relocateOverlay, this) // Renamed '_moveLabel' to '_relocateOverlay'
				.on('add', this._handleMarkerAddition, this); // Renamed '_onMarkerAdd' to '_handleMarkerAddition'

			this._eventHandlersActive = true; // Renamed '_hasLabelHandlers' to '_eventHandlersActive'
		}

		this.linkedOverlay = new L.FloatingTextOverlay(combinedOptions, this) // Create new overlay instance
			.updateDisplay(overlayContent); // Renamed 'setContent' to 'updateDisplay'

		return this;
	},

	detachOverlay: function () { // Renamed 'unbindLabel' to 'detachOverlay'
		if (this.linkedOverlay) {
			this.concealOverlay();

			this.linkedOverlay = null; // Dereference the overlay

			if (this._eventHandlersActive) {
				if (!this._overlayAlwaysVisible) {
					this._uninstallShowHideListeners();
				}

                // Unbind core lifecycle events
				this.off('remove', this.concealOverlay, this)
					.off('move', this._relocateOverlay, this)
					.off('add', this._handleMarkerAddition, this);
			}

			this._eventHandlersActive = false;
		}
		return this;
	},

	refreshOverlayContent: function (newContent) { // Renamed 'updateLabelContent' to 'refreshOverlayContent'
		if (this.linkedOverlay) {
			this.linkedOverlay.updateDisplay(newContent);
		}
	},

	retrieveOverlay: function () { // Renamed 'getLabel' to 'retrieveOverlay'
		return this.linkedOverlay;
	},

	_handleMarkerAddition: function () { // Renamed '_onMarkerAdd' to '_handleMarkerAddition'
		if (this._overlayAlwaysVisible) {
			this.displayOverlay();
		}
	},

	_installShowHideListeners: function () { // Renamed '_addLabelRevealHandlers' to '_installShowHideListeners'
		this.on('mouseover', this.displayOverlay, this)
			.on('mouseout', this.concealOverlay, this);

		if (L.Browser.touch) {
			this.on('click', this.displayOverlay, this);
		}
	},

	_uninstallShowHideListeners: function () { // Renamed '_removeLabelRevealHandlers' to '_uninstallShowHideListeners'
		this.off('mouseover', this.displayOverlay, this)
			.off('mouseout', this.concealOverlay, this);

		if (L.Browser.touch) {
			this.off('click', this.displayOverlay, this);
		}
	},

	_relocateOverlay: function (eventData) { // Renamed '_moveLabel' to '_relocateOverlay', 'e' to 'eventData'
		if (this.linkedOverlay && eventData && eventData.latlng) { // Added check for eventData and latlng
            this.linkedOverlay.updatePosition(eventData.latlng);
        }
	}
};

// Extend L.Icon.Default with a new option for overlay positioning
L.Icon.Default.mergeOptions({
	overlayAnchorOffset: new L.Point(9, -20) // Renamed 'labelAnchor' to 'overlayAnchorOffset'
});

// Important: Since Leaflet loads before this plugin, L.Marker.options.icon might miss our mixin.
// We explicitly merge options and include the mixin here.
L.Marker.mergeOptions({
	icon: new L.Icon.Default()
});

L.Marker.include(L.MarkerOverlayUtilities);
L.Marker.include({
	_baseUpdateDepth: L.Marker.prototype._updateZIndex, // Renamed '_originalUpdateZIndex' to '_baseUpdateDepth'

	_updateZIndex: function (depthOffset) { // Renamed 'offset' to 'depthOffset'
		const currentZIndex = this._zIndex + depthOffset;

		this._baseUpdateDepth(depthOffset); // Call original method

		if (this.linkedOverlay) {
			this.linkedOverlay.adjustRenderDepth(currentZIndex); // Renamed 'updateZIndex' to 'adjustRenderDepth'
		}
	},

	_baseSetTransparency: L.Marker.prototype.setOpacity, // Renamed '_originalSetOpacity' to '_baseSetTransparency'

	setOpacity: function (markerOpacity, overlayPartialTransparency) { // Renamed 'opacity' to 'markerOpacity', 'labelHasSemiTransparency' to 'overlayPartialTransparency'
		this.options.overlayPartialTransparency = overlayPartialTransparency; // Store new property

		this._baseSetTransparency(markerOpacity);
	},

	_baseRefreshTransparency: L.Marker.prototype._updateOpacity, // Renamed '_originalUpdateOpacity' to '_baseRefreshTransparency'

	_updateOpacity: function () {
		const absoluteOverlayOpacity = (this.options.opacity === 0) ? 0 : 1; // Explicitly determine absolute opacity for overlay

		this._baseRefreshTransparency(); // Call original method

		if (this.linkedOverlay) {
            const finalOverlayOpacity = this.options.overlayPartialTransparency ? this.options.opacity : absoluteOverlayOpacity;
			this.linkedOverlay.setTransparency(finalOverlayOpacity); // Renamed 'setOpacity' to 'setTransparency'
		}
	},

	_baseSetGeoCoordinate: L.Marker.prototype.setLatLng, // Renamed '_originalSetLatLng' to '_baseSetGeoCoordinate'

	setLatLng: function (newGeoCoordinate) { // Renamed 'latlng' to 'newGeoCoordinate'
		if (this.linkedOverlay && !this._overlayAlwaysVisible) {
			this.concealOverlay(); // Hide overlay if not always visible
		}

		return this._baseSetGeoCoordinate(newGeoCoordinate); // Call original method
	}
});

// Extend L.CircleMarker with a new option for overlay positioning
L.CircleMarker.mergeOptions({
	overlayAnchorOffset: new L.Point(0, 0) // Renamed 'labelAnchor' to 'overlayAnchorOffset'
});

L.CircleMarker.include(L.MarkerOverlayUtilities);

L.Path.include({
	attachOverlay: function (overlayContent, customOptions) { // Renamed 'bindLabel' to 'attachOverlay'
		if (!this.linkedOverlay || this.linkedOverlay.config !== customOptions) { // Renamed 'label' to 'linkedOverlay', 'options' to 'config'
			this.linkedOverlay = new L.FloatingTextOverlay(customOptions, this);
		}

		this.linkedOverlay.updateDisplay(overlayContent); // Renamed 'setContent' to 'updateDisplay'

		if (!this._overlayEventsAttached) { // Renamed '_showLabelAdded' to '_overlayEventsAttached'
			this.on('mouseover', this._displayAssociatedOverlay, this) // Renamed '_showLabel' to '_displayAssociatedOverlay'
				.on('mousemove', this._relocateOverlay, this) // Renamed '_moveLabel' to '_relocateOverlay'
				.on('mouseout remove', this._hideAssociatedOverlay, this); // Renamed '_hideLabel' to '_hideAssociatedOverlay'

			if (L.Browser.touch) {
				this.on('click', this._displayAssociatedOverlay, this);
			}
			this._overlayEventsAttached = true;
		}

		return this;
	},

    // New method for Path overlays to explicitly display
    _displayAssociatedOverlay: function (eventData) {
        if (this.linkedOverlay) {
            // Path labels usually follow mouse, so update position on display
            if (eventData && eventData.latlng) {
                this.linkedOverlay.updatePosition(eventData.latlng);
            }
            this.linkedOverlay.addToMap(this._map); // Add to map if not already
            this.linkedOverlay._isVisible = true;
        }
    },

    // New method for Path overlays to explicitly hide
    _hideAssociatedOverlay: function () {
        if (this.linkedOverlay) {
            this.linkedOverlay.removeFromMap(this._map);
            this.linkedOverlay._isVisible = false;
        }
    }
});

}(window, document));