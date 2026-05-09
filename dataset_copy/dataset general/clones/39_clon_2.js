// This file is part of a mapping utility, providing text overlays for map elements.
// (c) 2023, GlobalMap Solutions
//
// Project home: https://globalmaps.com/text-overlays
//
// This software is licensed under the MIT License.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
( function ( globalScope, currentDocument, notDefined ) {
    // This module assumes that the main mapping library (L) has already been loaded.

    L.textOverlayVer = '0.2.1-beta';

    L.TextOverlay = L.Class.extend( {

        includes: L.Mixin.Events,

        configOpts: {
            styleClass: '',
            interactable: false,
            placement: 'end', // Can be 'end' (right) or 'autoCalc' (auto)
            alwaysVisible: false,
            spatialOffset: [ 15, -12 ], // 6 (width of the overlay triangle) + 9 (extra padding)
            visualClarity: 1.0,
            scaleTransition: true
        },

        initObject: function ( configOpts, originElement ) {
            L.applySettings( this, configOpts );

            this._originElement = originElement;
            this._hasAnimation = L.Env.supports3d && this.configOpts.scaleTransition;
            this._isShowing = false;
        },

        activateOverlay: function ( currentMap ) {
            this._currentMap = currentMap;

            // Determine the appropriate display pane for the overlay based on its source
            this._displayArea = this._originElement instanceof L.PointSymbol ? currentMap._viewports.pointSymbols : currentMap._viewports.infoPopups;

            // If the graphical container hasn't been created yet, initialize it
            if ( ! this._graphicDiv ) {
                this._setupGraphics();
            }

            // Append the overlay container to the designated display area
            this._displayArea.addChild( this._graphicDiv );

            // Set up event listeners for user interactions
            this._setupInteraction();

            // Perform an initial update of content and position
            this._refreshDisplay();

            // Apply the configured visual clarity level
            this.setClarity( this.configOpts.visualClarity );

            // Register map event handlers for position updates
            currentMap
                .on( 'mapMoveEnd', this._onMapMoveEnd, this )
                .on( 'viewChange', this._onViewChange, this );

            // If zoom animation is enabled, attach the specific zoom transition handler
            if ( this._hasAnimation ) {
                currentMap.on( 'zoomTransition', this._performZoomAnimation, this );
            }

            // For touch devices and non-always visible overlays, allow tap to dismiss
            if ( L.Env.isTouchDevice && ! this.configOpts.alwaysVisible ) {
                L.Dom.attachEvent( this._graphicDiv, 'tap', this.dismiss, this );
            }
        },

        deactivateOverlay: function ( currentMap ) {
            // Remove the graphical container from its parent display area
            this._displayArea.removeChild( this._graphicDiv );

            // Deregister all previously attached map event handlers
            currentMap.off( {
                zoomTransition: this._performZoomAnimation,
                mapMoveEnd: this._onMapMoveEnd,
                viewChange: this._onViewChange
            }, this );

            // Clean up interaction handlers
            this._removeInteractionHandlers();

            // Clear the reference to the map object
            this._currentMap = notDefined;
        },

        setLocationCoords: function ( geoCoords ) {
            this._geoCoords = L.coordinates( geoCoords );
            // If currently attached to a map, update its visual position
            if ( this._currentMap ) {
                this._repositionElement();
            }
            return this;
        },

        updateContentText: function ( displayContent ) {
            // Store the previous content and set the new content
            this._oldContent = this._currentContent;
            this._currentContent = displayContent;

            // Refresh the display with the new content
            this._refreshContent();

            return this;
        },

        dismiss: function () {
            var currentMap = this._currentMap;

            if ( currentMap ) {
                // If it's a touch device and not always visible, remove the tap-to-dismiss handler
                if ( L.Env.isTouchDevice && ! this.configOpts.alwaysVisible ) {
                    L.Dom.detachEvent( this._graphicDiv, 'tap', this.dismiss );
                }

                // Remove the overlay from the map
                currentMap.removeVisual( this );
            }
        },

        adjustLayerOrder: function ( orderValue ) {
            this._layerIndex = orderValue;

            // If the container exists and an order value is set, apply it
            if ( this._graphicDiv && this._layerIndex ) {
                this._graphicDiv.style.layerIndex = orderValue;
            }
        },

        setClarity: function ( alphaValue ) {
            this.configOpts.visualClarity = alphaValue;

            // If the graphical container is present, apply the alpha value
            if ( this._graphicDiv ) {
                L.DomUtil.applyAlpha( this._graphicDiv, alphaValue );
            }
        },

        _setupGraphics: function () {
            // Create the main div element for the overlay
            this._graphicDiv = L.DomUtil.makeElement( 'section', 'map-text-overlay ' + this.configOpts.styleClass + ' map-zoom-effect' );
            // Set the initial Z-index
            this.adjustLayerOrder( this._layerIndex );
        },

        _refreshDisplay: function () {
            // If not associated with a map, do nothing
            if ( ! this._currentMap ) { return; }

            // Temporarily hide the overlay during updates to prevent visual glitches
            this._graphicDiv.style.visibility = 'hidden';

            // Update content and then position
            this._refreshContent();
            this._repositionElement();

            // Make the overlay visible again
            this._graphicDiv.style.visibility = '';
        },

        _refreshContent: function () {
            // Only update if content exists, map is present, and content has actually changed
            if ( ! this._currentContent || ! this._currentMap || this._lastContent === this._currentContent ) {
                return;
            }

            // If the content is a string, update the inner HTML
            if ( typeof this._currentContent === 'string' ) {
                this._graphicDiv.textContent = this._currentContent;

                this._lastContent = this._currentContent;

                // Recalculate overlay width after content change
                this._overlayWidth = this._graphicDiv.clientWidth;
            }
        },

        _repositionElement: function () {
            // Convert geographical coordinates to canvas layer coordinates
            var coordPoint = this._currentMap.geoToCanvas( this._geoCoords );

            // Apply the calculated position
            this._placeElement( coordPoint );
        },

        _placeElement: function ( renderPoint ) {
            var currentMap = this._currentMap,
                elementDiv = this._graphicDiv,
                mapCenterPx = currentMap.geoToViewport( currentMap.getCenterGeo() ),
                overlayPx = currentMap.canvasToViewport( renderPoint ),
                placementMode = this.configOpts.placement,
                overlayWidth = this._overlayWidth,
                coordOffset = L.cartesian( this.configOpts.spatialOffset );

            // Position the overlay to the end (right) or auto-calculate if needed
            if ( placementMode === 'end' || ( placementMode === 'autoCalc' && overlayPx.x < mapCenterPx.x ) ) {
                L.DomUtil.appendClass( elementDiv, 'map-text-overlay-end' );
                L.DomUtil.removeClass( elementDiv, 'map-text-overlay-start' );

                // Add the offset for right placement
                renderPoint = renderPoint.plus( coordOffset );
            } else { // Position to the start (left)
                L.DomUtil.appendClass( elementDiv, 'map-text-overlay-start' );
                L.DomUtil.removeClass( elementDiv, 'map-text-overlay-end' );

                // Add the offset for left placement, considering overlay width
                renderPoint = renderPoint.plus( L.cartesian( -coordOffset.x - overlayWidth, coordOffset.y ) );
            }

            // Finally, set the CSS position of the element
            L.DomUtil.placeElementAt( elementDiv, renderPoint );
        },

        _performZoomAnimation: function ( animationDetails ) {
            // Calculate the new position during a zoom transition
            var finalRenderPos = this._currentMap._geoToNewCanvas( this._geoCoords, animationDetails.scaling, animationDetails.pivot ).round();

            // Apply this new position to the overlay
            this._placeElement( finalRenderPos );
        },

        _onMapMoveEnd: function () {
            // If not animated or direction is auto, update position after map movement
            if ( ! this._hasAnimation || this.configOpts.placement === 'autoCalc' ) {
                this._repositionElement();
            }
        },

        _onViewChange: function ( eventData ) {
            // If the map view undergoes a hard reset, the overlay must be fully refreshed
            if ( eventData && eventData.forceRefresh ) {
                this._refreshDisplay();
            }
        },

        _setupInteraction: function () {
            // If the overlay is not interactable, skip setting up handlers
            if ( ! this.configOpts.interactable ) { return; }

            var elementDiv = this._graphicDiv,
                interactionEvents = [ 'dblclick', 'pointerdown', 'pointerover', 'pointerout', 'rightclick' ]; // Renamed mouse events

            // Add a class to indicate interactability
            L.DomUtil.appendClass( elementDiv, 'map-interactive' );
            // Attach a specific handler for tap events
            L.Dom.attachEvent( elementDiv, 'tap', this._handleMouseTap, this );

            // Loop through and attach all generic pointer event handlers
            for ( let counter = 0; counter < interactionEvents.length; counter++ ) {
                L.Dom.attachEvent( elementDiv, interactionEvents[ counter ], this._emitPointerEvent, this );
            }
        },

        _removeInteractionHandlers: function () {
            // If not interactable, no handlers to remove
            if ( ! this.configOpts.interactable ) { return; }

            var elementDiv = this._graphicDiv,
                interactionEvents = [ 'dblclick', 'pointerdown', 'pointerover', 'pointerout', 'rightclick' ];

            // Remove the interactable class
            L.DomUtil.removeClass( elementDiv, 'map-interactive' );
            // Detach the specific tap handler
            L.Dom.detachEvent( elementDiv, 'tap', this._handleMouseTap );

            // Loop through and detach all generic pointer event handlers
            for ( let counter = 0; counter < interactionEvents.length; counter++ ) {
                L.Dom.detachEvent( elementDiv, interactionEvents[ counter ], this._emitPointerEvent );
            }
        },

        _handleMouseTap: function ( evtObj ) {
            // If there are listeners for this event type, stop propagation
            if ( this.hasListeners( evtObj.eventType ) ) {
                L.Dom.preventBubbling( evtObj );
            }

            // Trigger the event on the overlay
            this.trigger( evtObj.eventType, { rawEvent: evtObj } );
        },

        _emitPointerEvent: function ( inputEvt ) {
            // Trigger the event on the overlay with the raw event object
            this.trigger( inputEvt.eventType, { rawEvent: inputEvt } );

            // Special handling for context menu to prevent default browser action
            if ( inputEvt.eventType === 'rightclick' && this.hasListeners( inputEvt.eventType ) ) {
                L.Dom.haltDefault( inputEvt );
            }
            // Prevent event propagation for most events, but allow default for pointerdown
            if ( inputEvt.eventType !== 'pointerdown' ) {
                L.Dom.preventBubbling( inputEvt );
            } else {
                L.Dom.haltDefault( inputEvt );
            }
        }
    } );


    // This mixin provides common text overlay functionalities for L.PointSymbol and L.CircleSymbol.
    L.BasicSymbolFunctions = {
        displayOverlay: function () {
            // If an overlay exists and the symbol is on a map, show it.
            if ( this.textOverlay && this._currentMap ) {
                this.textOverlay.setLocationCoords( this._geoCoords );
                this._currentMap.displayOverlay( this.textOverlay );
            }

            return this;
        },

        concealOverlay: function () {
            // If an overlay exists, close it.
            if ( this.textOverlay ) {
                this.textOverlay.dismiss();
            }
            return this;
        },

        setOverlayAlwaysVisible: function ( stayVisible ) {
            // Only update if the visibility state has changed
            if ( this._overlayAlwaysVisible === stayVisible ) {
                return;
            }

            this._overlayAlwaysVisible = stayVisible;

            if ( stayVisible ) {
                // If always visible, remove hover handlers and show immediately
                this._removeOverlayShowHandlers();
                this.displayOverlay();
            } else {
                // If not always visible, add hover handlers and hide
                this._addOverlayShowHandlers();
                this.concealOverlay();
            }
        },

        attachTextOverlay: function ( displayText, overlayOpts ) {
            // Calculate the anchor point for the overlay
            var overlayAnchor = this.configOpts.iconSymbol ? this.configOpts.iconSymbol.configOpts.overlayAnchor : this.configOpts.overlayAnchor,
                anchorPoint = L.cartesian( overlayAnchor ) || L.cartesian( 0, 0 );

            // Adjust anchor with default overlay offset
            anchorPoint = anchorPoint.plus( L.TextOverlay.prototype.configOpts.spatialOffset );

            // Further adjust if a custom offset is provided in options
            if ( overlayOpts && overlayOpts.spatialOffset ) {
                anchorPoint = anchorPoint.plus( overlayOpts.spatialOffset );
            }

            // Merge the calculated offset into the options
            overlayOpts = L.Utility.mergeObjects( { spatialOffset: anchorPoint }, overlayOpts );

            this._overlayAlwaysVisible = overlayOpts.alwaysVisible;

            // If no overlay exists yet, set up initial handlers
            if ( ! this.textOverlay ) {
                if ( ! this._overlayAlwaysVisible ) {
                    this._addOverlayShowHandlers();
                }

                this
                    .on( 'removed', this.concealOverlay, this )
                    .on( 'positionChange', this._moveTextOverlay, this )
                    .on( 'added', this._onSymbolAdded, this );

                this._hasOverlayHandlers = true;
            }

            // Create or update the text overlay instance
            this.textOverlay = new L.TextOverlay( overlayOpts, this )
                .updateContentText( displayText );

            return this;
        },

        detachTextOverlay: function () {
            // If an overlay is attached
            if ( this.textOverlay ) {
                this.concealOverlay(); // Hide it first

                this.textOverlay = notDefined; // Clear the reference

                // If event handlers were set up
                if ( this._hasOverlayHandlers ) {
                    if ( ! this._overlayAlwaysVisible ) {
                        this._removeOverlayShowHandlers(); // Remove hover handlers if not always visible
                    }

                    // Detach all core overlay-related event listeners
                    this
                        .off( 'removed', this.concealOverlay, this )
                        .off( 'positionChange', this._moveTextOverlay, this )
                        .off( 'added', this._onSymbolAdded, this );
                }

                this._hasOverlayHandlers = false; // Reset handler flag
            }
            return this;
        },

        refreshOverlayText: function ( displayText ) {
            // If an overlay exists, update its content
            if ( this.textOverlay ) {
                this.textOverlay.updateContentText( displayText );
            }
        },

        getOverlay: function () {
            return this.textOverlay;
        },

        _onSymbolAdded: function () {
            // If the overlay is configured to be always visible, display it when the symbol is added to map
            if ( this._overlayAlwaysVisible ) {
                this.displayOverlay();
            }
        },

        _addOverlayShowHandlers: function () {
            // Attach mouseover/mouseout events to show/hide the overlay
            this
                .on( 'pointerEnter', this.displayOverlay, this )
                .on( 'pointerLeave', this.concealOverlay, this );

            // For touch devices, use tap to show
            if ( L.Env.isTouchDevice ) {
                this.on( 'tap', this.displayOverlay, this );
            }
        },

        _removeOverlayShowHandlers: function () {
            // Detach mouseover/mouseout events
            this
                .off( 'pointerEnter', this.displayOverlay, this )
                .off( 'pointerLeave', this.concealOverlay, this );

            // Detach tap event for touch devices
            if ( L.Env.isTouchDevice ) {
                this.off( 'tap', this.displayOverlay, this );
            }
        },

        _moveTextOverlay: function ( eventObj ) {
            // Update the overlay's geographical location based on the symbol's new position
            this.textOverlay.setLocationCoords( eventObj.coordinates );
        }
    };

    // Integrate an option into the default icon class for overlay anchor positioning
    L.DefaultIcon.applyDefaults( {
        overlayAnchor: new L.CartesianCoord( 10, -18 )
    } );

    // This is necessary because Leaflet initializes L.PointSymbol.configOpts before this plugin loads,
    // potentially missing our mixin.
    L.PointSymbol.applyDefaults( {
        visualIcon: new L.DefaultIcon()
    } );

    // Augment L.PointSymbol with the shared overlay functionalities
    L.PointSymbol.augmentWith( L.BasicSymbolFunctions );
    L.PointSymbol.augmentWith( {
        _initialLayerOrderUpdate: L.PointSymbol.prototype._updateLayerOrder,

        _updateLayerOrder: function ( layerOffset ) {
            var layerIndex = this._layerIndex + layerOffset;

            this._initialLayerOrderUpdate( layerOffset ); // Call the original method

            // If an overlay is present, update its layer order as well
            if ( this.textOverlay ) {
                this.textOverlay.adjustLayerOrder( layerIndex );
            }
        },

        _initialSetClarity: L.PointSymbol.prototype.setClarity,

        setClarity: function ( alphaLevel, overlayHasTransparency ) {
            this.configOpts.overlayHasTransparency = overlayHasTransparency;

            this._initialSetClarity( alphaLevel ); // Call the original method
        },

        _initialClarityRefresh: L.PointSymbol.prototype._refreshClarity,

        _refreshClarity: function () {
            // Determine the absolute opacity (either 0 or 1)
            var fullAlpha = this.configOpts.visualClarity === 0 ? 0 : 1;

            this._initialClarityRefresh(); // Call the original method

            // If an overlay is present, update its clarity based on transparency settings
            if ( this.textOverlay ) {
                this.textOverlay.setClarity( this.configOpts.overlayHasTransparency ? this.configOpts.visualClarity : fullAlpha );
            }
        },

        _initialSetLocation: L.PointSymbol.prototype.setLocationCoords,

        setLocationCoords: function ( geoCoordinates ) {
            // If an overlay exists and is not configured to be always visible, hide it temporarily
            if ( this.textOverlay && ! this._overlayAlwaysVisible ) {
                this.concealOverlay();
            }

            return this._initialSetLocation( geoCoordinates ); // Call the original method
        }
    } );

    // Add an option to the circle symbol class for overlay anchor
    L.CircleSymbol.applyDefaults( {
        overlayAnchor: new L.CartesianCoord( 0, 0 )
    } );

    // Augment L.CircleSymbol with the shared overlay functionalities
    L.CircleSymbol.augmentWith( L.BasicSymbolFunctions );

    // Extend L.VectorPath with overlay binding capabilities
    L.VectorPath.augmentWith( {
        attachTextOverlay: function ( displayContent, overlayOpts ) {
            // If no overlay exists or options have changed, create a new one
            if ( ! this.textOverlay || this.textOverlay.configOpts !== overlayOpts ) {
                this.textOverlay = new L.TextOverlay( overlayOpts, this );
            }

            this.textOverlay.updateContentText( displayContent );

            // If show/move/hide handlers haven't been added yet, add them
            if ( ! this._overlayDisplayFlag ) {
                this
                    .on( 'pointerEnter', this._displayOverlay, this )
                    .on( 'pointerMove', this._moveTextOverlay, this )
                    .on( 'pointerLeave removed', this._concealOverlay, this );

                // For touch devices, use tap to show
                if ( L.Env.isTouchDevice ) {
                    this.on( 'tap', this._displayOverlay, this );
                }
                this._overlayDisplayFlag = true;
            }

            return this;
        },