/*
 * Flot plugin for displaying byte values on axes.
 * This plugin provides custom tick generation and formatting
 * for human-readable byte sizes (e.g., KB, MB, GB).
 * It extends Flot's capabilities to handle data representing
 * file sizes or data transfer rates.
 */
( function ( $ ) {
    "use strict";

    // Default options for the plugin.
    // Currently, there are no specific options defined here,
    // but this object serves as a placeholder for future enhancements.
    var options = { };

    /**
     * Rounds a number down to the nearest lower multiple of a given base.
     * This is useful for calculating tick minimums that align with powers of 1024.
     *
     * @param { number } n    The number to round.
     * @param { number } base The base to use for rounding (e.g., 1024 for bytes).
     * @returns { number } The rounded number.
     *
     * Example: floorInBase(1234, 1024) -> 1024
     * Example: floorInBase(500, 1024) -> 0
     */
    function floorInBase( n, base ) {
        return base * Math.floor( n / base );
    }


    /*
     * Initialization function for the plugin.
     * This function is called by Flot when the plugin is loaded.
     * It hooks into the 'processDatapoints' event to customize axis behavior
     * for any axis configured with 'byte' or 'byteRate' mode.
     */
    function init( plot ) {
        plot.hooks.processDatapoints.push( function ( plot ) {
            // Iterate over each axis configured in the plot instance.
            $.each( plot.getAxes( ), function( axisName, axis ) {

                var opts = axis.options; // Retrieve axis-specific options.

                // Only apply custom logic if the axis mode is "byte" or "byteRate".
                if ( opts.mode === "byte" || opts.mode === "byteRate" ) {

                    // Define a custom tick generator function for this axis.
                    axis.tickGenerator = function ( axis ) {
                        var returnTicks = [ ], // Array to store the generated tick values.
                            tickSize = 2,      // Initial guess for tick interval.
                            delta = axis.delta, // The span of the axis (max - min).
                            steps = 0,         // Counter for divisions by 1024 (determines unit).
                            tickMin = 0,       // The starting value for tick generation.
                            tickVal,           // Current tick value during iteration.
                            tickCount = 0;     // Counter for number of ticks generated.

                        // If the mode is "byteRate", set a flag on the axis for the formatter.
                        if ( opts.mode === "byteRate" ) {
                            axis.rate = true;
                        }

                        // Ensure 'tickDecimals' is a valid number, otherwise default to 2.
                        if ( typeof opts.tickDecimals === "number" ) {
                            axis.tickDecimals = opts.tickDecimals;
                        }
                        else {
                            axis.tickDecimals = 2; // Default precision for byte values.
                        }

                        // Determine the appropriate unit (KB, MB, etc.) by counting 1024-multiples.
                        // This process effectively scales down 'delta' to a manageable range.
                        while ( Math.abs( delta ) >= 1024 ) {
                            steps++;
                            delta /= 1024;
                        }

                        // Calculate an appropriate raw tick size based on the scaled 'delta'.
                        // This loop finds the smallest power of 2 (up to 1024) that is
                        // greater than or equal to the scaled delta.
                        while ( tickSize <= 1024 ) {
                            if ( delta <= tickSize ) {
                                break; // Found a suitable tick size for the scaled delta.
                            }
                            tickSize *= 2; // Double the tick size and try again.
                        }

                        // Apply the calculated tick size, respecting 'minTickSize' option if set.
                        if ( typeof opts.minTickSize !== "undefined" && tickSize < opts.minTickSize ) {
                            axis.tickSize = opts.minTickSize;
                        }
                        else {
                            // Scale the tick size back up by the power of 1024 for the correct unit.
                            axis.tickSize = tickSize * Math.pow( 1024, steps );
                        }

                        // Generate the actual tick values for the axis.
                        tickMin = floorInBase( axis.min, axis.tickSize );
                        do {
                            tickVal = tickMin + ( tickCount++ ) * axis.tickSize;
                            returnTicks.push( tickVal );
                        }
                        while ( tickVal < axis.max );

                        return returnTicks; // Return the array of generated ticks.
                    };

                    // Define a custom tick formatter function for this axis.
                    axis.tickFormatter = function( size, axis ) {
                        var ext,         // String for the unit extension (e.g., " B", " KiB").
                            steps = 0;   // Counter for divisions by 1024.

                        // Scale down the size and count steps to determine the appropriate unit.
                        while ( Math.abs( size ) >= 1024 ) {
                            steps++;
                            size /= 1024;
                        }

                        // Assign the appropriate unit extension based on the 'steps' count.
                        switch ( steps ) {
                            case 0: ext = " B";   break;
                            case 1: ext = " KiB"; break;
                            case 2: ext = " MiB"; break;
                            case 3: ext = " GiB"; break;
                            case 4: ext = " TiB"; break;
                            case 5: ext = " PiB"; break;
                            case 6: ext = " EiB"; break;
                            case 7: ext = " ZiB"; break;
                            case 8: ext = " YiB"; break;
                            // For values exceeding YiB, the raw number will be displayed with " YiB".
                        }

                        // Append "/s" if the axis represents a rate (e.g., " KiB/s").
                        if ( typeof axis.rate !== "undefined" ) {
                            ext += "/s";
                        }

                        // Format the number to the specified decimal places and append the unit.
                        return ( size.toFixed( axis.tickDecimals ) + ext );
                    };
                }
            } );
        } );
    }

    // Register the plugin with Flot's plugin system.
    // This makes the 'byte' plugin available for use in Flot plots.
    $.plot.plugins.push( {
        init: init,      // The plugin's initialization function.
        options: options, // Default options for the plugin.
        name: "byte",    // The unique name of the plugin.
        version: "0.1"   // The version string for the plugin.
    } );

} )( jQuery );