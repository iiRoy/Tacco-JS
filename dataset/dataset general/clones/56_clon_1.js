/*******************************************************************************
 * Global Variable Declarations for JSHint/ESLint.
 * This comment block specifies global variables that are pre-defined.
 * In this case, 'mocha' is recognized as a global object.
 ******************************************************************************/
/* globals mocha */


// Configure RequireJS for module loading.
// This sets up the base URL and defines shorthand paths for frequently used modules.
require.config ( {

    // The base URL for all module lookups.
    baseUrl :       '/',

    // Define custom paths for modules.
    paths   :       {
        // Path to the 'tabler' library, relative to the baseUrl.
        'tabler'        :   '../',

        // Path to the jQuery library, located in the test directory.
        'jquery'        :   'test/lib/jquery-1.7.1',

        // Path to the Underscore.js library, also in the test directory.
        'underscore'    :   'test/lib/underscore'
    }

} );



// Set up Mocha test environment.
// This configures the UI style and declares global variables expected during tests.
mocha.setup ( {

    // Use the Behavior Driven Development (BDD) interface for Mocha.
    ui      :   'bdd',

    // List of global variables that Mocha should allow without warning.
    globals :   [ 'jQuery' ]

} );



// Load the necessary test modules and then run Mocha.
require (
    [
        'jquery',                           // Ensure jQuery is loaded first.
        'test/tabler.tests',                // General tests for tabler.
        'test/tabler.aggregator.tests',     // Tests for the aggregator module.
        'test/tabler.columnGrouper.tests',  // Tests for column grouping functionality.
        'test/tabler.jumpToPage.tests',     // Tests for the "jump to page" feature.
        'test/tabler.pageSize.tests',       // Tests for page size controls.
        'test/tabler.pager.tests',          // Tests for the pager component.
        'test/tabler.toggleColumns.tests',  // Tests for column visibility toggling.
        'test/tabler.removeColumns.tests',  // Tests for removing columns.
        'test/tabler.sortable.tests',       // Tests for sortable columns.
        'test/tabler.columnGrouper.tests',  // (Duplicate entry, likely intentional for specific test runs or copy-paste error in original)
        'test/performance.tests'            // Performance specific tests.
    ],

    // Callback function to execute once all modules are loaded.
    function ( ) {
        // Enable strict mode for this function scope.
        'use strict';

        // Run all registered Mocha tests.
        mocha.run ( );
    }
);