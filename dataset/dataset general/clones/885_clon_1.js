/*
 * Flot plugin for selecting regions on a plot.
 *
 * This powerful plugin extends Flot's core functionality
 * by allowing users to define and interact with
 * rectangular selection areas within a plot.
 *
 * The plugin introduces and configures the following options
 * within the 'selection' object, accessible via plot.getOptions():
 *
 *   selection: {
 *     mode: null or "x" or "y" or "xy", // Defines the selection behavior
 *     color: color                      // Specifies the visual color of the selection rectangle
 *   }
 *
 * Enabling selection functionality is straightforward: simply set the 'mode'
 * option to one of "x", "y", or "xy".
 *
 * - In "x" mode, users can only select a range along the x-axis.
 * - Similarly, in "y" mode, selection is restricted to the y-axis range.
 * - For "xy" mode, the selection becomes a two-dimensional rectangle,
 *   allowing both x and y ranges to be specified simultaneously.
 *
 * The 'color' option determines the appearance of the selection area.
 * If you need to dynamically alter this color after plot initialization,
 * you can access it through `plot.getOptions().selection.color`.
 *
 *
 * Event Handling:
 * When selection support is active, specific events are emitted
 * on the DOM element that was originally passed to the `plot` function.
 *
 * 1. "plotselected" event:
 *    This event is triggered *after* the user has finalized their selection.
 *    The event handler receives a parameter containing the selected ranges
 *    on the axes. Example usage:
 *
 *      placeholder.bind("plotselected", function( event, ranges ) {
 *        alert( "You selected " + ranges.xaxis.from + " to " + ranges.xaxis.to );
 *        // For multiple axes, additional ranges are available in
 *        // x2axis, x3axis, etc., and similarly for y-axes.
 *      });
 *
 * 2. "plotselecting" event:
 *    This event fires *during* the selection process, providing
 *    real-time updates on the selection's progress. It uses the
 *    same parameter structure as the "plotselected" event.
 *    Useful for showing immediate feedback to the user.
 *
 * 3. "plotunselected" event:
 *    This event is emitted when the user clicks the mouse to
 *    clear or remove an existing selection. It carries no arguments.
 *
 *
 * New Plot Object Methods:
 * This plugin also extends the plot object with the following methods
 * for programmatic control over selections:
 *
 * - `setSelection(ranges, preventEvent)`
 *   Allows you to programmatically define the selection rectangle.
 *   The `ranges` argument should be in the same format as returned by
 *   the "plotselected" event.
 *   - If the selection mode is "x", provide an `xaxis` range.
 *   - If the mode is "y", provide a `yaxis` range.
 *   - For "xy" mode, both `xaxis` and `yaxis` ranges are required.
 *   Example:
 *     `setSelection({ xaxis: { from: 0, to: 10 }, yaxis: { from: 40, to: 60 } });`
 *
 *   Calling `setSelection` will, by default, trigger the "plotselected" event.
 *   To suppress this event (e.g., if calling from within a "plotselected" handler),
 *   pass `true` as the second parameter (`preventEvent`).
 *   When using multiple axes, you can specify ranges for any of them (e.g., `x2axis`/`x3axis`
 *   instead of `xaxis`); the plugin will use the first relevant axis it finds.
 *
 * - `clearSelection(preventEvent)`
 *   Removes the current selection rectangle from the plot.
 *   Pass `true` as `preventEvent` to prevent the "plotunselected" event from firing.
 *
 * - `getSelection()`
 *   Retrieves the current selection details. The return format is identical
 *   to the parameter received by the "plotselected" event.
 *   If no selection is currently active, this function returns `null`.
 *
 */

( function ( $ ) {

    // Main initialization function for the plugin.
    // This function is called by Flot when the plot is created.
    function init( plot ) {

        // Internal state for the selection mechanism.
        var selection = {
                first:   { x: -1, y: -1 }, // Coordinates of the first click
                second:  { x: -1, y: -1 }, // Coordinates of the second click or current mouse position
                show:    false,            // Flag to indicate if selection is currently visible
                active:  false             // Flag to indicate if a selection drag is in progress
            };

        // Reference to the Raphael.js rectangle object used for drawing the selection halo.
        var halo = null;

        /*
         * FIXME: The current drag handling implementation here could be
         * significantly improved. There's similar code within the
         * navigation plugin that could be abstracted and reused.
         * Refactoring this would make the selection plugin much leaner
         * and more maintainable.
         */
        var savedhandlers = {}; // Stores original document event handlers to restore them later.

        // Reference to the mouseup handler function, needed for unbinding later.
        var mouseUpHandler = null;


        /**
         * Handles mouse movement events across the plot area.
         * Updates the selection rectangle if a drag operation is active.
         * @param {jQuery.Event} e The mousemove event object.
         */
        function onMouseMove( e ) {
            // Only proceed if a selection is actively being made.
            if ( selection.active ) {
                updateSelection( e ); // Update the visual representation of the selection.

                // Trigger a "plotselecting" event to notify listeners of ongoing selection.
                plot.getPlaceholder().trigger( "plotselecting", [ getSelection() ] );
            }
        }


        /**
         * Handles mouse down events on the plot.
         * Initiates a new selection drag operation.
         * @param {jQuery.Event} e The mousedown event object.
         */
        function onMouseDown( e ) {
            // Ensure only the left mouse button triggers a selection.
            if ( e.which != 1 )
                return;

            // Prevent text selection on the page while dragging.
            document.body.focus();

            // For older browsers, prevent default text selection and drag behavior.
            // Save original handlers if they exist and haven't been saved already.
            if ( document.onselectstart !== undefined && savedhandlers.onselectstart == null ) {
                savedhandlers.onselectstart = document.onselectstart;
                document.onselectstart = function () { return false; };
            }
            if ( document.ondrag !== undefined && savedhandlers.ondrag == null ) {
                savedhandlers.ondrag = document.ondrag;
                document.ondrag = function () { return false; };
            }

            // Record the starting position of the selection.
            setSelectionPos( selection.first, e );

            selection.active = true; // Mark selection as active.

            // Set up a one-time mouseup handler on the document to capture
            // the end of the drag, even if the mouse leaves the plot area.
            // Using a closure ensures we can reference and unbind this specific handler later.
            mouseUpHandler = function ( e ) { onMouseUp( e ); };

            $( document ).one( "mouseup", mouseUpHandler );
        }


        /**
         * Handles mouse up events, signaling the end of a selection operation.
         * Finalizes the selection and triggers relevant events.
         * @param {jQuery.Event} e The mouseup event object.
         */
        function onMouseUp( e ) {
            mouseUpHandler = null; // Clear the reference to the mouseup handler.

            // Restore original document event handlers for old-school browsers.
            if ( document.onselectstart !== undefined )
                document.onselectstart = savedhandlers.onselectstart;
            if ( document.ondrag !== undefined )
                document.ondrag = savedhandlers.ondrag;

            selection.active = false; // Deactivate the selection drag state.
            updateSelection( e );     // Perform a final update based on the mouseup position.

            // Check if the selection made is valid (sane).
            if ( selectionIsSane() )
                triggerSelectedEvent(); // If sane, trigger the final selection event.
            else {
                // If the selection is not sane (e.g., too small),
                // treat it as a clear operation.
                plot.getPlaceholder().trigger( "plotunselected", [ ] );
                plot.getPlaceholder().trigger( "plotselecting",  [ null ] ); // Indicate no selection.
            }

            return false; // Prevent default mouseup behavior.
        }


        /**
         * Retrieves the current selection in an axis-aware format.
         * @returns {Object|null} An object containing 'from' and 'to' for each axis,
         *                        or null if no valid selection exists.
         */
        function getSelection() {
            // If the selection is not valid, return null.
            if ( !selectionIsSane() )
                return null;

            var r  = {},             // Object to store the resulting ranges.
                c1 = selection.first,
                c2 = selection.second;

            // Iterate through all axes of the plot.
            $.each( plot.getAxes(), function ( name, axis ) {
                // Only consider axes that are actually used in the plot.
                if ( axis.used ) {
                    // Convert canvas coordinates to plot coordinates for both selection points.
                    var p1 = axis.c2p( c1[ axis.direction ] ),
                        p2 = axis.c2p( c2[ axis.direction ] );

                    // Store the min and max of the converted coordinates as the range for this axis.
                    r[ name ] = { from: Math.min( p1, p2 ), to: Math.max( p1, p2 ) };
                }
            } );
            return r;
        }


        /**
         * Triggers the "plotselected" event with the current selection data.
         * Also triggers a legacy "selected" event for backward compatibility.
         */
        function triggerSelectedEvent() {
            var r = getSelection(); // Get the current selection ranges.

            // Trigger the primary "plotselected" event.
            plot.getPlaceholder().trigger( "plotselected", [ r ] );

            // Backward-compatibility event (to be removed in future versions).
            // This transforms the new range format into an older x1, y1, x2, y2 format.
            if ( r.xaxis && r.yaxis )
                plot.getPlaceholder().trigger( "selected", [ { x1: r.xaxis.from, y1: r.yaxis.from, x2: r.xaxis.to, y2: r.yaxis.to } ] );
        }


        /**
         * Clamps a value between a minimum and maximum boundary.
         * @param {number} min The minimum allowed value.
         * @param {number} value The value to clamp.
         * @param {number} max The maximum allowed value.
         * @returns {number} The clamped value.
         */
        function clamp( min, value, max ) {
            return value < min ? min : ( value > max ? max : value );
        }


        /**
         * Calculates and sets the canvas coordinates for a selection point.
         * Considers plot offsets and selection mode restrictions.
         * @param {Object} pos The position object (e.g., selection.first or selection.second) to update.
         * @param {jQuery.Event} e The mouse event object containing page coordinates.
         */
        function setSelectionPos( pos, e ) {
            var o          = plot.getOptions();
            var offset     = plot.getPlaceholder().offset();
            var plotOffset = plot.getPlotOffset();

            // Calculate raw coordinates relative to the plot area.
            pos.x = clamp( 0, e.pageX - offset.left - plotOffset.left, plot.width()  );
            pos.y = clamp( 0, e.pageY - offset.top  - plotOffset.top,  plot.height() );

            // Apply mode-specific restrictions.
            // If mode is 'y', the x-coordinate spans the entire plot width.
            if ( o.selection.mode == "y" )
                pos.x = pos == selection.first ? 0 : plot.width();

            // If mode is 'x', the y-coordinate spans the entire plot height.
            if ( o.selection.mode == "x" )
                pos.y = pos == selection.first ? 0 : plot.height();
        }


        /**
         * Updates the visual selection rectangle based on the current mouse position.
         * @param {jQuery.Event} pos The mouse event object or an object with pageX/pageY.
         */
        function updateSelection( pos ) {
            // Only update if valid mouse coordinates are provided.
            if ( pos.pageX == null )
                return;

            setSelectionPos( selection.second, pos ); // Update the second point of the selection.

            // If the updated selection is valid, show it and redraw the overlay.
            if ( selectionIsSane() ) {
                selection.show = true;
                plot.triggerRedrawOverlay();
            }
            else
                clearSelection( true ); // Otherwise, clear the selection silently.
        }


        /**
         * Clears the current selection rectangle from the plot.
         * @param {boolean} preventEvent If true, the "plotunselected" event will not be triggered.
         */
        function clearSelection( preventEvent ) {
            // Only clear if a selection is currently shown.
            if ( selection.show ) {
                selection.show = false;
                plot.triggerRedrawOverlay(); // Redraw the overlay to remove the selection.

                // If not prevented, trigger the "plotunselected" event.
                if ( !preventEvent )
                    plot.getPlaceholder().trigger( "plotunselected", [ ] );
            }
        }


        /**
         * Helper function to extract a single axis range from a 'ranges' object.
         * This function is adapted from Flot's markings support.
         * @param {Object} ranges The ranges object (e.g., from plotselected event).
         * @param {string} coord The coordinate direction ("x" or "y").
         * @returns {Object} An object containing 'from', 'to', and the 'axis' object.
         */
        function extractRange( ranges, coord ) {
            var axis, from, to, key, axes = plot.getAxes();

            // First, try to find the range by iterating through all axes.
            for ( var k in axes ) {
                axis = axes[ k ];
                if ( axis.direction == coord ) {
                    key = coord + axis.n + "axis"; // e.g., "x1axis", "y2axis"
                    // Support "xaxis" as an alias for "x1axis" if "x1axis" is not specified.
                    if ( !ranges[ key ] && axis.n == 1 )
                        key = coord + "axis";
                    if ( ranges[ key ] ) {
                        from = ranges[ key ].from;
                        to   = ranges[ key ].to;
                        break; // Found the range, exit loop.
                    }
                }
            }

            // Backward-compatibility: if not found by axis name, try old "x1", "y1" format.
            // This part is slated for removal in future versions.
            if ( !ranges[ key ] ) {
                axis = coord == "x" ? plot.getXAxes()[ 0 ] : plot.getYAxes()[ 0 ]; // Default to first x/y axis.
                from = ranges[ coord + "1" ];
                to   = ranges[ coord + "2" ];
            }

            // Auto-reverse 'from' and 'to' if they are out of order, ensuring 'from' is always smaller.
            if ( from != null && to != null && from > to ) {
                var tmp = from;
                from = to;
                to   = tmp;
            }

            return { from: from, to: to, axis: axis };
        }


        /**
         * Programmatically sets the selection rectangle.
         * @param {Object} ranges An object defining the desired axis ranges.
         * @param {boolean} preventEvent If true, suppresses the "plotselected" event.
         */
        function setSelection( ranges, preventEvent ) {
            var axis, range, o = plot.getOptions();

            // Handle Y-axis selection mode: X-coordinates span full plot width.
            if ( o.selection.mode == "y" ) {
                selection.first.x  = 0;
                selection.second.x = plot.width();
            }
            else {
                range = extractRange( ranges, "x" ); // Extract the x-axis range.

                // Convert plot coordinates back to canvas coordinates.
                selection.first.x  = range.axis.p2c( range.from );
                selection.second.x = range.axis.p2c( range.to );
            }

            // Handle X-axis selection mode: Y-coordinates span full plot height.
            if ( o.selection.mode == "x" ) {
                selection.first.y  = 0;
                selection.second.y = plot.height();
            }
            else {
                range = extractRange( ranges, "y" ); // Extract the y-axis range.

                // Convert plot coordinates back to canvas coordinates.
                selection.first.y  = range.axis.p2c( range.from );
                selection.second.y = range.axis.p2c( range.to );
            }

            selection.show = true; // Mark selection as visible.
            plot.triggerRedrawOverlay(); // Force a redraw of the overlay.

            // If event is not prevented and selection is valid, trigger the selected event.
            if ( !preventEvent && selectionIsSane() )
                triggerSelectedEvent();
        }


        /**
         * Checks if the current selection rectangle is "sane" (i.e., large enough).
         * @returns {boolean} True if the selection meets the minimum size requirements, false otherwise.
         */
        function selectionIsSane() {
            var minSize = 5; // Minimum dimension (pixels) for a selection to be considered sane.

            // A selection is sane if both its width and height are at least minSize.
            return Math.abs( selection.second.x - selection.first.x ) >= minSize &&
                   Math.abs( selection.second.y - selection.first.y ) >= minSize;
        }


        // Expose new methods on the plot object for external access.
        plot.clearSelection = clearSelection;
        plot.setSelection   = setSelection;
        plot.getSelection   = getSelection;


        // Hook into Flot's event binding mechanism.
        // This function is called when Flot binds its events to the placeholder.
        plot.hooks.bindEvents.push( function( plot, eventHolder ) {
            var o = plot.getOptions();

            // Only bind selection events if a selection mode is specified.
            if ( o.selection.mode != null ) {
                eventHolder.mousemove( onMouseMove ); // Bind mousemove for dragging.
                eventHolder.mousedown( onMouseDown ); // Bind mousedown to start selection.
            }
        } );


        // Hook into Flot's overlay drawing mechanism.
        // This function is called whenever the overlay canvas needs to be redrawn.
        plot.hooks.drawOverlay.push( function ( plot, paper ) {
            // Only draw the selection if it's marked to be shown and is sane.
            if ( selection.show && selectionIsSane() ) {
                var plotOffset = plot.getPlotOffset();
                var o          = plot.getOptions();

                // The following commented-out lines are for a canvas-based drawing context (ctx).
                // They are kept as comments to reflect the original code's structure,
                // which likely supported both canvas and Raphael.js for drawing.
                // ctx.save();
                // ctx.translate(plotOffset.left, plotOffset.top);

                var c = $.color.parse( o.selection.color ); // Parse the selection color.

                // ctx.strokeStyle = c.scale('a', 0.8).toString(); // Border color with alpha.
                // ctx.lineWidth = 1;
                // ctx.lineJoin = "round";
                // ctx.fillStyle = c.scale('a', 0.4).toString();   // Fill color with alpha.

                // Calculate the top-left corner (x, y) and dimensions (width, height)
                // of the selection rectangle.
                var x = Math.min( selection.first.x, selection.second.x ),
                    y = Math.min( selection.first.y, selection.second.y ),
                    w = Math.abs( selection.second.x - selection.first.x ),
                    h = Math.abs( selection.second.y - selection.first.y );

                // ctx.fillRect(x, y, w, h);  // Draw the filled rectangle.
                // ctx.strokeRect(x, y, w, h); // Draw the border.
                //
                // ctx.restore();             // Restore canvas state.

                // Raphael.js specific drawing for the selection halo.
                if ( halo ) {
                    // If halo already exists, just update its attributes.
                    halo.attr( {
                        "x":      x + plotOffset.left,
                        "y":      y + plotOffset.top,
                        "width":  w,
                        "height": h
                    } );
                } else {
                    // If halo doesn't exist, create it.
                    halo = paper.rect( x, y, w, h ).attr( {
                        "stroke":           "#BBBB22",     // Border color.
                        "stroke-opacity":   1,
                        "stroke-width":     1,
                        "stroke-linejoin":  "round",
                        "fill":             "#EEEE22",      // Fill color.
                        "fill-opacity":     0.2             // Fill transparency.
                    } ).translate( plotOffset.left, plotOffset.top ); // Translate to plot area.
                }

            }
        } );

        // Hook into Flot's shutdown mechanism.
        // This function is called when the plot is being destroyed.
        plot.hooks.shutdown.push( function ( plot, eventHolder ) {
            // Unbind all event handlers associated with selection.
            eventHolder.unbind( "mousemove", onMouseMove );
            eventHolder.unbind( "mousedown", onMouseDown );

            // If a mouseup handler was active on the document, unbind it.
            if ( mouseUpHandler )
                $( document ).unbind( "mouseup", mouseUpHandler );
        } );
    }


    // Register the selection plugin with Flot.
    $.plot.plugins.push( {
        init:    init,    // The initialization function for the plugin.
        options: {        // Default options for the selection plugin.
            selection: {
                mode:  null,        // Default mode: no selection.
                                    // Can be "x", "y", or "xy".
                color: "#e8cfac"    // Default color for the selection rectangle.
            }
        },
        name:    'selection', // The name of the plugin.
        version: '1.1'        // The version of the plugin.
    } );

} )( jQuery );