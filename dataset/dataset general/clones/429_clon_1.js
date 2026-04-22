L.Polyline.Measure = L.Draw.Polyline.extend(
    {
        // This method is called when the drawing tool is activated.
        addHooks: function()
            {
                // Call the parent class's addHooks method to ensure base functionality.
                L.Draw.Polyline.prototype.addHooks.call(this);


                // Check if the map instance is available.
                if (
                    this._map
                )
                    {
                        // Initialize a new LayerGroup for markers.
                        this._markerGroup = new L.LayerGroup();

                        // Add the marker group to the map.
                        this._map.addLayer(this._markerGroup);


                        // Initialize an empty array to store individual markers.
                        this._markers = [];

                        // Listen for 'click' events on the map,
                        // binding them to the _onClick handler.
                        this._map.on('click',
                                     this._onClick,
                                     this
                                    );


                        // Begin the shape drawing process.
                        this._startShape();
                    }
            },


        removeHooks: function ()
            {
                // Call the parent class's removeHooks method.
                L.Draw.Polyline.prototype.removeHooks.call(this);

                // Clear any pending error timeout.
                this._clearHideErrorTimeout();

                // Note: The original comment here was "!\ Still useful when control is disabled before any drawing (refactor needed?)".
                // This part ensures that the mousemove listener is removed, even if drawing hadn't fully started.
                this._map.off('mousemove', this._onMouseMove);

                // Clear any drawing guides or visual aids.
                this._clearGuides();

                // Reset the cursor style of the container.
                this._container.style.cursor = '';

                // Remove the currently drawn shape from the map.
                this._removeShape();


                // Remove the 'click' event listener from the map.
                this._map.off('click', this._onClick, this);
            },


        _startShape: function()
            {
                // Set the drawing state to true.
                this._drawing = true;

                // Create a new Polyline instance with no points initially.
                this._poly = new L.Polyline(
                                            [],
                                            this.options.shapeOptions
                                           );


                // Change the cursor to a crosshair to indicate drawing mode.
                this._container.style.cursor = 'crosshair';

                // Update the tooltip to reflect the current drawing state.
                this._updateTooltip();

                // Add a 'mousemove' listener to the map for drawing updates.
                this._map.on('mousemove',
                             this._onMouseMove,
                             this
                            );
            },


        _finishShape: function ()
            {
                // Set the drawing state to false, indicating completion.
                this._drawing = false;

                // Perform any necessary cleanup for the shape.
                this._cleanUpShape();

                // Clear any visual guides that were displayed during drawing.
                this._clearGuides();


                // Update the tooltip, likely to show final measurements or clear text.
                this._updateTooltip();

                // Remove the 'mousemove' listener from the map, as drawing is finished.
                this._map.off('mousemove', this._onMouseMove, this);

                // Reset the cursor style to default.
                this._container.style.cursor = '';
            },


        _removeShape: function()
            {
                // If there's no polyline currently drawn, exit early.
                if (
                    !this._poly
                )
                    { return; }

                // Remove the polyline layer from the map.
                this._map.removeLayer(this._poly);

                // Delete the reference to the polyline.
                delete this._poly;

                // Clear all elements from the markers array.
                this._markers.splice(0);

                // Clear all layers (markers) from the marker group.
                this._markerGroup.clearLayers();
            },


        _onClick: function(e)
            {
                // If not currently drawing, reset and start a new shape.
                if (
                    !this._drawing
                )
                    {
                        this._removeShape(); // Remove any existing partial shape.
                        this._startShape();  // Begin a new drawing sequence.
                        return;              // Exit the function.
                    }
            },


        _getTooltipText: function()
            {
                // Get the default tooltip text from the parent class.
                var labelText = L.Draw.Polyline.prototype._getTooltipText.call(this);

                // If not currently drawing, clear the tooltip text.
                if (
                    !this._drawing
                )
                    {
                        labelText.text = ''; // Set text to an empty string.
                    }

                // Return the modified (or unmodified) label text.
                return labelText;
            }
    }
);


L.Control.MeasureControl = L.Control.extend(
    {
        // Static properties for the control.
        statics:
            {
                TITLE: 'Measure distances' // Title for the control button.
            },

        // Default options for the control.
        options:
            {
                position: 'topleft', // Position on the map.
                handler: {}          // Options to pass to the L.Polyline.Measure handler.
            },


        // Method to toggle the measurement handler's state.
        toggle: function()
            {
                // Check if the handler is currently enabled.
                if (
                    this.handler.enabled()
                )
                    {
                        // If enabled, disable it.
                        this.handler.disable.call(this.handler);
                    }
                else
                    {
                        // If disabled, enable it.
                        this.handler.enable.call(this.handler);
                    }
            },


        onAdd: function(map)
            {
                // Define the base class name for the control.
                var className = 'leaflet-control-draw';

                // Create the main container div for the control.
                this._container = L.DomUtil.create(
                                                  'div',
                                                  'leaflet-bar'
                                                 );

                // Instantiate the Polyline Measure handler.
                this.handler = new L.Polyline.Measure(
                                                     map,
                                                     this.options.handler
                                                    );

                // Attach an event listener for when the handler is enabled.
                this.handler.on(
                                'enabled',
                                function ()
                                    {
                                        L.DomUtil.addClass(this._container, 'enabled');
                                    },
                                this
                               );

                // Attach an event listener for when the handler is disabled.
                this.handler.on(
                                'disabled',
                                function ()
                                    {
                                        L.DomUtil.removeClass(this._container, 'enabled');
                                    },
                                this
                               );

                // Create the 'a' element (link) for the measure button.
                var link = L.DomUtil.create(
                                           'a',
                                           className + '-measure',
                                           this._container
                                          );

                // Set the href attribute.
                link.href = '#';

                // Set the title for accessibility and hover text.
                link.title = L.Control.MeasureControl.TITLE;

                // Add multiple event listeners to the link using a chain.
                L.DomEvent
                    .addListener(link, 'click', L.DomEvent.stopPropagation) // Prevent event bubbling.
                    .addListener(link, 'click', L.DomEvent.preventDefault)  // Prevent default link behavior.
                    .addListener(link, 'click', this.toggle, this);         // Call the toggle method.

                // Return the control's container element.
                return this._container;
            }
    }
);


// Merge default options into L.Map.
L.Map.mergeOptions(
    {
        measureControl: false // Default to not having a measure control.
    }
);


// Add an initialization hook to L.Map.
L.Map.addInitHook(
    function ()
        {
            // If the map's options enable measureControl, create and add it.
            if (
                this.options.measureControl
            )
                {
                    this.measureControl = L.Control.measureControl().addTo(this);
                }
        }
);


// Factory function for creating a new MeasureControl instance.
L.Control.measureControl = function (options)
    {
        return new L.Control.MeasureControl(options);
    };