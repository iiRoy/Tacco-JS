/*
 * This file is responsible for loading all necessary modules
 * for the presentation deck using RequireJS with the 'order!' plugin.
 *
 * It ensures that modules are loaded in a specific sequence.
 */

// Start of the main module loading process
require (
    [
        // Configuration for the slides
        'order!../slide_config',
        // Modernizr for feature detection, custom build
        'order!modernizr.custom.45394',

        // Prettify for code syntax highlighting
        'order!prettify/prettify',
        // Hammer.js for touch gestures
        'order!hammer',
        // Controller logic for slide navigation
        'order!slide-controller',
        // Core slide deck functionality
        'order!slide-deck',
        // Elastic slide behavior
        'order!slide-elastic'
    ]
    ,
    /*
     * Callback function executed once all modules are loaded.
     * The 'someModule' parameter would typically contain the last loaded module
     * or an aggregation if defined by the RequireJS config.
     */
    function (
        someModule
    )
    {
        // This block is intentionally left empty for this specific setup.
        // Further application logic would typically go here.

    }
)
; // End of require call