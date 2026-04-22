/*******************************************************************************
 * This file, `pxChkr.js`, provides pixel-checking utilities for `pXY.js`.
 *
 * Copyright (c) 2012, Leon Sorokin
 * All rights reserved.
 *
 * This software is licensed under the MIT License.
 * For more details, please see the accompanying LICENSE file or visit:
 * http://opensource.org/licenses/MIT
 ******************************************************************************/

// The main constructor function for the pixel checker.
function pxChkr(cfg, pxy)
{
    // Perform a quick but effective deep copy of the configuration object.
    this.cfg = JSON.parse( JSON.stringify( cfg ) );
    this.pxy = pxy; // Reference to the pXY instance.

    this.pxs = [ ]; // Array to store captured pixel data.
    this.res = [ ]; // Array to store check results.

    // Initialize the checker by processing configurations.
    this.init();
}

// Immediately Invoked Function Expression (IIFE) to encapsulate helper functions
// and module definitions, preventing global scope pollution.
(function()
{
    /**
     * Helper function to check if a numeric value falls within a specified range.
     * @param {number} val - The value to check.
     * @param {number} min - The minimum allowed value (inclusive).
     * @param {number} max - The maximum allowed value (inclusive).
     * @returns {boolean} - True if `val` is within `[min, max]`, false otherwise.
     */
    function inRange( val, min, max )
    {
        return !( val < min || val > max );
    }

    // Expose the `inRange` utility function directly on the `pxChkr` constructor
    // for potential external use or testing.
    pxChkr.inRange = inRange;

    // Define a collection of modules, where each module can contain methods
    // that will be mixed into the `pxChkr` prototype.
    var mods =
    {
        // The 'all' module contains core functionalities applicable to all checks.
        all:
        {
            /**
             * Initializes the checker by processing configuration items.
             * This involves grabbing reference pixels and pre-calculating
             * tolerance ranges for subsequent checks.
             * @returns {pxChkr} - Returns the current instance for chaining.
             */
            init: function init()
            {
                // Iterate through each configuration item to pre-calculate tolerances.
                for ( var i in this.cfg )
                {
                    var cfg = this.cfg[ i ];

                    // Ensure 'off' property exists; default to [0,0] if not provided.
                    if ( !cfg.off )
                        cfg.off = [ 0, 0 ];

                    // Capture the reference pixel data if not already set.
                    if ( !cfg.ref )
                        cfg.ref = this.pxy.px( cfg.off[ 0 ], cfg.off[ 1 ] );

                    // If tolerances are defined, process them.
                    if ( cfg.tol )
                    {
                        this.res[ i ] = {}; // Initialize results object for this config.

                        for ( var j in cfg.tol )
                        {
                            // If tolerance is a single number, convert it to a symmetric range [-val, +val].
                            if ( typeof cfg.tol[ j ] == "number" )
                            {
                                cfg.tol[ j ] = [ -cfg.tol[ j ], cfg.tol[ j ] ];
                            }

                            // Get the reference pixel component value.
                            // If it's a function (like for hue, saturation, lightness), call it.
                            var p = typeof cfg.ref[ j ] === "function" ? cfg.ref[ j ]() : cfg.ref[ j ];

                            // Adjust the tolerance range boundaries based on the reference pixel component.
                            cfg.tol[ j ][ 0 ] += p;
                            cfg.tol[ j ][ 1 ] += p;
                        }
                    }
                }

                return this; // Allow method chaining.
            },

            /**
             * Captures the current pixel data for all configured offsets.
             */
            get: function get()
            {
                var cfg,
                    i = this.cfg.length;

                // Loop backwards for potentially slight performance improvement.
                while ( i-- )
                {
                    cfg = this.cfg[ i ];
                    // Store the captured pixel data in the `pxs` array.
                    this.pxs[ i ] = this.pxy.px( cfg.off[ 0 ], cfg.off[ 1 ] );
                }
            },

            /**
             * Performs the actual pixel checks against the pre-calculated tolerances.
             * @returns {boolean} - True if all checks pass, false otherwise.
             */
            chk: function chk()
            {
                this.get(); // First, capture the current pixel data.

                var chk = true, // Overall check status, assumed true initially.
                    i   = this.cfg.length, // Loop counter.
                    tol, // Reference to current config's tolerance.
                    px,  // Reference to current captured pixel.
                    res; // Reference to current results object.

                // Iterate through the configurations from last to first.
                while ( i-- )
                {
                    tol = this.cfg[ i ].tol;
                    px  = this.pxs[ i ];
                    res = this.res[ i ];

                    // If no tolerances are defined for this config, skip.
                    if ( !tol ) continue;

                    // Iterate through each tolerance component (e.g., 'r', 'g', 'b', 'hue').
                    for ( var q in tol )
                    {
                        // Get the current pixel component value.
                        // This "speed hack" avoids regex for common single-char properties
                        // like 'r', 'g', 'b', 'a' vs. multi-char like 'hue', 'sat', 'lum'.
                        var p = q.length > 1 ? px[ q ]() : px[ q ];

                        // Check if the component value is within its defined range.
                        res[ q ] = inRange( p, tol[ q ][ 0 ], tol[ q ][ 1 ] );

                        // If any check fails, set the overall status to false.
                        if ( !res[ q ] )
                            chk = false;
                    }
                }

                return chk; // Return the overall check result.
            },
        }
    };

    // Combine modules by iterating through them and assigning their methods
    // to the `pxChkr` prototype. This makes the module methods available
    // as instance methods of `pxChkr` objects.
    for ( var i in mods )
    {
        for ( var j in mods[ i ] )
        {
            pxChkr.prototype[ j ] = mods[ i ][ j ];
        }
    }
})();