// This file defines the ContainerQueries utility,
// which helps manage responsive layouts by applying classes
// based on container dimensions rather than viewport.

var ContainerQueries = function ( options ) {

    // Preserve the context of 'this' for callbacks and nested functions.
    var _this = this;

    // Default configuration settings for the ContainerQueries instance.
    var defaults = {
        interval: 500, // Refresh rate in milliseconds. A balance between responsiveness and performance.

        selectors: {
            modules: '.module' // Default CSS selector for elements to be observed.
        },

        suffixes: {
            maxWidth: '--max-width-', // Suffix for classes indicating maximum width. Example: .module--max-width-300
            minWidth: '--min-width-'  // Suffix for classes indicating minimum width. Example: .module--min-width-300
        },

        dataAttrs: {
            name: 'rm-name',          // Data attribute for module name.
            modules: 'rm-modules',    // Data attribute to store child modules.
            container: 'rm-container',// Data attribute to mark an element as a container.
            breakpoints: 'rm-breakpoints',// Data attribute for custom breakpoints.
            widthCache: 'rm-width'    // Data attribute to cache the container's width.
        }
    };

    // Merge default options with any provided custom options.
    this.config = $.extend( {}, defaults, options );

    // Identify and store references to all relevant DOM elements when the component initializes.
    this.cacheElements();


    // Start a recurring process to monitor container dimensions.
    // This self-executing anonymous function sets up a polling mechanism.
    ( function fireWatch() {
        _this.watch(); // Execute the main monitoring logic.
        setTimeout( fireWatch, _this.config.interval ); // Schedule the next execution.
    } )();


    // Attach an event listener to the window's resize event.
    // This ensures immediate updates when the browser window dimensions change.
    $( window ).resize( _.bind( this.watch, this ) );
};


// Define methods for the ContainerQueries prototype.
// These methods encapsulate the core functionality of the utility.
ContainerQueries.prototype = {

    /**
     * The primary monitoring function.
     * It iterates through all tracked containers, recalculates their widths,
     * and updates their associated CSS classes if width changes are detected.
     */
    watch: function () {

        var _this = this; // Capture 'this' context for use within nested functions.
        var $containersForWidth; // Variable to hold the sorted jQuery collection of containers.

        /*
         * Sort containers to ensure parent containers are processed before their children.
         * This prevents issues where a child's width might depend on a parent's applied class,
         * ensuring correct cascade of responsive classes.
         */
        $containersForWidth = $( _.sortBy( this.$containers, function ( v, k ) {
            return $( v ).parents( _this.config.selectors.modules ).length;
        } ) );


        // Iterate over each container in the sorted list.
        $containersForWidth.each( function () {

            var $container = $( this ); // Current container element.
            var width = $container.width(); // Get the current computed width of the container.

            // Check if the current width is different from the previously cached width.
            if ( width !== $container.data( _this.config.dataAttrs.widthCache ) ) {

                // If the width has changed, update the cached width.
                $container.data( _this.config.dataAttrs.widthCache, width );

                // Then, apply or update the responsive query classes for this container's children.
                _this.applyQueryClasses( $container );

            } // End of width change check.

        } ); // End of $containersForWidth.each loop.

    }, // End of watch method.


    /**
     * Initializes the caching of DOM elements.
     * It identifies all modules and their parent containers,
     * storing references and relationships for efficient access later.
     */
    cacheElements: function () {

        var _this = this;      // Reference to the ContainerQueries instance.
        var containers = [];   // Array to temporarily hold unique container elements.

        // Select all elements matching the module selector.
        this.$modules = $( _this.config.selectors.modules );

        // Process each identified module.
        this.$modules.each( function () {

            var $module = $( this );     // The current module element.
            var cachedModule;            // Variable to check if module is already cached.
            var $container = $module.parent(); // The immediate parent of the module, which is considered its container.

            // Retrieve or initialize the array of modules associated with this container.
            var modulesAttr = $container.data( _this.config.dataAttrs.modules ) || [];

            // If the container doesn't have the 'modules' data attribute yet, initialize it as an empty array.
            if ( ! $container.data( _this.config.dataAttrs.modules ) ) {
                $container.data( _this.config.dataAttrs.modules, [] );
            }
            // Otherwise, check if the current module is already in the container's cached list.
            else {
                cachedModule = _.find( $container.data( _this.config.dataAttrs.modules ), function ( v ) {
                    return $( v ) === $module; // Compare jQuery objects.
                } );
            }

            // If the module is not already cached for this container, add it.
            if ( typeof cachedModule === 'undefined' ) {
                modulesAttr.push( $module );
            }

            // Store a reference to the container on the module itself.
            $module.data( _this.config.dataAttrs.modules, $container );

            // Update the container's data to include the (potentially new) list of modules.
            $container.data( _this.config.dataAttrs.modules, modulesAttr );

            // Add the container to our temporary list of all containers.
            containers.push( $container );

        } ); // End of $modules.each loop.

        // Convert the array of containers into a unique jQuery collection, if not already.
        // This.$containers will hold all identified container elements.
        this.$containers = $( containers );

    }, // End of cacheElements method.


    /**
     * Manages the application and removal of dynamic CSS classes
     * based on the container's current width and defined breakpoints.
     *
     * @param {jQuery} $container - The container element whose modules' classes need updating.
     */
    applyQueryClasses: function ( $container ) {

        var _this = this; // Store 'this' for use in callbacks.

        // Retrieve the child modules associated with this container.
        var modules = $container.data( _this.config.dataAttrs.modules );

        // Get the cached width of the container.
        var width = $container.data( _this.config.dataAttrs.widthCache );


        // Process each child module of the given container.
        $.each( modules, function ( k, v ) {

            var $module = $( v );      // The current module being processed.
            var i;                     // Loop counter for breakpoints.
            var newClasses = [];       // Array to store classes that will be applied.

            // First, remove any previously applied dynamic width classes.
            var allClasses = $module.attr( 'class' ).split( ' ' ); // Get all current classes.

            // Filter out classes that match our min-width and max-width suffixes.
            var minClasses = _this.filterClassesBySubString( allClasses, _this.config.suffixes.minWidth );
            var maxClasses = _this.filterClassesBySubString( allClasses, _this.config.suffixes.maxWidth );

            // Remove these identified classes from the module.
            $module.removeClass( minClasses.concat( maxClasses ).join( ' ' ) );

            // Get the base name of the module, used for constructing new class names.
            var moduleName = $module.data( 'rm-name' );


            // Now, apply new classes based on the container's current width and module breakpoints.
            if ( $module.data( _this.config.dataAttrs.breakpoints ) ) {

                // Parse the breakpoints string into an array of numbers.
                // Remove any spaces and split by comma.
                var breakpoints = $module.data( _this.config.dataAttrs.breakpoints ).toString().replace( / /g, '' ).split( ',' );

                // Iterate through each defined breakpoint.
                for ( i = 0; i < breakpoints.length; i++ ) {

                    // If container width is less than the breakpoint, apply a max-width class.
                    if ( width < breakpoints[ i ] ) {
                        newClasses.push( moduleName + _this.config.suffixes.maxWidth + breakpoints[ i ] );
                    }
                    // If container width is greater than or equal to the breakpoint, apply a min-width class.
                    else if ( width >= breakpoints[ i ] ) {
                        newClasses.push( moduleName + _this.config.suffixes.minWidth + breakpoints[ i ] );
                    }

                } // End of for loop through breakpoints.

                // Add all the newly determined classes to the module.
                $module.addClass( newClasses.join( ' ' ) );

            } // End of if condition checking for breakpoints.

        } ); // End of $.each modules loop.

    }, // End of applyQueryClasses method.


    /**
     * Helper function to filter an array of CSS class strings.
     * It returns an array containing only the classes that include a specific substring.
     *
     * @param {Array<string>} classArray - An array of class names.
     * @param {string} substring - The substring to look for within each class name.
     * @returns {Array<string>} An array of matching class names (or empty strings if no match, effectively removing them from join).
     */
    filterClassesBySubString: function ( classArray, substring ) {

        return classArray.map( function ( item ) {

            // If the item contains the substring, return the item; otherwise, return an empty string.
            // This allows concat + join to effectively remove non-matching items.
            return item.indexOf( substring ) !== -1 ? item : "";

        } ); // End of map function.

    } // End of filterClassesBySubString method.

}; // End of ContainerQueries.prototype object.